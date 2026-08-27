<template>
	<Dialog
		v-model:open="open"
		:title="__('Generate Space Image')"
		size="xl"
		:actions="[
			{
				label: __('Use This Image'),
				variant: 'solid',
				loading: applying,
				onClick: useImage,
			},
		]"
	>
		<template #default>
			<div class="flex flex-col gap-6">
				<div class="flex items-center gap-4">
					<div
						class="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-outline-gray-2 bg-surface-gray-1"
					>
						<img
							v-if="previewUrl"
							data-testid="space-image-preview"
							:src="previewUrl"
							:alt="__('Space image preview')"
							class="size-full"
						/>
						<span
							v-else
							class="lucide-loader-2 size-5 animate-spin text-ink-gray-4"
							aria-hidden="true"
						/>
					</div>
					<div class="flex min-w-0 flex-col items-start gap-3">
						<p class="text-p-base text-ink-gray-6">
							{{
								__(
									'Every space gets a mark. Shuffle until one looks right, then save it.',
								)
							}}
						</p>
						<Button variant="subtle" @click="shuffle">
							<template #prefix>
								<span class="lucide-shuffle size-4" aria-hidden="true" />
							</template>
							{{ __('Shuffle') }}
						</Button>
					</div>
				</div>

				<div class="flex flex-col gap-2">
					<span class="text-p-sm text-ink-gray-5">{{ __('Style') }}</span>
					<div class="grid grid-cols-3 gap-2 sm:grid-cols-6">
						<button
							v-for="style in styles"
							:key="style.value"
							type="button"
							data-testid="space-image-style"
							:data-style="style.value"
							class="flex flex-col items-center gap-1.5 rounded-lg border p-2 transition-colors"
							:class="
								style.value === variant.style
									? 'border-outline-gray-4 bg-surface-gray-2'
									: 'border-outline-gray-1 hover:bg-surface-gray-1'
							"
							:aria-pressed="style.value === variant.style"
							:title="style.description"
							@click="selectStyle(style.value)"
						>
							<img
								v-if="thumbnails[style.value]"
								:src="thumbnails[style.value]"
								alt=""
								class="size-10 rounded-md"
							/>
							<span
								v-else
								class="size-10 rounded-md bg-surface-gray-2"
								aria-hidden="true"
							/>
							<span class="truncate text-xs text-ink-gray-7">
								{{ style.label }}
							</span>
						</button>
					</div>
					<p class="text-p-sm text-ink-gray-5">
						{{ currentStyle.description }}
					</p>
				</div>
			</div>
		</template>
	</Dialog>
</template>

<script setup>
import { Button, Dialog, toast } from 'frappe-ui';
import { computed, reactive, ref, watch } from 'vue';

import {
	SPACE_IMAGE_STYLES,
	defaultVariant,
	getStyle,
	renderVariantSvg,
	shuffleVariant,
	svgToDataUri,
	variantForStyle,
	variantToFile,
} from '@/lib/spaceImage.js';

const props = defineProps({
	modelValue: { type: Boolean, default: false },
	spaceName: { type: String, default: '' },
});

// `select` hands back a `File`, not a url: the generator has no idea where the
// mark is going. Space Settings saves it onto an existing doc, the create
// dialog carries it into the insert, and neither needs a different component.
const emit = defineEmits(['update:modelValue', 'select']);

const PREVIEW_SIZE = 192;
const THUMBNAIL_SIZE = 80;

const styles = SPACE_IMAGE_STYLES;
const variant = ref(defaultVariant(props.spaceName));
const previewUrl = ref('');
const thumbnails = reactive({});
const applying = ref(false);

// Renders are async (each style package is fetched on first use), so a fast
// click can resolve after a later one. Only the newest draw may paint.
let renderToken = 0;

const open = computed({
	get: () => props.modelValue,
	set: (value) => emit('update:modelValue', value),
});

const currentStyle = computed(() => getStyle(variant.value.style));

async function render() {
	const token = ++renderToken;
	const current = variant.value;

	try {
		const [preview, ...tiles] = await Promise.all([
			renderVariantSvg(current, PREVIEW_SIZE),
			...styles.map((style) =>
				renderVariantSvg(
					variantForStyle(style.value, current, props.spaceName),
					THUMBNAIL_SIZE,
				),
			),
		]);
		if (token !== renderToken) return;
		previewUrl.value = svgToDataUri(preview);
		styles.forEach((style, index) => {
			thumbnails[style.value] = svgToDataUri(tiles[index]);
		});
	} catch (error) {
		if (token !== renderToken) return;
		toast.error(error.message || __('Could not render the space image'));
	}
}

function shuffle() {
	variant.value = shuffleVariant(variant.value, props.spaceName);
}

function selectStyle(styleValue) {
	if (styleValue === variant.value.style) return;
	variant.value = variantForStyle(styleValue, variant.value, props.spaceName);
}

async function useImage() {
	applying.value = true;
	try {
		emit('select', await variantToFile(variant.value, props.spaceName));
		open.value = false;
	} catch (error) {
		toast.error(error.message || __('Could not render the space image'));
	} finally {
		applying.value = false;
	}
}

watch(variant, render);

watch(
	() => props.modelValue,
	(isOpen) => {
		// Reopening starts from the space's own lettermark rather than wherever
		// the last session was abandoned.
		if (isOpen) variant.value = defaultVariant(props.spaceName);
	},
	{ immediate: true },
);
</script>
