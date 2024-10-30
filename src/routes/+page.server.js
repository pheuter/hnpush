import { generateMemorablePassword } from '$lib/server/utils.js';
import { redis } from '$lib/server/redis.js';

export const load = async ({ cookies }) => {
	let password = cookies.get('hnpush-password');

	if (!password) {
		password = generateMemorablePassword();
		cookies.set('hnpush-password', password, {
			path: '/',
			maxAge: 60 * 60 * 24 * 365
		});
	}

	const hasSubscription = await redis.exists(`subscription:${password}`);

	return {
		password,
		hasSubscription
	};
};
