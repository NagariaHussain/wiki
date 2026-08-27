/**
 * Generated space images, backed by DiceBear.
 *
 * The mark is rendered in the browser and uploaded as an ordinary SVG file, so
 * the value stored on `app_switcher_logo` stays a plain `/files/...` URL. That
 * matters beyond tidiness: the Jinja reader header, the SPA and the headless
 * Chromium that screenshots OG cards all read that field, and only the last one
 * would tolerate an external URL (`_safe_asset_url` drops anything that is not
 * site-local). Storing a dicebear.com URL would also mean every anonymous
 * reader's browser fetching a third-party host on every page view.
 *
 * Style packages are `import()`-ed on demand, so none of them reach the initial
 * bundle -- they load the first time someone opens the generator.
 *
 * Styles used here: Initials, Shapes, Identicon, Rings and Glass are by DiceBear
 * (CC0 1.0); Icons draws Bootstrap Icons by The Bootstrap Authors (MIT).
 */

import { createAvatar } from '@dicebear/core';

/** Rendered upload size. Square, and large enough for a retina header. */
export const IMAGE_SIZE = 512;

/** Corner rounding, as a percentage of the size (DiceBear's `radius`). */
const CORNER_RADIUS = 16;

// `initials` derives both the letters and the colour from the seed, so its seed
// is pinned to the space name and shuffling moves through these instead --
// DiceBear's own palette for that style, which is tuned for white lettering.
const INITIALS_BACKGROUNDS = [
	'e53935',
	'd81b60',
	'8e24aa',
	'5e35b1',
	'3949ab',
	'1e88e5',
	'039be5',
	'00acc1',
	'00897b',
	'43a047',
	'7cb342',
	'c0ca33',
	'fdd835',
	'ffb300',
	'fb8c00',
	'f4511e',
];

/**
 * Abstract marks, not faces. A space is a body of documentation, so the
 * character styles DiceBear is better known for (bottts, personas, avataaars)
 * are deliberately left out -- they read as "who wrote this", not "what is
 * this".
 */
export const SPACE_IMAGE_STYLES = [
	{
		value: 'initials',
		label: 'Initials',
		description: 'The space name as a lettermark',
		load: () => import('@dicebear/initials'),
		// Shuffling the seed would spell something the space is not, so this
		// style shuffles its background instead.
		pinsSeedToName: true,
		backgrounds: INITIALS_BACKGROUNDS,
	},
	{
		value: 'icons',
		label: 'Icon',
		description: 'A symbol on a soft tile',
		load: () => import('@dicebear/icons'),
	},
	{
		value: 'shapes',
		label: 'Shapes',
		description: 'Layered geometric shapes',
		load: () => import('@dicebear/shapes'),
	},
	{
		value: 'identicon',
		label: 'Identicon',
		description: 'A symmetric pattern, like a repo avatar',
		load: () => import('@dicebear/identicon'),
	},
	{
		value: 'rings',
		label: 'Rings',
		description: 'Concentric rings',
		load: () => import('@dicebear/rings'),
	},
	{
		value: 'glass',
		label: 'Glass',
		description: 'Soft frosted gradients',
		load: () => import('@dicebear/glass'),
	},
];

export const DEFAULT_STYLE = SPACE_IMAGE_STYLES[0].value;

export function getStyle(value) {
	return (
		SPACE_IMAGE_STYLES.find((style) => style.value === value) ??
		SPACE_IMAGE_STYLES[0]
	);
}

/** `initials` with an empty seed renders an empty tile, so fall back to a word. */
const SEED_FALLBACK = 'Wiki';

function randomToken(random) {
	// Base-36 off a single draw: short, URL-safe, and plenty of spread for a
	// value whose only job is to pick a different picture than last time.
	return Math.floor(random() * 36 ** 8)
		.toString(36)
		.padStart(8, '0');
}

function pickOther(values, current, random) {
	const others = values.filter((value) => value !== current);
	if (!others.length) return current;
	return others[Math.floor(random() * others.length) % others.length];
}

/**
 * The variant a freshly opened generator shows: the space's own initials, on a
 * colour derived from its name so the same space always opens on the same tile.
 */
