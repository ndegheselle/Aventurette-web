<script setup lang="ts">
import FilesInput from '@chapelure/ui/files/FilesInput.vue';
import type { ActivityResourceData } from '@features/activities/model/step';
import { useStepResources } from '@features/admin/activities-authoring/composables/useStepEdit';
import { ACCEPTED_RESOURCE_TYPES, resourcePreviewOf } from '@features/admin/activities-authoring/model/step.edit';
import { CircleOffIcon, FileIcon, FileTextIcon, TrashIcon } from 'lucide-vue-next';

/** The step these belong to: a picked file is stored against it when the activity is saved. */
const props = defineProps<{ step: string }>();

/** Stored resources, and picked ones carrying their file until the save uploads it. */
const selected = defineModel<ActivityResourceData[]>({ default: () => [] });

const { add, remove } = useStepResources(selected, () => props.step);
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
                <img v-if="resourcePreviewOf(resource) === 'image'" class="size-16 rounded-box object-cover"
                    :src="resource.url" :alt="resource.name" />
                <div v-else class="size-16 flex bg-base-300 rounded-box">
                    <FileTextIcon v-if="resourcePreviewOf(resource) === 'pdf'" class="m-auto icon-lg opacity-60" />
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
