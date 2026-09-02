<script setup lang="ts">
import { resourcesApi as resources } from '@features/activities/api/resources.api';
import { useAlert } from '@chapelure/ui/composables/useAlert';
import FilesInput from '@chapelure/ui/files/FilesInput.vue';
import ResourceDisplay from '@features/activities/components/resources/ResourceDisplay.vue';
import { isUploadedResource, type StepResourceData } from '@features/activities/model/activity';
import { CircleOffIcon, TrashIcon } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';

/** Kept in step with the `constraints` string below. */
const MAX_FILES = 10;

const selected = defineModel<StepResourceData[]>({ default: () => [] });

const { t } = useI18n();
const alert = useAlert();

/**
 * Picked files go straight into the model — the step is what owns its resources, so a file
 * waiting to be uploaded has to travel with it and not sit in a ref this component keeps.
 * FilesInput has already turned down anything of the wrong format or size.
 */
function addFiles(added: File[]) {
    const room = MAX_FILES - selected.value.length;
    if (added.length > room) {
        alert.error(t('inputs.file.upload.exceedNumber', { number: MAX_FILES }));
        added = added.slice(0, Math.max(room, 0));
    }
    if (!added.length) return;

    selected.value = [...selected.value, ...added.map(file => ({ file, name: file.name }))];
}

function removeItem(index: number) {
    selected.value = selected.value.filter((_, i) => i !== index);
}

/** What the tile previews: the url of a stored file, or the file itself while it is pending. */
function sourceOf(resource: StepResourceData): string | File {
    return isUploadedResource(resource) ? resources.getFileUrl(resource) : resource.file;
}

function keyOf(resource: StepResourceData): string {
    return isUploadedResource(resource) ? resource.id : resource.file.name;
}
</script>

<template>
    <FilesInput accept=".png,.jpeg,.jpg,.pdf" multiple @change="addFiles">
        <template #constraints>
            {{ $t('activities.steps.fields.resources.constraints') }}
        </template>
    </FilesInput>
    <div class="flex flex-wrap mt-1 bg-base-200 rounded-box pt-1">
        <ResourceDisplay v-for="(resource, index) in selected" :key="keyOf(resource)" :source="sourceOf(resource)"
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
