import webpush from 'web-push';
import { PRIVATE_VAPID_KEY } from '$env/static/private';
import { PUBLIC_VAPID_KEY } from '$env/static/public';

webpush.setVapidDetails('mailto:heymarfay@icloud.com', PUBLIC_VAPID_KEY, PRIVATE_VAPID_KEY);

/**
 * Sends push notifications to multiple subscriptions in batches
 * @param {import('web-push').PushSubscription[]} subscriptions - Array of push subscription objects
 * @param {string} title - The title of the notification
 * @param {string} body - The body text of the notification
 * @param {string} [url] - The URL to open when notification is clicked
 * @param {number} [batchSize=100] - Number of notifications to send in parallel
 * @returns {Promise<{success: number, failed: number, errors: Error[]}>}
 */
export async function sendPushNotifications(subscriptions, title, body, url, batchSize = 100) {
	const payload = JSON.stringify({ title, body, url });
	const results = { success: 0, failed: 0, errors: [] };

	for (let i = 0; i < subscriptions.length; i += batchSize) {
		const batch = subscriptions.slice(i, i + batchSize);

		const promises = batch.map((subscription) =>
			webpush
				.sendNotification(subscription, payload)
				.then(() => ({ success: true }))
				.catch((error) => ({ success: false, error }))
		);

		const batchResults = await Promise.all(promises);

		batchResults.forEach((result) => {
			if (result.success) {
				results.success++;
			} else {
				results.failed++;
				// @ts-ignore
				results.errors.push(result.error);
			}
		});
	}

	return results;
}
