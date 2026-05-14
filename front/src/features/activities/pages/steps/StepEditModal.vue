<script setup lang="ts">
import FieldLabel from '@chapelure/common/components/form/FieldLabel.vue';
import FilesInput from '@chapelure/common/components/inputs/FilesInput.vue';
import Modal from '@chapelure/common/components/popups/Modal.vue';
import { useModal } from '@chapelure/common/composables/popups/useModal';
import TextEditor from '@features/activities/components/TextEditor.vue';
import type { ActivityStepData } from '@features/activities/composables/data/activities';
import { ref, toRaw } from 'vue';

const controller = useModal<ActivityStepData>();
const data = ref<ActivityStepData>({} as ActivityStepData);

function show(child: ActivityStepData) {
    const raw = toRaw(child);
    data.value = structuredClone(raw);
    return controller.show();
}

defineExpose({ show });
</script>

<template>
    <Modal :controller="controller">
        <template #title>
            {{ $t('actions.update') }}
        </template>
        <div class="flex flex-1 flex-col">
            <fieldset class="fieldset grow">
                <FieldLabel label="activities.steps.fields.description"
                            class="flex-1">
                    <TextEditor v-model="data.description"
                                class="flex-1" />
                </FieldLabel>
                <FieldLabel label="activities.steps.fields.materials">
                </FieldLabel>
                <FieldLabel label="activities.steps.fields.ressources">
                    <FilesInput :maxFilesNumber="3">
                    </FilesInput>
                </FieldLabel>
            </fieldset>
        </div>
    </Modal>
</template>