export function defaultVariant(spaceName) {
	const name = (spaceName || '').trim() || SEED_FALLBACK;
	let hash = 0;
	for (const char of name) {
		hash = (hash * 31 + char.codePointAt(0)) % 2 ** 31;
	}
	return {
		style: DEFAULT_STYLE,
		seed: name,
		backgroundColor: INITIALS_BACKGROUNDS[hash % INITIALS_BACKGROUNDS.length],
	};
}

/**
 * The variant to show for `styleValue`, carrying over what still applies.
 *
 * Switching style keeps the shuffled seed, so moving across the style row
 * compares the same draw rendered six ways rather than six unrelated pictures.
 */
export function variantForStyle(
	styleValue,
	current,
	spaceName,
	random = Math.random,
) {
	const style = getStyle(styleValue);
	if (style.pinsSeedToName) {
		return {
			style: style.value,
			seed: (spaceName || '').trim() || SEED_FALLBACK,
			backgroundColor:
				current?.style === style.value
					? current.backgroundColor
					: defaultVariant(spaceName).backgroundColor,
		};
	}
	return {
		style: style.value,
		seed: current?.seed || randomToken(random),
		backgroundColor: null,
	};
}

/**
 * The next draw for the same style. Always differs from `current`, so the
 * shuffle button never appears to do nothing.
 */
export function shuffleVariant(current, spaceName, random = Math.random) {
	const style = getStyle(current?.style);
	if (style.pinsSeedToName) {
		return {
			style: style.value,
			seed: (spaceName || '').trim() || SEED_FALLBACK,
			backgroundColor: pickOther(
				style.backgrounds,
				current?.backgroundColor,
				random,
			),
		};
	}

	let seed = randomToken(random);
	// randomToken collides with the current seed about once in three trillion;
	// the retry is here so "always different" is a property, not a probability.
	for (let attempt = 0; seed === current?.seed && attempt < 5; attempt++) {
		seed = randomToken(random);
	}
	if (seed === current?.seed) seed = `${seed}-`;

	return { style: style.value, seed, backgroundColor: null };
}

/** DiceBear options for a variant. Colour is only ever forced where we own it. */
export function avatarOptions(variant, size = IMAGE_SIZE) {
	const options = {
		seed: variant.seed || SEED_FALLBACK,
		size,
		radius: CORNER_RADIUS,
	};
	if (variant.backgroundColor) {
		options.backgroundColor = [variant.backgroundColor];
		options.backgroundType = ['solid'];
	}
	return options;
}

/** A readable file name, so the Files list is not a wall of hashes. */
export function imageFileName(spaceName, variant) {
	const slug =
		(spaceName || '')
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '')
			.slice(0, 40) || 'space';
	return `${slug}-${getStyle(variant?.style).value}.svg`;
}

const styleModules = new Map();

async function loadStyle(styleValue) {
	const style = getStyle(styleValue);
	if (!styleModules.has(style.value)) {
		styleModules.set(style.value, style.load());
	}
	return styleModules.get(style.value);
}

/** Render a variant to an SVG string. */
export async function renderVariantSvg(variant, size = IMAGE_SIZE) {
	const style = await loadStyle(variant.style);
	return createAvatar(style, avatarOptions(variant, size)).toString();
}

export function svgToDataUri(svg) {
	// Hex colours make `#` a live fragment delimiter in a data URI, so the
	// payload has to be percent-encoded rather than inlined raw.
	return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Render a variant to a `File`, ready for an upload.
 *
 * The SVG ships as-is rather than being rasterised: it is ~2KB, stays crisp on
 * the OG card at 132px and in the reader header at 24px, and `size` is still
 * passed so the file carries intrinsic dimensions -- the card's `width: auto`
 * needs an aspect ratio to resolve against.
 *
 * `upload_wiki_asset` only WebP-converts PNG/JPEG, so this passes through it
 * untouched.
 */
export async function variantToFile(variant, spaceName) {
	const svg = await renderVariantSvg(variant, IMAGE_SIZE);
	return new File([svg], imageFileName(spaceName, variant), {
		type: 'image/svg+xml',
	});
}
