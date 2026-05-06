<script setup lang="ts">
import FieldError from '@chapelure/common/components/form/FieldError.vue';
import FieldLabel from '@chapelure/common/components/form/FieldLabel.vue';
import Modal from '@chapelure/common/components/popups/Modal.vue';
import { useEditModal } from '@chapelure/common/composables/data/useEditModal';
import { useModal } from '@chapelure/common/composables/popups/useModal';
import { useChildrens, type ChildrenData } from '@features/users/composables/data/childrens';
import InterestsSelect from '@features/users/pages/childrens/InterestsSelect.vue';
import { SaveIcon, XIcon } from 'lucide-vue-next';
import { computed } from 'vue';

const controller = useModal<ChildrenData>();
const childrens = useChildrens();
const { show, confirm, cancel, isNew, data, errors, isLoading } = useEditModal(controller, childrens);
const children = computed(() => data.value);
defineExpose({ show });
</script>

<template>
    <Modal :controller="controller">
        <template #title>
            {{ isNew ? $t('actions.new') : $t('actions.update') }}
        </template>

        <div class="flex flex-1 flex-col">
            <fieldset class="fieldset grow">
                <FieldLabel label="childrens.form.name" :error="errors.get('name')">
                    <input class="input w-full" v-model="children.name"
                        :class="{ 'input-error': errors.get('name') }" />
                </FieldLabel>
                <FieldLabel label="childrens.form.age" :error="errors.get('age')">
                    <input type="number" v-model="children.age" class="input w-full"
                        :class="{ 'input-error': errors.get('age') }" min="0" />
                </FieldLabel>
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