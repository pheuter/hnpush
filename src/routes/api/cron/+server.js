import { dev } from '$app/environment';
import { CRON_SECRET } from '$env/static/private';
import { fetchTopStories, fetchStory } from '$lib/server/hn';
import { redis } from '$lib/server/redis';
import { sendPushNotifications } from '$lib/server/push';

export const GET = async ({ request }) => {
	// Verify cron secret
	if (!dev && request.headers.get('Authorization') !== `Bearer ${CRON_SECRET}`) {
		return new Response('Unauthorized', { status: 401 });
	}

	try {
		// Fetch just the IDs of latest top stories (no details yet)
		const latestStoryIds = await fetchTopStories(10);

		// Get the set of story IDs we've already sent notifications for
		const sentStories = await redis.smembers('sent_story_ids');

		// Filter for new story IDs we haven't sent notifications for
		const newStoryIds = latestStoryIds.filter(
			(id) => !sentStories.includes(id.toString()) && !sentStories.includes(id)
		);

		if (newStoryIds.length > 0) {
			// Get all subscriptions
			const subscriptionKeys = await redis.keys('subscription:*');
			const subscriptions = await Promise.all(subscriptionKeys.map((key) => redis.get(key)));

			// Fetch full details only for new stories
			const newStories = await Promise.all(newStoryIds.map((id) => fetchStory(id)));

			// Send notifications for each new story
			for (const story of newStories) {
				await sendPushNotifications(
					subscriptions,
					story.title,
					`Posted by ${story.by}`,
					`https://news.ycombinator.com/item?id=${story.id}`
				);

				// Add story ID to sent set
				await redis.sadd('sent_story_ids', story.id.toString());
			}
		}

		// Optional: Trim the sent stories set to prevent unlimited growth
		// Keep only the last 1000 story IDs
		const sentCount = await redis.scard('sent_story_ids');
		if (sentCount > 1000) {
			const allSentStories = await redis.smembers('sent_story_ids');
			const storiesForRemoval = allSentStories.slice(0, sentCount - 1000);
			if (storiesForRemoval.length > 0) {
				await redis.srem('sent_story_ids', ...storiesForRemoval);
			}
		}

		return new Response('Cron job completed successfully', { status: 200 });
	} catch (error) {
		console.error('Cron job error:', error);
		return new Response('Cron job failed', { status: 500 });
	}
};
