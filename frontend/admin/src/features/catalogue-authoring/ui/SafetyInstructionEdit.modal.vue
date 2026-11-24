<script setup lang="ts">
import Field from '@chapelure/ui/forms/Field.vue';
import FieldError from '@chapelure/ui/forms/FieldError.vue';
import TextEditor from '@chapelure/ui/forms/TextEditor.vue';
import Modal from '@chapelure/ui/modals/Modal.vue';
import { useModal, type IEditModal } from '@chapelure/ui/modals/useModal';
import { Button } from '@chapelure/ui/shadcn/button';
import { Input } from '@chapelure/ui/shadcn/input';
import type { SafetyInstructionData } from '@features/activities/models/activity';
import { safetyInstructionsApi } from '@features/catalogue-authoring/api/safety.api';
import { useSluggedEditModal } from '@features/catalogue-authoring/composables/useSluggedEditModal';
import { CheckIcon, XIcon } from 'lucide-vue-next';

const controller = useModal<SafetyInstructionData>();
const { show, confirm, cancel, isNew, isLoading, data: instruction, errors } = useSluggedEditModal(controller, safetyInstructionsApi);

defineExpose<IEditModal<SafetyInstructionData>>({ show });
</script>

<template>
    <Modal :controller>
        <template #title>
            {{ $t(isNew ? 'catalogue.safety.new' : 'catalogue.safety.edit') }}
        </template>
        <div class="flex flex-col gap-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="catalogue.fields.name" :error="errors.get('name')">
                    <Input type="text" :aria-invalid="!!errors.get('name') || undefined"
                        v-model="instruction.name" />
                </Field>
                <Field label="catalogue.fields.slug" :error="errors.get('slug')">
                    <Input type="text" :aria-invalid="!!errors.get('slug') || undefined"
                        v-model="instruction.slug" />
                </Field>
            </div>
            <Field label="catalogue.safety.fields.description" :error="errors.get('description')">
                <TextEditor v-model="instruction.description" class="min-h-48" />
            </Field>
        </div>
        <FieldError :error="errors.global.value" />
        <template #actions>
            <Button variant="outline" @click="cancel">
                <XIcon />
                {{ $t('actions.cancel') }}
            </Button>
            <Button :disabled="isLoading" @click="confirm">
                <CheckIcon />
                {{ $t('actions.save') }}
            </Button>
        </template>
    </Modal>
</template>
