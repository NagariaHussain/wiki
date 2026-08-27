<template>
	<FrappeUIProvider>
		<div class="min-h-screen bg-surface-base">
		<header
			class="sticky top-0 z-10 border-b border-outline-gray-1 bg-surface-elevation-1 px-6 py-3"
		>
			<div class="mx-auto flex max-w-4xl items-center justify-between gap-4">
				<div class="flex flex-col">
					<span class="text-base-semibold text-ink-gray-9">
						Space Image Generator
					</span>
					<span class="text-p-sm text-ink-gray-5">
						UX prototype — real frappe-ui, real DiceBear, no backend
					</span>
				</div>
				<Button variant="ghost" @click="toggleTheme">
					<template #prefix>
						<span
							:class="[
								theme === 'dark' ? 'lucide-sun' : 'lucide-moon',
								'size-4',
							]"
							aria-hidden="true"
						/>
					</template>
					{{ theme === 'dark' ? 'Light' : 'Dark' }}
				</Button>
			</div>
		</header>

		<main class="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-8">
			<section class="flex flex-col gap-3">
				<FormControl
					type="text"
					label="Space name"
					v-model="spaceName"
					placeholder="Engineering Handbook"
					description="Drives the Initials lettermark and the generated file name."
				/>
			</section>

			<!-- Both placements sit inside a dialog in the real app, so the
			     prototype opens them the same way — a nested dialog is the one
			     thing worth checking here. -->
			<section class="flex flex-col gap-3">
				<h2 class="text-lg-semibold text-ink-gray-9">Two ways in</h2>
				<div class="flex flex-wrap gap-2">
					<Button variant="outline" @click="showSettingsDialog = true">
						<template #prefix>
							<span class="lucide-settings size-4" aria-hidden="true" />
						</template>
						Space Settings
					</Button>
					<Button variant="solid" @click="showCreateDialog = true">
						<template #prefix>
							<span class="lucide-plus size-4" aria-hidden="true" />
						</template>
						New Space
					</Button>
				</div>
				<div class="flex flex-col gap-1">
					<p class="text-p-sm text-ink-gray-5">
						Space Settings gets a Generate button next to the existing Upload;
						the create dialog gets a logo row above the name.
					</p>
					<p class="text-p-sm text-ink-gray-5">
						Shuffle redraws the mark — except on
						<span class="font-medium text-ink-gray-7">Initials</span>, where it
						only moves the colour, since the letters have to stay the space's
						own.
					</p>
				</div>
			</section>

			<!-- Where the mark actually lands, so the picker can be judged in context. -->
			<section class="flex flex-col gap-3">
				<h2 class="text-lg-semibold text-ink-gray-9">Where it shows up</h2>
				<div class="grid gap-4 sm:grid-cols-2">
					<div class="flex flex-col gap-2">
						<span class="text-p-sm text-ink-gray-5">Reader header</span>
						<div
							class="flex items-center rounded-lg border border-outline-gray-2 bg-surface-elevation-1 px-4 py-3"
						>
							<img
								v-if="logo"
								:src="logo"
								alt=""
								class="h-6 max-w-16 shrink-0"
							/>
							<span
								:class="[
									logo ? 'ms-2' : '',
									'truncate text-base-medium leading-tight text-ink-gray-9',
								]"
							>
								{{ spaceName || 'Wiki' }}
							</span>
						</div>
					</div>

					<div class="flex flex-col gap-2">
						<span class="text-p-sm text-ink-gray-5">
							Social preview card (1200×630, scaled)
						</span>
						<div
							class="flex aspect-[1200/630] flex-col justify-between overflow-hidden rounded-lg border border-outline-gray-2 bg-surface-elevation-1 p-4"
						>
							<img v-if="logo" :src="logo" alt="" class="h-8 w-auto" />
							<span v-else class="h-8" aria-hidden="true" />
							<div class="flex flex-col gap-1 text-left">
								<span class="text-xs text-ink-gray-5">
									{{ spaceName || 'Wiki' }} / Guides
								</span>
								<span class="text-lg-semibold leading-tight text-ink-gray-9">
									Setting up local development
								</span>
							</div>
						</div>
					</div>
				</div>
			</section>
		</main>

		<!-- Space Settings, trimmed to the row this feature touches. The real
		     one is a SettingsDialog with a sidebar; what matters here is that the
		     generator opens on top of an already-open dialog. -->
		<Dialog v-model:open="showSettingsDialog" title="Settings" size="2xl">
			<template #default>
				<SettingsRow
					title="Space Logo"
					description="Shown in the reader header and on generated social preview images"
				>
					<div class="flex items-center gap-3">
						<div
							class="flex h-10 w-16 shrink-0 items-center justify-center overflow-hidden rounded border border-outline-gray-2 bg-surface-gray-1"
						>
							<img
								v-if="logo"
								:src="logo"
								alt=""
								class="h-full w-full object-contain"
							/>
							<span
								v-else
								class="lucide-image size-4 text-ink-gray-4"
								aria-hidden="true"
							/>
						</div>
						<Button variant="outline" disabled>
							{{ logo ? 'Replace' : 'Upload' }}
						</Button>
						<Button variant="outline" @click="openGenerator('settings')">
							Generate
						</Button>
						<Button v-if="logo" variant="ghost" theme="red" @click="logo = ''">
							Remove
						</Button>
					</div>
				</SettingsRow>
			</template>
		</Dialog>

		<!-- A trimmed stand-in for SpaceList.vue's create dialog: enough of the
		     real form to judge where the logo row belongs. -->
		<Dialog
			v-model:open="showCreateDialog"
			title="Create Wiki Space"
			size="lg"
			:actions="[
				{ label: 'Create', variant: 'solid', onClick: createSpace },
			]"
		>
			<template #default>
				<div class="flex flex-col gap-4">
					<div class="flex items-center gap-3">
						<div
							class="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-outline-gray-2 bg-surface-gray-1"
						>
							<img
								v-if="draftLogo"
								:src="draftLogo"
								alt=""
								class="size-full object-contain"
							/>
							<span
								v-else
								class="lucide-image size-4 text-ink-gray-4"
								aria-hidden="true"
							/>
						</div>
						<Button variant="outline" @click="openGenerator('create')">
							{{ draftLogo ? 'Change image' : 'Generate image' }}
						</Button>
						<Button
							v-if="draftLogo"
							variant="ghost"
							theme="red"
							@click="draftLogo = ''"
						>
							Remove
						</Button>
					</div>

					<FormControl
						type="text"
						label="Space Name"
						v-model="spaceName"
						placeholder="My Wiki Space"
					/>
					<FormControl
						type="text"
						label="Route"
						:modelValue="route"
						disabled
						description="The URL path for this wiki space (e.g., /my-wiki-space)"
					/>
					<FormControl type="checkbox" label="Synced from GitHub?" disabled />
				</div>
			</template>
		</Dialog>

		<SpaceImageDialog
			v-model="showGenerator"
			:space-name="spaceName"
			@select="applyGenerated"
		/>
		</div>
	</FrappeUIProvider>
