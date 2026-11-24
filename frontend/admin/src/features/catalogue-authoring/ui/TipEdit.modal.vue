<script setup lang="ts">
import Field from '@chapelure/ui/forms/Field.vue';
import FieldError from '@chapelure/ui/forms/FieldError.vue';
import TextEditor from '@chapelure/ui/forms/TextEditor.vue';
import Modal from '@chapelure/ui/modals/Modal.vue';
import { useEditModal } from '@chapelure/ui/modals/useEditModal';
import { useModal, type IEditModal } from '@chapelure/ui/modals/useModal';
import { Button } from '@chapelure/ui/shadcn/button';
import { Input } from '@chapelure/ui/shadcn/input';
import type { ActivityTipData } from '@features/activities/models/step';
import { tipsApi } from '@features/catalogue-authoring/api/tips.api';
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
        <div class="flex flex-col gap-4">
            <Field label="catalogue.fields.name" :error="errors.get('name')">
                <Input type="text" :aria-invalid="!!errors.get('name') || undefined"
                    v-model="tip.name" />
            </Field>
            <Field label="catalogue.fields.aliases" :error="errors.get('aliases')">
                <Input type="text" v-model="tip.aliases" />
            </Field>
            <Field label="catalogue.tips.fields.description" :error="errors.get('description')">
                <TextEditor v-model="tip.description" class="min-h-48" />
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
