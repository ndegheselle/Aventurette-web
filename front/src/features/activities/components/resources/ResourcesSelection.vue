<script setup lang="ts">
import { useAlert } from '@chapelure/ui/composables/useAlert';
import FilesInput from '@chapelure/ui/files/FilesInput.vue';
import { resourcesApi as resources } from '@features/activities/api/resources.api';
import ResourceDisplay from '@features/activities/components/resources/ResourceDisplay.vue';
import { isUploadedResource, type StepResourceData } from '@features/activities/model/activity';
import {
    ACCEPTED_RESOURCE_TYPES,
    addResourcesWithinLimit,
    MAX_STEP_RESOURCES,
    resourceKey,
} from '@features/activities/model/resource';
import { CircleOffIcon, TrashIcon } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';

const selected = defineModel<StepResourceData[]>({ default: () => [] });

const { t } = useI18n();
const alert = useAlert();

/**
 * Picked files go straight into the model — the step is what owns its resources, so a file
 * waiting to be uploaded has to travel with it and not sit in a ref this component keeps.
 * FilesInput has already turned down anything of the wrong format or size; what is left to
 * enforce is how many one step may hold.
 */
function addFiles(added: File[]) {
    const { resources: next, rejected } = addResourcesWithinLimit(selected.value, added);

    if (rejected)
        alert.error(t('inputs.file.upload.exceedNumber', { number: MAX_STEP_RESOURCES }));

    selected.value = next;
}

function removeItem(index: number) {
    selected.value = selected.value.filter((_, i) => i !== index);
}

/** What the tile previews: the url of a stored file, or the file itself while it is pending. */
function sourceOf(resource: StepResourceData): string | File {
    return isUploadedResource(resource) ? resources.getFileUrl(resource) : resource.file;
}
</script>

<template>
    <FilesInput :accept="ACCEPTED_RESOURCE_TYPES" multiple @change="addFiles">
        <template #constraints>
            {{ $t('activities.steps.fields.resources.constraints') }}
        </template>
    </FilesInput>
    <div class="flex flex-wrap mt-1 bg-base-200 rounded-box pt-1">
        <ResourceDisplay v-for="(resource, index) in selected" :key="resourceKey(resource)" :source="sourceOf(resource)"
            v-model:name="resource.name" class="relative">
            <button class="btn btn-error btn-xs btn-circle absolute top-0 right-0" @click="removeItem(index)">
                <TrashIcon class="icon-sm" />
            </button>
        </ResourceDisplay>
        <div v-if="!selected.length" class="opacity-60 flex mx-auto items-center gap-2 h-10">
            <CircleOffIcon />
            <span>{{ $t('activities.steps.fields.resources.empty') }}</span>
        </div>
    </div>
</template>
