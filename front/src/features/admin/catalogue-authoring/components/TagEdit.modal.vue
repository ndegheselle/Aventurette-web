<script setup lang="ts">
import Field from '@chapelure/ui/forms/Field.vue';
import FieldError from '@chapelure/ui/forms/FieldError.vue';
import Modal from '@chapelure/ui/modals/Modal.vue';
import { useEditModal } from '@chapelure/ui/modals/useEditModal';
import { useModal, type IEditModal } from '@chapelure/ui/modals/useModal';
import { ActivityTagType, type ActivityTagData } from '@features/activities/model/tag';
import { tagsApi } from '@features/admin/catalogue-authoring/api/tags.api';
import { slugFollowing } from '@features/admin/catalogue-authoring/model/catalogue.edit';
import { CheckIcon, XIcon } from 'lucide-vue-next';
import { watch } from 'vue';

const controller = useModal<ActivityTagData>();
const { show, confirm, cancel, isNew, isLoading, data: tag, errors } = useEditModal(controller, tagsApi);

watch(() => tag.value.name, (name, previous) => {
    if (isNew.value)
        tag.value.slug = slugFollowing(tag.value.slug ?? '', previous ?? '', name ?? '');
});

defineExpose<IEditModal<ActivityTagData>>({ show });
</script>

<template>
    <Modal :controller>
        <template #title>
            {{ $t(isNew ? 'catalogue.tags.new' : 'catalogue.tags.edit') }}
        </template>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-x-4">
            <!-- A kind is fixed once the tag exists: the activities linking it took it for that kind. -->
            <Field label="catalogue.tags.fields.type" :error="errors.get('type')">
                <select class="select w-full" v-model="tag.type" :disabled="!isNew">
                    <option v-for="type in ActivityTagType" :key="type" :value="type">
                        {{ $t(`activities.tagType.${type}`) }}
                    </option>
                </select>
            </Field>
            <Field label="catalogue.fields.name" :error="errors.get('name')">
                <input type="text" class="input w-full" :class="{ 'input-error': !!errors.get('name') }"
                    v-model="tag.name" />
            </Field>
            <Field label="catalogue.fields.slug" :error="errors.get('slug')">
                <input type="text" class="input w-full" :class="{ 'input-error': !!errors.get('slug') }"
                    v-model="tag.slug" />
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
