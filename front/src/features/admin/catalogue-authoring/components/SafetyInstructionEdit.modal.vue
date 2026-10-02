<script setup lang="ts">
import Field from '@chapelure/ui/forms/Field.vue';
import FieldError from '@chapelure/ui/forms/FieldError.vue';
import TextEditor from '@chapelure/ui/forms/TextEditor.vue';
import Modal from '@chapelure/ui/modals/Modal.vue';
import { useEditModal } from '@chapelure/ui/modals/useEditModal';
import { useModal, type IEditModal } from '@chapelure/ui/modals/useModal';
import type { SafetyInstructionData } from '@features/activities/model/activity';
import { safetyInstructionsApi } from '@features/admin/catalogue-authoring/api/safety.api';
import { slugFollowing } from '@features/admin/catalogue-authoring/model/catalogue.edit';
import { CheckIcon, XIcon } from 'lucide-vue-next';
import { watch } from 'vue';

const controller = useModal<SafetyInstructionData>();
const { show, confirm, cancel, isNew, isLoading, data: instruction, errors } = useEditModal(controller, safetyInstructionsApi);

watch(() => instruction.value.name, (name, previous) => {
    if (isNew.value)
        instruction.value.slug = slugFollowing(instruction.value.slug ?? '', previous ?? '', name ?? '');
});

defineExpose<IEditModal<SafetyInstructionData>>({ show });
</script>

<template>
    <Modal :controller>
        <template #title>
            {{ $t(isNew ? 'catalogue.safety.new' : 'catalogue.safety.edit') }}
        </template>
        <div class="flex flex-col">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                <Field label="catalogue.fields.name" :error="errors.get('name')">
                    <input type="text" class="input w-full" :class="{ 'input-error': !!errors.get('name') }"
                        v-model="instruction.name" />
                </Field>
                <Field label="catalogue.fields.slug" :error="errors.get('slug')">
                    <input type="text" class="input w-full" :class="{ 'input-error': !!errors.get('slug') }"
                        v-model="instruction.slug" />
                </Field>
            </div>
            <Field label="catalogue.safety.fields.description" :error="errors.get('description')">
                <TextEditor v-model="instruction.description" class="min-h-48" />
            </Field>
        </div>
        <FieldError :error="errors.global.value" />
        <template #actions>
            <button class="btn" @click="cancel">
                <XIcon />
                {{ $t('actions.cancel') }}
            </button>
            <button class="btn btn-primary" :disabled="isLoading" @click="confirm">
                <CheckIcon />
                {{ $t('actions.save') }}
            </button>
        </template>
    </Modal>
</template>
