<!--
  FilesList — renders the files array managed by useOneFile / useMultipleFiles.
  Images are shown as thumbnails; other types show a generic file icon.
  The × button calls files.splice() directly on the prop array, so the
  reactive ref in the parent composable stays in sync.

  Usage:
    const { files, update } = useMultipleFiles(10);
    <FilesInput multiple @change="update" />
    <FilesList :files />
-->
<script setup lang="ts">
import { FileIcon, XIcon } from 'lucide-vue-next';

const {files = []} = defineProps<{ files: File[] }>();
const PREVIEWABLE_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "image/bmp",
    "image/avif",
]);

function formatBytes(bytes: number, decimals: number = 2): string {
    const d = Math.max(0, decimals);

    if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(d)} KB`;
    else if (bytes < 1_073_741_824) return `${(bytes / 1_048_576).toFixed(d)} MB`;
    return `${(bytes / 1_073_741_824).toFixed(d)} GB`;
}

function toLink(file: File) { return URL.createObjectURL(file); }

function canPreviewAsImage(file: File): boolean {
    return PREVIEWABLE_TYPES.has(file.type);
}

function removeFile(index: number) {
    files.splice(index, 1);
}
</script>

<template>
    <ul class="list bg-base-200 shadow rounded-box mt-1" v-if="files.length">
        <li v-for="(file, index) in files" class="list-row p-1 items-center">
            <img v-if="canPreviewAsImage(file)" :src="toLink(file)" class="size-10 object-cover rounded-box" />
            <div v-else class="size-10 flex">
                <FileIcon class="m-auto icon-lg" />
            </div>
            <a :href="toLink(file)" target="_blank" rel="noopener noreferrer">
                {{ file.name }}
            </a>
            <span class="text-xs uppercase font-semibold opacity-60">{{ formatBytes(file.size) }}</span>
            <button class="btn btn-sm btn-square btn-ghost" @click="removeFile(index)">
                <XIcon />
            </button>
        </li>
    </ul>
</template>