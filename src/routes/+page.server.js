import { redis } from '$lib/server/redis.js';

export const load = async ({ cookies }) => {
	let password = cookies.get('hnpush-password');

	if (!password) {
		password = crypto.randomUUID();
		cookies.set('hnpush-password', password, {
			path: '/',
			maxAge: 60 * 60 * 24 * 365
		});
	}

	const hasSubscription = await redis.exists(`subscription:${password}`);

	return {
		hasSubscription
	};
};
