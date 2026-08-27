import frappeUIPreset from 'frappe-ui/tailwind';

/** Scans only what the prototype renders — the app's own config sweeps all of src/. */
export default {
	presets: [frappeUIPreset],
	content: [
		'./prototype/**/*.{html,js,vue}',
		'./src/components/SpaceImageDialog.vue',
		'./node_modules/frappe-ui/src/components/**/*.{vue,js,ts,jsx,tsx}',
	],
	theme: { extend: {} },
	plugins: [],
};
