import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	build: {
		// Fonts always ship as files. Vite would otherwise inline the smallest
		// subsets as data: URIs, which bloats the CSS and is blocked by font-src.
		assetsInlineLimit: (file) => (file.endsWith('.woff2') ? false : undefined)
	}
});
