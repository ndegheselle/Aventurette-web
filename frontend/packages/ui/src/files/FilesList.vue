<!--
  The files held by useOneFile: thumbnails for images, an icon otherwise. Removing one hands the
  rest back through `v-model:files`.

    const { files, update } = useOneFile();
    <FilesInput @change="update" />
    <FilesList v-model:files="files" />
-->
<script setup lang="ts">
import { formatBytes } from '@chapelure/ui/files/useFiles';
import { Button } from '@chapelure/ui/shadcn/button';
import { FileIcon, XIcon } from 'lucide-vue-next';

const files = defineModel<File[]>('files', { required: true });
const PREVIEWABLE_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "image/bmp",
    "image/avif",
]);

function toLink(file: File) { return URL.createObjectURL(file); }

function canPreviewAsImage(file: File): boolean {
    return PREVIEWABLE_TYPES.has(file.type);
}

function removeFile(index: number) {
    files.value = files.value.filter((_, i) => i !== index);
}
</script>

<template>
    <ul class="mt-1 flex flex-col divide-y rounded-lg border bg-card shadow-xs" v-if="files.length">
        <li v-for="(file, index) in files" class="flex items-center gap-3 p-1">
            <img v-if="canPreviewAsImage(file)" :src="toLink(file)" class="size-10 rounded-md object-cover" />
            <div v-else class="flex size-10">
                <FileIcon class="m-auto icon-lg" />
            </div>
            <a :href="toLink(file)" target="_blank" rel="noopener noreferrer" class="flex-1 truncate underline-offset-4 hover:underline">
                {{ file.name }}
            </a>
            <span class="text-xs font-semibold uppercase text-muted-foreground">{{ formatBytes(file.size) }}</span>
            <Button variant="ghost" size="icon-sm" @click="removeFile(index)">
                <XIcon />
            </Button>
        </li>
    </ul>
</template>
