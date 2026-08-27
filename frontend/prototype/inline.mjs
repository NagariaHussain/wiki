/**
 * Fold the prototype build into one self-contained html file.
 *
 * The Artifact host blocks every external request, so the fonts have to ride
 * along as data URIs and the js/css have to be inline rather than linked.
 */
import { Buffer } from 'node:buffer';
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve(import.meta.dirname, 'dist');
const assets = path.join(dist, 'assets');
const files = fs.readdirSync(assets);

const cssName = files.find((f) => f.endsWith('.css'));
const jsName = files.find((f) => f.endsWith('.js'));

let css = fs.readFileSync(path.join(assets, cssName), 'utf8');

// Fonts: url(./<name>.woff2) -> url(data:...)
for (const font of files.filter((f) => f.endsWith('.woff2'))) {
	const data = fs.readFileSync(path.join(assets, font)).toString('base64');
	css = css.replaceAll(`./${font}`, `data:font/woff2;base64,${data}`);
}

/**
 * frappe-ui keys dark mode on `[data-theme="dark"]` and ships no
 * `prefers-color-scheme` fallback. The Artifact host only stamps that attribute
 * when the viewer has picked a theme explicitly — on the default "system"
 * setting nothing is stamped, and the page would render its light palette on
 * the host's dark ground. Re-emit the dark token block for that state.
 */
const darkRule = /(^|})\[data-theme=dark\]\{([^}]*)\}/.exec(css);
if (!darkRule) throw new Error('could not find the dark token block');
css += `\n@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){${darkRule[2]}}}\n`;

const js = fs.readFileSync(path.join(assets, jsName), 'utf8');

// The artifact host supplies <!doctype>/<head>/<body>, so emit body content only.
// The charset meta lands inside the host's first 1024 bytes, which is where the
// parser sniffs for it — cheap insurance for the em dashes in the copy.
// The body background is explicit because the host paints its own ground behind
// the page, and frappe-ui only puts `bg-surface-base` on the app's own wrapper.
const html = `<meta charset="utf-8">
<title>Space Image Generator</title>
<style>${css}
body{background:var(--surface-base);color:var(--ink-gray-8);}</style>
<div id="app"></div>
<script type="module">${js.replaceAll('</script', '<\\/script')}</script>
`;

const out = path.resolve(import.meta.dirname, 'space-image-generator.html');
fs.writeFileSync(out, html);
console.log(`${out} — ${(html.length / 1024 / 1024).toFixed(2)} MB`);
