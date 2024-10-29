import webpush from 'web-push';
import { PRIVATE_VAPID_KEY } from '$env/static/private';
import { PUBLIC_VAPID_KEY } from '$env/static/public';

webpush.setVapidDetails('mailto:marfay@me.com', PUBLIC_VAPID_KEY, PRIVATE_VAPID_KEY);

export const GET = async () => {
	try {
		/** @type any */
		const subscription = {
			endpoint:
				'https://web.push.apple.com/QFQK7_MFUwgnZREUu7b8DjyVhNMJ9mxLMPfndbZMlhwjHiNa0KnvK6zlY1s3AXgb5yMoVxwIzL1ZeO0GxO7IVF5CMnpBC-SWQn1xd9cXZAopjC5f7DfaQR_pIQPK9jgSV6hdkH0OstMPrq07Eh1OTXgUhxnptK2iWtz7OnUETZY',
			keys: {
				p256dh:
					'BHEfjkV2n783rQubhWw6OLdGciaVvrZJu4WqYIf-chEO48-iAqdeOCVG4Z1vPBBUnFyD_TOxjYBjz8HspxCGpzA',
				auth: '9rdrM4YY2DnVQWlihRkIBQ'
			}
		};

		const payload = JSON.stringify({
			title: 'Test Notification',
			body: 'This is a test push notification'
		});

		await webpush.sendNotification(subscription, payload);

		return new Response('Push notification sent!', { status: 200 });
	} catch (error) {
		console.error('Error sending push notification:', error);
		return new Response('Failed to send push notification', { status: 500 });
	}
};
