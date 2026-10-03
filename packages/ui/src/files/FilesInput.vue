<!--
  Drag-and-drop / browse zone. `change` carries only files that passed `accept` and `maxMbSize`,
  and never fires empty. Pair it with useOneFile and FilesList:

    const { files, update } = useOneFile();
    <FilesInput accept="image/*" @change="update">
      <template #constraints>JPG or PNG, max 2 MB</template>
    </FilesInput>
    <FilesList v-model:files="files" />
-->
<script setup lang="ts">
import { useAlert } from '@chapelure/ui/alerts/useAlert';
import { formatBytes } from '@chapelure/ui/files/useFiles';
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

    const dropped = e.dataTransfer?.files;
    if (dropped) takeFiles(dropped);
}

function onChange() {
    const picked = fileInput.value?.files;
    if (picked) takeFiles(picked);
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

/** Why `file` is turned down, or null when it may be taken. */
function refusalOf(file: File): string | null {
    if (!matchesAccept(file, accept))
        return t('inputs.file.upload.unsuported', { name: file.name });

    const maxBytes = maxMbSize * 1_048_576;
    if (file.size > maxBytes)
        return t('inputs.file.upload.exceedSize', { name: file.name, size: formatBytes(file.size), maxSize: maxMbSize });

    return null;
}

/** Emit the files that pass, picked or dropped alike, and say why the others did not. */
function takeFiles(files: ArrayLike<File>) {
    const valid: File[] = [];
    const rejected: string[] = [];
    for (const file of Array.from(files)) {
        const refusal = refusalOf(file);
        if (refusal) rejected.push(refusal);
        else valid.push(file);
    }

    if (rejected.length) {
        alert.error(rejected.join('\n'));
    }

    if (!valid.length) return;

    emit('change', valid);
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