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
		const latestStoryIds = await fetchTopStories();

		// Get the set of story IDs we've already sent notifications for
		const sentStories = await redis.smembers('sent_story_ids');

		// Filter for new story IDs we haven't sent notifications for
		const newStoryIds = latestStoryIds.filter(
			(id) => !sentStories.includes(id.toString()) && !sentStories.includes(id)
		);

		if (newStoryIds.length > 0) {
			let subscriptions = [];
			let cursor = '0';
			do {
				const [nextCursor, keys] = await redis.scan(cursor, {
					match: 'subscription:*',
					count: 100
				});
				cursor = nextCursor;
				if (keys.length > 0) {
					const batch = await Promise.all(keys.map((key) => redis.get(key)));
					subscriptions.push(...batch);
				}
			} while (cursor !== '0');

			// Fetch stories with error handling and filter by points
			const newStories = await Promise.all(
				newStoryIds.map(async (id) => {
					try {
						const story = await fetchStory(id);
						// Only include stories with 30 or more points
						return story && story.score >= 30 ? story : null;
					} catch (error) {
						console.error(`Failed to fetch story ${id}:`, error);
						return null;
					}
				})
			);

			// Process only successfully fetched stories
			for (const story of newStories.filter(Boolean)) {
				try {
					await sendPushNotifications(
						subscriptions,
						story.title,
						`Posted by ${story.by}`,
						`https://news.ycombinator.com/item?id=${story.id}`
					);
					await redis.sadd('sent_story_ids', story.id.toString());
				} catch (error) {
					console.error(`Failed to process story ${story.id}:`, error);
					// Continue with next story instead of failing completely
				}
			}
		}

		// Trim the sent stories set to prevent unlimited growth
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
