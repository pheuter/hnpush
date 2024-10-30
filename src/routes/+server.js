import { redis } from '$lib/server/redis';
import { sendPushNotifications } from '$lib/server/push';

export const POST = async ({ cookies, request }) => {
	try {
		const subscription = await request.json();
		const password = cookies.get('hnpush-password');

		if (!password) {
			return new Response('No password found', { status: 401 });
		}

		await redis.set(`subscription:${password}`, JSON.stringify(subscription));
		await sendPushNotifications(
			[subscription],
			'Subscribed!',
			'You have successfully subscribed to Hacker News push notifications.'
		);

		return new Response('Subscription saved', { status: 200 });
	} catch (error) {
		console.error('Error saving subscription:', error);
		return new Response('Failed to save subscription', { status: 500 });
	}
};

export const DELETE = async ({ cookies }) => {
	try {
		const password = cookies.get('hnpush-password');

		if (!password) {
			return new Response('No password found', { status: 401 });
		}

		await redis.del(`subscription:${password}`);

		return new Response('Subscription removed', { status: 200 });
	} catch (error) {
		console.error('Error removing subscription:', error);
		return new Response('Failed to remove subscription', { status: 500 });
	}
};
