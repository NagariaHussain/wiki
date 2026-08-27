import { Button, Dialog, FormControl, setConfig } from 'frappe-ui';
import { createApp } from 'vue';

import App from './App.vue';
import './style.css';

// The prototype talks to no server, so nothing should try. Any resource that
// slips through fails loudly here rather than hanging on a request.
setConfig('resourceFetcher', () =>
	Promise.reject(new Error('prototype: no backend')),
);

const app = createApp(App);

// The wiki app installs a translation plugin that defines `__`; the prototype
// only needs the identity behaviour.
window.__ = (message) => message;
app.config.globalProperties.__ = window.__;

for (const [name, component] of Object.entries({
	Button,
	Dialog,
	FormControl,
})) {
	app.component(name, component);
}

app.mount('#app');
