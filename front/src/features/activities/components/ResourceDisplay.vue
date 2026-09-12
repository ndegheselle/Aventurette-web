<!--
  ResourceDisplay — one resource tile: a thumbnail, its editable name, and whatever the
  parent slots in (a remove button, typically).

  `source` is the url of the stored file. Anything the browser cannot show inline falls back
  to an icon.
-->
<script setup lang="ts">
import { FileIcon, FileTextIcon } from 'lucide-vue-next';
import { computed } from 'vue';

const { source } = defineProps<{
    source: string;
}>();
const name = defineModel<string>('name', { required: true });

const PREVIEWABLE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'bmp']);

const isImage = computed(() => PREVIEWABLE_EXTENSIONS.has(extensionOf(source)));
const isPdf = computed(() => extensionOf(source) === 'pdf');

function extensionOf(url: string): string {
    return url.split('?')[0]?.split('.').pop()?.toLowerCase() ?? '';
}
</script>
<template>
    <div class="text-center p-1">
        <a :href="source" target="_blank" rel="noopener noreferrer">
            <img v-if="isImage" class="size-16 rounded-box object-cover" :src="source" :alt="name" />
            <div v-else class="size-16 flex bg-base-300 rounded-box">
                <FileTextIcon v-if="isPdf" class="m-auto icon-lg opacity-60" />
                <FileIcon v-else class="m-auto icon-lg opacity-60" />
            </div>
        </a>
        <input type="text" class="input input-xs w-16 text-center" v-model="name" />
        <slot></slot>
    </div>
</template>
