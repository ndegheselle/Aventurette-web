<script setup lang="ts">
import FieldLabel from '@chapelure/common/components/form/FieldLabel.vue';
import Modal from '@chapelure/common/components/popups/Modal.vue';
import { useModal } from '@chapelure/common/composables/popups/useModal';
import MaterialsSelection from '@features/activities/components/materials/MaterialsSelection.vue';
import ResourcesSelection from '@features/activities/components/resources/ResourcesSelection.vue';
import TextEditor from '@features/activities/components/TextEditor.vue';
import { type ActivityStepData, createEmptyStep } from '@features/activities/composables/data/activities';
import { SaveIcon, XIcon } from 'lucide-vue-next';
import { ref } from 'vue';

const controller = useModal<ActivityStepData>();
const data = ref<ActivityStepData>(createEmptyStep());

function show(child: ActivityStepData) {
    data.value = child;
    return controller.show();
}

function confirm()
{
    controller.confirm(data.value);
}

defineExpose({ show });
</script>

<template>
    <Modal :controller>
        <template #title>
            {{ $t('actions.update') }}
        </template>
        <div class="flex flex-col">
            <FieldLabel label="activities.steps.fields.description" class="flex-1">
                <TextEditor v-model="data.description" class="min-h-64" />
            </FieldLabel>
            <FieldLabel label="activities.steps.fields.materials.title">
                <MaterialsSelection v-model="data.expand.materials" />
            </FieldLabel>
            <FieldLabel label="activities.steps.fields.resources.title">
                <ResourcesSelection v-model="data.expand.resources" />
            </FieldLabel>
        </div>
        <template #actions>
            <button class="btn" @click="controller.cancel">
                <XIcon />
                {{ $t('actions.cancel') }}
            </button>
            <button class="btn btn-primary" @click="confirm">
                <SaveIcon />
                {{ $t('actions.save') }}
            </button>
        </template>
    </Modal>
</template>