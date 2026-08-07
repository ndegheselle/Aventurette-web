<script setup lang="ts">
import FieldError from '@chapelure/ui/forms/FieldError.vue';
import Field from '@chapelure/ui/forms/Field.vue';
import Modal from '@chapelure/ui/overlays/Modal.vue';
import { useEditModal } from '@chapelure/ui/composables/useEditModal';
import { useModal, type IEditModal } from '@chapelure/ui/composables/useModal';
import { useChildren, type ChildrenData } from '@features/users/composables/data/children';
import InterestsSelect from '@features/users/pages/children/InterestsSelect.vue';
import { SaveIcon, XIcon } from '@chapelure/ui/icons';
import { computed } from 'vue';

const controller = useModal<ChildrenData>();
const childrenRepository = useChildren();
const { show, confirm, cancel, isNew, data, errors, isLoading } = useEditModal(controller, childrenRepository);
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
                    <input class="input w-full" v-model="children.name"
                        :class="{ 'input-error': errors.get('name') }" />
                </Field>
                <Field label="children.form.age" :error="errors.get('age')">
                    <input type="number" v-model="children.age" class="input w-full"
                        :class="{ 'input-error': errors.get('age') }" min="0" />
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