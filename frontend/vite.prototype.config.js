import path from 'node:path';
import vue from '@vitejs/plugin-vue';
import autoprefixer from 'autoprefixer';
import frappeui from 'frappe-ui/vite';
import tailwindcss from 'tailwindcss';
import { defineConfig } from 'vite';

/**
 * Standalone build of the space-image generator UX prototype.
 *
 * Deliberately separate from vite.config.js: that one boots the whole SPA
 * (router, socket, frappe boot data) and needs a bench around it. This builds
 * `prototype/` on its own so the picker can be clicked through anywhere.
 */
export default defineConfig({
	plugins: [
		// Only the icon half of the frappe-ui plugin: the proxy, jinja boot data
		// and build config all assume a bench behind the app.
		frappeui({
			lucideIcons: true,
			frappeProxy: false,
			jinjaBootData: false,
			buildConfig: false,
		}),
		vue(),
	],
	root: path.resolve(import.meta.dirname, 'prototype'),
	base: './',
	resolve: {
		alias: {
			'@': path.resolve(import.meta.dirname, 'src'),
		},
	},
	css: {
		postcss: {
			plugins: [
				tailwindcss({
					config: path.resolve(
						import.meta.dirname,
						'tailwind.prototype.config.js',
					),
				}),
				autoprefixer(),
			],
		},
	},
	build: {
		outDir: path.resolve(import.meta.dirname, 'prototype/dist'),
		emptyOutDir: true,
		// One chunk, so the whole thing inlines into a single html file.
		rollupOptions: { output: { inlineDynamicImports: true } },
	},
});
