<script setup lang="ts">
import { useModal } from '@chapelure/ui/composables/useModal';
import Field from '@chapelure/ui/forms/Field.vue';
import { SaveIcon, XIcon } from '@chapelure/ui/icons';
import Modal from '@chapelure/ui/overlays/Modal.vue';
import Button from '@chapelure/ui/primitives/Button.vue';
import MaterialsSelection from '@features/activities/components/materials/MaterialsSelection.vue';
import ResourcesSelection from '@features/activities/components/resources/ResourcesSelection.vue';
import TextEditor from '@features/activities/components/TextEditor.vue';
import { createEmptyStep, type ActivityStepData } from '@features/activities/model/activity';
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
            <Field label="activities.steps.fields.description" class="flex-1">
                <TextEditor v-model="data.description" class="min-h-64" />
            </Field>
            <Field label="activities.steps.fields.materials.title">
                <MaterialsSelection v-model="data.expand.materials" />
            </Field>
            <Field label="activities.steps.fields.resources.title">
                <ResourcesSelection v-model="data.expand.resources" />
            </Field>
        </div>
        <template #actions>
            <Button @click="controller.cancel">
                <XIcon />
                {{ $t('actions.cancel') }}
            </Button>
            <Button variant="primary" @click="confirm">
                <SaveIcon />
                {{ $t('actions.save') }}
            </Button>
        </template>
    </Modal>
</template>
