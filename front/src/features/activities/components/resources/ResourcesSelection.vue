<script setup lang="ts">
import FilesInput from '@chapelure/ui/files/FilesInput.vue';
import { activityResourceUrl } from '@features/activities/data/resources.repository';
import Button from '@chapelure/ui/primitives/Button.vue';
import TextInput from '@chapelure/ui/primitives/TextInput.vue';
import { useMultipleFiles } from '@chapelure/ui/files/useFiles';
import { type ActivityResourceData } from '@features/activities/model/activity';
import { CircleOffIcon, FileIcon, TrashIcon } from 'lucide-vue-next';
import { ref, watch } from 'vue';

const selected = defineModel<ActivityResourceData[]>({ default: () => [] });

const { files, update: addFiles } = useMultipleFiles(10);

type NewResource = { file: File; name: string };
const newResources = ref<NewResource[]>([]);

const PREVIEWABLE = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif']);
const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif']);

watch(files, (current) => {
    newResources.value = newResources.value.filter(r => current.includes(r.file));
    const tracked = newResources.value.map(r => r.file);
    for (const file of current) {
        if (!tracked.includes(file)) {
            newResources.value.push({ file, name: file.name });
        }
    }
}, { deep: true });

function removeExisting(index: number) {
    selected.value = selected.value.filter((_, i) => i !== index);
}

function toObjectUrl(file: File): string {
    return URL.createObjectURL(file);
}

function removeNew(entry: NewResource) {
    const idx = files.value.indexOf(entry.file);
    if (idx !== -1) files.value.splice(idx, 1);
}

function getExistingFileUrl(resource: ActivityResourceData): string {
    return activityResourceUrl(resource);
}

function existingIsImage(resource: ActivityResourceData): boolean {
    const ext = resource.file.split('.').pop()?.toLowerCase() ?? '';
    return IMAGE_EXTENSIONS.has(ext);
}

defineExpose({ newResources });
</script>

<template>
    <FilesInput accept=".png,.jpeg,.jpg,.pdf" multiple @change="addFiles">
        <template #constraints>
            {{ $t('activities.steps.fields.resources.constraints') }}
        </template>
    </FilesInput>
    <div class="flex flex-col mt-1 bg-base-200 rounded-box gap-1 p-1">
        <div v-for="(resource, index) in selected" :key="resource.id"
            class="p-1 items-center bg-base-100 rounded-box flex gap-2">
            <a :href="getExistingFileUrl(resource)" target="_blank" rel="noopener noreferrer" class="shrink-0">
                <img v-if="existingIsImage(resource)" :src="getExistingFileUrl(resource)"
                    class="size-10 object-cover rounded-box" />
                <div v-else class="size-10 flex bg-base-200 rounded-box">
                    <FileIcon class="m-auto icon-lg" />
                </div>
            </a>
            <TextInput size="sm" class="flex-1" v-model="resource.name" />
            <Button variant="error" shape="circle" size="xs" class="shrink-0" @click="removeExisting(index)">
                <TrashIcon class="icon-sm" />
            </Button>
        </div>
        <div v-for="entry in newResources" :key="entry.file.name"
            class="p-1 items-center bg-base-100 rounded-box flex gap-2">
            <img v-if="PREVIEWABLE.has(entry.file.type)" :src="toObjectUrl(entry.file)"
                class="size-10 object-cover rounded-box shrink-0" />
            <div v-else class="size-10 flex bg-base-200 rounded-box shrink-0">
                <FileIcon class="m-auto icon-lg" />
            </div>
            <TextInput size="sm" class="flex-1" v-model="entry.name" />
            <Button variant="error" shape="circle" size="xs" class="shrink-0" @click="removeNew(entry)">
                <TrashIcon class="icon-sm" />
            </Button>
        </div>
        <div v-if="!selected.length && !newResources.length" class="opacity-60 flex mx-auto items-center gap-2 h-10">
            <CircleOffIcon />
            <span>{{ $t('activities.steps.fields.resources.empty') }}</span>
        </div>
    </div>
</template>
