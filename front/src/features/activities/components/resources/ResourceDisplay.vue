<!--
  ResourceDisplay — one resource tile: a thumbnail, its editable name, and whatever the
  parent slots in (a remove button, typically).

  `source` covers both states a resource can be in: the url of a file already stored on the
  backend, or the File itself while it is still waiting to be uploaded. Anything the browser
  cannot show inline falls back to an icon.
-->
<script setup lang="ts">
import { FileIcon, FileTextIcon } from 'lucide-vue-next';
import { computed, ref, watch } from 'vue';

const { source } = defineProps<{
    source: string | File;
}>();
const name = defineModel<string>('name', { required: true });

const PREVIEWABLE_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif', 'image/bmp']);
const PREVIEWABLE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'bmp']);

const url = ref<string>('');

// A pending file only exists in memory, so it needs an object url — revoked as soon as the
// tile stops showing it, be it because the file changed or because the tile is gone.
watch(() => source, (current, _previous, onCleanup) => {
    if (typeof current === 'string') {
        url.value = current;
        return;
    }

    const objectUrl = URL.createObjectURL(current);
    url.value = objectUrl;
    onCleanup(() => URL.revokeObjectURL(objectUrl));
}, { immediate: true });

const isImage = computed(() => typeof source === 'string'
    ? PREVIEWABLE_EXTENSIONS.has(extensionOf(source))
    : PREVIEWABLE_TYPES.has(source.type));

const isPdf = computed(() => typeof source === 'string'
    ? extensionOf(source) === 'pdf'
    : source.type === 'application/pdf');

function extensionOf(url: string): string {
    return url.split('?')[0]?.split('.').pop()?.toLowerCase() ?? '';
}
</script>
<template>
    <div class="text-center p-1">
        <a :href="url" target="_blank" rel="noopener noreferrer">
            <img v-if="isImage" class="size-16 rounded-box object-cover" :src="url" :alt="name" />
            <div v-else class="size-16 flex bg-base-300 rounded-box">
                <FileTextIcon v-if="isPdf" class="m-auto icon-lg opacity-60" />
                <FileIcon v-else class="m-auto icon-lg opacity-60" />
            </div>
        </a>
        <input type="text" class="input input-xs w-16 text-center" v-model="name" />
        <slot></slot>
    </div>
</template>
