import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({ runtime: 'nodejs20.x', maxDuration: 60 })
	}
};

export default config;
