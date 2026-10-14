import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			fallback: '404.html'
		}),
		/**
		 * Content Security Policy. GitHub Pages cannot send response headers, so
		 * SvelteKit writes this into each prerendered page as a <meta> tag and adds
		 * the hash of its own inline bootstrap script to script-src.
		 *
		 * - Everything is self-hosted, so every fetch directive is 'self'.
		 * - style-src needs 'unsafe-inline' for the style="" attributes Svelte renders.
		 * - frame-ancestors, report-uri and sandbox are ignored in a <meta> policy, so
		 *   they are left out rather than implied.
		 * - The theme script in app.html runs before this tag is parsed, so it is not
		 *   governed by the policy and needs no hash.
		 */
		csp: {
			mode: 'hash',
			directives: {
				'default-src': ['self'],
				'script-src': ['self'],
				'style-src': ['self', 'unsafe-inline'],
				'img-src': ['self'],
				'font-src': ['self'],
				'connect-src': ['self'],
				'object-src': ['none'],
				'base-uri': ['self'],
				'form-action': ['self'],
				'upgrade-insecure-requests': true
			}
		}
	}
};

export default config;
