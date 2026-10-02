<script setup lang="ts">
import Field from '@chapelure/ui/forms/Field.vue';
import FieldError from '@chapelure/ui/forms/FieldError.vue';
import TextEditor from '@chapelure/ui/forms/TextEditor.vue';
import Modal from '@chapelure/ui/modals/Modal.vue';
import { useEditModal } from '@chapelure/ui/modals/useEditModal';
import { useModal, type IEditModal } from '@chapelure/ui/modals/useModal';
import type { ActivityTipData } from '@features/activities/model/activity';
import { tipsApi } from '@features/admin/catalogue-authoring/api/tips.api';
import { CheckIcon, XIcon } from 'lucide-vue-next';

const controller = useModal<ActivityTipData>();
const { show, confirm, cancel, isNew, isLoading, data: tip, errors } = useEditModal(controller, tipsApi);

defineExpose<IEditModal<ActivityTipData>>({ show });
</script>

<template>
    <Modal :controller>
        <template #title>
            {{ $t(isNew ? 'catalogue.tips.new' : 'catalogue.tips.edit') }}
        </template>
        <div class="flex flex-col">
            <Field label="catalogue.fields.name" :error="errors.get('name')">
                <input type="text" class="input w-full" :class="{ 'input-error': !!errors.get('name') }"
                    v-model="tip.name" />
            </Field>
            <Field label="catalogue.tips.fields.description" :error="errors.get('description')">
                <TextEditor v-model="tip.description" class="min-h-48" />
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
