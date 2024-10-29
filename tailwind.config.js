import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte}'],

	theme: {
		extend: {}
	},

	plugins: [forms]
};