</template>

<script setup>
import {
	Button,
	Dialog,
	FormControl,
	FrappeUIProvider,
	SettingsRow,
	toast,
} from 'frappe-ui';
import { computed, ref } from 'vue';

import SpaceImageDialog from '@/components/SpaceImageDialog.vue';

const spaceName = ref('Engineering Handbook');
const logo = ref('');
const draftLogo = ref('');
const showGenerator = ref(false);
const showCreateDialog = ref(false);
const showSettingsDialog = ref(false);
const target = ref('settings');

// The host may already have stamped a theme on <html>; fall back to the OS
// preference so the toggle's label is never the opposite of what is on screen.
const stamped = document.documentElement.getAttribute('data-theme');
const theme = ref(
	stamped ||
		(window.matchMedia?.('(prefers-color-scheme: dark)').matches
			? 'dark'
			: 'light'),
);

const route = computed(() =>
	spaceName.value
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '')
		.replace(/[\s_-]+/g, '-')
		.replace(/^-+|-+$/g, ''),
);

function openGenerator(where) {
	target.value = where;
	showGenerator.value = true;
}

// In the app this File goes to `wiki.api.upload_wiki_asset` and the returned
// `/files/...` url is what gets stored. With no server, an object url stands in
// for that url — everything upstream of the upload is the real code path.
function applyGenerated(file) {
	const url = URL.createObjectURL(file);
	if (target.value === 'create') {
		draftLogo.value = url;
	} else {
		logo.value = url;
	}
	toast.success(`Would upload ${file.name} (${file.size} bytes)`);
}

function createSpace() {
	logo.value = draftLogo.value;
	draftLogo.value = '';
	showCreateDialog.value = false;
	toast.success('Would insert the Wiki Space with app_switcher_logo set');
}

function toggleTheme() {
	theme.value = theme.value === 'dark' ? 'light' : 'dark';
	document.documentElement.setAttribute('data-theme', theme.value);
}
</script>
