<script setup lang="ts">
import { childrenApi } from '@features/users/api/children.api';
import { useEditModal } from '@chapelure/ui/composables/useEditModal';
import { useModal, type IEditModal } from '@chapelure/ui/composables/useModal';
import Field from '@chapelure/ui/forms/Field.vue';
import FieldError from '@chapelure/ui/forms/FieldError.vue';
import { SaveIcon, XIcon } from 'lucide-vue-next';
import Modal from '@chapelure/ui/overlays/Modal.vue';
import { type ChildrenData } from '@features/users/model/child';
import InterestsSelect from '@features/users/components/children/InterestsSelect.vue';
import { computed } from 'vue';

const controller = useModal<ChildrenData>();
const { show, confirm, cancel, isNew, data, errors, isLoading } = useEditModal(controller, childrenApi);
const children = computed(() => data.value);
defineExpose<IEditModal<ChildrenData>>({ show });
</script>

<template>
    <Modal :controller="controller">
        <template #title>
            {{ isNew ? $t('actions.new') : $t('actions.update') }}
        </template>

        <div class="flex flex-1 flex-col">
            <fieldset class="fieldset grow">
                <Field label="children.form.name" :error="errors.get('name')">
                    <input type="text" class="input w-full"
                           :class="{ 'input-error': !!errors.get('name') }"
                           v-model="children.name" />
                </Field>
                <Field label="children.form.age" :error="errors.get('age')">
                    <input type="number" class="input w-full"
                           :class="{ 'input-error': !!errors.get('age') }"
                           v-model="children.age" min="0" />
                </Field>
            </fieldset>

            <InterestsSelect v-model:selected="children.interests" />
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
