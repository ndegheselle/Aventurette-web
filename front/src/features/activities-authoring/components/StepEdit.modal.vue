<script setup lang="ts">
import Field from '@chapelure/ui/forms/Field.vue';
import FieldError from '@chapelure/ui/forms/FieldError.vue';
import TextEditor from '@chapelure/ui/forms/TextEditor.vue';
import Modal from '@chapelure/ui/modals/Modal.vue';
import { useEditModal } from '@chapelure/ui/modals/useEditModal';
import { useModal, type IEditModal } from '@chapelure/ui/modals/useModal';
import { stepsApi } from '@features/activities-authoring/api/steps.api';
import MaterialsSelection from '@features/activities-authoring/components/MaterialsSelection.vue';
import ResourcesSelection from '@features/activities-authoring/components/ResourcesSelection.vue';
import type { ActivityStepData } from '@features/activities/model/step';
import { SaveIcon, XIcon } from 'lucide-vue-next';

// Only ever updates: a step is written blank when it is added, so what this opens on is already
// a record — which is what lets its materials and files be saved as they are chosen.
const controller = useModal<ActivityStepData>();
const { show, confirm, cancel, data: step, errors, isLoading } = useEditModal(controller, stepsApi);

defineExpose<IEditModal<ActivityStepData>>({ show });
</script>

<template>
    <Modal :controller>
        <template #title>
            {{ $t('actions.update') }}
        </template>
        <div class="flex flex-col">
            <Field label="activities.steps.fields.description" class="flex-1"
                   :error="errors.get('description')">
                <TextEditor v-model="step.description" class="min-h-64" />
            </Field>
            <Field label="activities.steps.fields.materials.title">
                <MaterialsSelection v-model="step.materials" :step="step.id" />
            </Field>
            <Field label="activities.steps.fields.resources.title">
                <ResourcesSelection v-model="step.resources" :step="step.id" />
            </Field>
        </div>
        <FieldError :error="errors.global.value" />
        <template #actions>
            <button class="btn" @click="cancel">
                <XIcon />
                {{ $t('actions.cancel') }}
            </button>
            <button class="btn btn-primary" :disabled="isLoading" @click="confirm">
                <span v-if="isLoading" class="loading loading-spinner loading-sm"></span>
                <SaveIcon />
                {{ $t('actions.save') }}
            </button>
        </template>
    </Modal>
</template>
