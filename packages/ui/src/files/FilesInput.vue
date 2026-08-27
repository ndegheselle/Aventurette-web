<!--
  FilesInput — drag-and-drop / browse zone that validates and emits accepted files.

  Pair with useOneFile / useMultipleFiles and FilesList:
    const { files, update } = useOneFile();
    <FilesInput accept="image/*" @change="update">
      <template #constraints>JPG or PNG, max 2 MB</template>
    </FilesInput>
    <FilesList :files />

  Props:
    accept      — same syntax as <input accept>  (default: "image/*")
    maxMbSize   — per-file size limit in MB       (default: 2)
    multiple    — allow selecting multiple files  (default: false)

  Emits:
    change(files: File[]) — only valid, accepted files; never empty
-->
<script setup lang="ts">
import { useAlert } from '@chapelure/ui/composables/useAlert';
import { FolderOpenIcon, UploadIcon } from 'lucide-vue-next';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const { accept = 'image/*', maxMbSize = 2, multiple = false } = defineProps<{
    accept?: string;
    maxMbSize?: number;
    multiple?: boolean;
}>();
const emit = defineEmits<{
  change: [files: File[]]
}>()

const fileInput = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);
const alert = useAlert();

function triggerFileSelect() {
    fileInput.value?.click();
}

function onDragOver(e: DragEvent) {
    e.preventDefault();
    isDragging.value = true;
}

function onDrop(e: DragEvent) {
    e.preventDefault();
    isDragging.value = false;

    if (e.dataTransfer?.files && fileInput.value) {
        fileInput.value.files = e.dataTransfer.files;
        fileInput.value.dispatchEvent(new Event('change', { bubbles: true }));
    }
}

function matchesAccept(file: File, accept: string): boolean {
    return accept.split(',').map(s => s.trim()).some(token => {
        if (token.startsWith('.')) {
            return file.name.toLowerCase().endsWith(token.toLowerCase());
        }
        if (token.endsWith('/*')) {
            return file.type.startsWith(token.slice(0, -1));
        }
        return file.type === token;
    });
}

function onChange() {
    const fileList = fileInput.value?.files;
    if (!fileList) return;

    const maxBytes = maxMbSize * 1_048_576;
    const rejected: string[] = [];

    const valid = Array.from(fileList).filter(file => {
        if (!matchesAccept(file, accept)) {
            rejected.push(t('inputs.file.upload.unsuported', { name: file.name }));
            return false;
        }
        if (file.size > maxBytes) {
            rejected.push(t('inputs.file.upload.exceedSize', { name: file.name, size: formatBytes(file.size), maxSize: maxMbSize }));
            return false;
        }
        return true;
    });

    if (rejected.length) {
        alert.error(rejected.join('\n'));
    }

    if (!valid.length) return;
    
    emit('change', valid);
}

function formatBytes(bytes: number, decimals: number = 2): string {
    const d = Math.max(0, decimals);

    if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(d)} KB`;
    else if (bytes < 1_073_741_824) return `${(bytes / 1_048_576).toFixed(d)} MB`;
    return `${(bytes / 1_073_741_824).toFixed(d)} GB`;
}
</script>

<template>
    <div class="bg-base-100 rounded-box p-3 border border-dashed border-base-content/20 flex flex-col justify-center items-center cursor-pointer transitions transition-colors"
        :class="{ 'border-primary bg-base-200': isDragging, 'hover:border-primary': !isDragging }"
        @click="triggerFileSelect" @dragover="onDragOver" @dragleave="isDragging = false" @drop="onDrop">
        <UploadIcon class="icon-lg opacity-50" />
        <b>{{ $t('inputs.file.upload.label') }}</b>
        <div v-if="$slots.constraints" class="text-center text-sm opacity-60 wrap-break-word">
            <slot name="constraints" />
        </div>
        <button class="btn btn-sm mt-1">
            <FolderOpenIcon />
            {{ $t('inputs.file.upload.browse') }}
        </button>
    </div>
    <input @change="onChange" ref="fileInput" type="file" :accept="accept" class="hidden"
        :multiple="multiple" />
</template>