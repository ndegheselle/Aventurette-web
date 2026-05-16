<script setup lang="ts">
import FieldLabel from '@chapelure/common/components/form/FieldLabel.vue';
import FilesInput from '@chapelure/common/components/inputs/FilesInput.vue';
import Modal from '@chapelure/common/components/popups/Modal.vue';
import { useAlert } from '@chapelure/common/composables/popups/useAlert';
import { useModal } from '@chapelure/common/composables/popups/useModal';
import MaterialsSelection from '@features/activities/components/materials/MaterialsSelection.vue';
import TextEditor from '@features/activities/components/TextEditor.vue';
import type { ActivityStepData } from '@features/activities/composables/data/activities';
import { ref, toRaw } from 'vue';
import { XIcon, PlusIcon } from 'lucide-vue-next';

const controller = useModal<ActivityStepData>();
const data = ref<ActivityStepData>({} as ActivityStepData);
const alert = useAlert();

function show(child: ActivityStepData) {
    const raw = toRaw(child);
    data.value = structuredClone(raw);
    return controller.show();
}

function confirm()
{
    controller.confirm(data.value);
}

alert.debug("WIP : Gérer les ressources.");

defineExpose({ show });
</script>

<template>
    <Modal :controller="controller">
        <template #title>
            {{ $t('actions.update') }}
        </template>
        <div class="flex flex-col">
            <FieldLabel label="activities.steps.fields.description" class="flex-1">
                <TextEditor v-model="data.description" class="min-h-64" />
            </FieldLabel>
            <FieldLabel label="activities.steps.fields.materials.title">
                <MaterialsSelection v-model="data.materials" />
            </FieldLabel>
            <FieldLabel label="activities.steps.fields.resources.title">
                <FilesInput :maxFilesNumber="10" accept=".png,.jpeg,.jpg,.pdf">
                    <template #constraints>
                        {{ $t('activities.steps.fields.resources.constraints') }}
                    </template>
                </FilesInput>
            </FieldLabel>
        </div>
        <template #actions>
            <button class="btn" @click="controller.cancel">
                <XIcon />
                {{ $t('actions.cancel') }}
            </button>
            <button class="btn btn-primary" @click="confirm">
                <PlusIcon />
                {{ $t('actions.add') }}
            </button>
        </template>
    </Modal>
</template>