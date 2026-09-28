<script setup lang="ts">
import Field from '@chapelure/ui/forms/Field.vue';
import FieldError from '@chapelure/ui/forms/FieldError.vue';
import TextEditor from '@chapelure/ui/forms/TextEditor.vue';
import Modal from '@chapelure/ui/modals/Modal.vue';
import { useEditModal } from '@chapelure/ui/modals/useEditModal';
import { useModal, type IEditModal } from '@chapelure/ui/modals/useModal';
import { workshopsApi } from '@features/activities-authoring/api/workshops.api';
import RecordsPicker from '@features/activities-authoring/components/RecordsPicker.vue';
import type { ActivityMaterialData } from '@features/activities/model/material';
import type { ActivityWorkshopData } from '@features/activities/model/workshop';
import { SaveIcon, XIcon } from 'lucide-vue-next';

/** The activity's materials: a workshop recalls the ones it uses. */
const { materials = [] } = defineProps<{ materials?: ActivityMaterialData[] }>();

// Only ever updates: a workshop is written blank when it is added, as a step is.
const controller = useModal<ActivityWorkshopData>();
const { show, confirm, cancel, data: workshop, errors, isLoading } = useEditModal(controller, workshopsApi);

defineExpose<IEditModal<ActivityWorkshopData>>({ show });
</script>

<template>
    <Modal :controller>
        <template #title>
            {{ $t('actions.update') }}
        </template>
        <div class="flex flex-col">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-x-4">
                <Field label="activities.workshops.fields.name" :error="errors.get('name')">
                    <input type="text" class="input w-full" :class="{ 'input-error': !!errors.get('name') }"
                        v-model="workshop.name" />
                </Field>
                <Field label="activities.workshops.fields.theme" :error="errors.get('theme')">
                    <input type="text" class="input w-full" v-model="workshop.theme" />
                </Field>
                <Field label="activities.workshops.fields.adultsRequired" :error="errors.get('adults_required')">
                    <input type="number" min="0" class="input w-full" v-model.number="workshop.adults_required" />
                </Field>
            </div>
            <Field label="activities.workshops.fields.challenges" :error="errors.get('challenges')">
                <TextEditor v-model="workshop.challenges" class="min-h-32" />
            </Field>
            <RecordsPicker label="activities.workshops.fields.materials" :items="materials"
                v-model="workshop.materials" />
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
