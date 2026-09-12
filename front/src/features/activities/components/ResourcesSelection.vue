<script setup lang="ts">
import FilesInput from '@chapelure/ui/files/FilesInput.vue';
import { resourcesApi as resources } from '@features/activities/api/steps.api';
import ResourceDisplay from '@features/activities/components/ResourceDisplay.vue';
import { useStepResources } from '@features/activities/composables/useStepEdit';
import { ACCEPTED_RESOURCE_TYPES, type ActivityResourceData } from '@features/activities/model/step';
import { CircleOffIcon, TrashIcon } from 'lucide-vue-next';

/** The step these belong to: a resource is written against it as soon as it is picked. */
const props = defineProps<{ step: string }>();

/**
 * A picked file is uploaded on the spot, so what this binds is a list of records — the step
 * never carries an upload waiting for it to be saved.
 */
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
        <ResourceDisplay v-for="(resource, index) in selected" :key="resource.id"
            :source="resources.getFileUrl(resource)" v-model:name="resource.name" class="relative">
            <button class="btn btn-error btn-xs btn-circle absolute top-0 right-0" @click="remove(index)">
                <TrashIcon class="icon-sm" />
            </button>
        </ResourceDisplay>
        <div v-if="!selected.length" class="opacity-60 flex mx-auto items-center gap-2 h-10">
            <CircleOffIcon />
            <span>{{ $t('activities.steps.fields.resources.empty') }}</span>
        </div>
    </div>
</template>
