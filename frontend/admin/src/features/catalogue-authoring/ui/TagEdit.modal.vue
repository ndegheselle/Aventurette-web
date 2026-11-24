<script setup lang="ts">
import Field from '@chapelure/ui/forms/Field.vue';
import FieldError from '@chapelure/ui/forms/FieldError.vue';
import Modal from '@chapelure/ui/modals/Modal.vue';
import { useModal, type IEditModal } from '@chapelure/ui/modals/useModal';
import { Button } from '@chapelure/ui/shadcn/button';
import { Input } from '@chapelure/ui/shadcn/input';
import { NativeSelect, NativeSelectOption } from '@chapelure/ui/shadcn/native-select';
import { ActivityTagType, type ActivityTagData } from '@features/activities/models/tag';
import { tagsApi } from '@features/catalogue-authoring/api/tags.api';
import { useSluggedEditModal } from '@features/catalogue-authoring/composables/useSluggedEditModal';
import { CheckIcon, XIcon } from 'lucide-vue-next';

const controller = useModal<ActivityTagData>();
const { show, confirm, cancel, isNew, isLoading, data: tag, errors } = useSluggedEditModal(controller, tagsApi);

defineExpose<IEditModal<ActivityTagData>>({ show });
</script>

<template>
    <Modal :controller>
        <template #title>
            {{ $t(isNew ? 'catalogue.tags.new' : 'catalogue.tags.edit') }}
        </template>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- A kind is fixed once the tag exists: the activities linking it took it for that kind. -->
            <Field label="catalogue.tags.fields.type" :error="errors.get('type')">
                <NativeSelect class="w-full" v-model="tag.type" :disabled="!isNew">
                    <NativeSelectOption v-for="type in ActivityTagType" :key="type" :value="type">
                        {{ $t(`activities.tagType.${type}`) }}
                    </NativeSelectOption>
                </NativeSelect>
            </Field>
            <Field label="catalogue.fields.name" :error="errors.get('name')">
                <Input type="text" :aria-invalid="!!errors.get('name') || undefined"
                    v-model="tag.name" />
            </Field>
            <Field label="catalogue.fields.slug" :error="errors.get('slug')">
                <Input type="text" :aria-invalid="!!errors.get('slug') || undefined"
                    v-model="tag.slug" />
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
