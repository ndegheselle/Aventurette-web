<script setup lang="ts">
import FilesInput from '@chapelure/ui/files/FilesInput.vue';
import { useStepResources } from '@features/activities-authoring/composables/useStepEdit';
import { ACCEPTED_RESOURCE_TYPES } from '@features/activities-authoring/model/step.edit';
import type { ActivityResourceData } from '@features/activities/model/step';
import { CircleOffIcon, FileIcon, FileTextIcon, TrashIcon } from 'lucide-vue-next';

/** The step these belong to: a resource is written against it as soon as it is picked. */
const props = defineProps<{ step: string }>();

/** Records, not uploads: a picked file is stored on the spot. */
const selected = defineModel<ActivityResourceData[]>({ default: () => [] });

const { add, remove } = useStepResources(selected, () => props.step);

// A tile shows its stored file as a thumbnail; anything unpreviewable falls back to an icon.
const PREVIEWABLE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'bmp']);

function isImage(url: string): boolean {
    return PREVIEWABLE_EXTENSIONS.has(extensionOf(url));
}

function isPdf(url: string): boolean {
    return extensionOf(url) === 'pdf';
}

function extensionOf(url: string): string {
    const [path = ''] = url.split('?');
    return path.split('.').pop()?.toLowerCase() ?? '';
}
</script>

<template>
    <FilesInput :accept="ACCEPTED_RESOURCE_TYPES" multiple @change="add">
        <template #constraints>
            {{ $t('activities.steps.fields.resources.constraints') }}
        </template>
    </FilesInput>
    <div class="flex flex-wrap mt-1 bg-base-200 rounded-box pt-1">
        <div v-for="(resource, index) in selected" :key="resource.id" class="relative text-center p-1">
            <a :href="resource.url" target="_blank" rel="noopener noreferrer">
                <img v-if="isImage(resource.url)" class="size-16 rounded-box object-cover"
                    :src="resource.url" :alt="resource.name" />
                <div v-else class="size-16 flex bg-base-300 rounded-box">
                    <FileTextIcon v-if="isPdf(resource.url)" class="m-auto icon-lg opacity-60" />
                    <FileIcon v-else class="m-auto icon-lg opacity-60" />
                </div>
            </a>
            <input type="text" class="input input-xs w-16 text-center" v-model="resource.name" />
            <button class="btn btn-error btn-xs btn-circle absolute top-0 right-0" @click="remove(index)">
                <TrashIcon class="icon-sm" />
            </button>
        </div>
        <div v-if="!selected.length" class="opacity-60 flex mx-auto items-center gap-2 h-10">
            <CircleOffIcon />
            <span>{{ $t('activities.steps.fields.resources.empty') }}</span>
        </div>
    </div>
</template>
