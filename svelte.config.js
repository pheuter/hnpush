import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({ runtime: 'nodejs22.x', maxDuration: 60, memory: 1769 })
	}
};

export default config;
