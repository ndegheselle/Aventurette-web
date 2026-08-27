<script setup lang="ts">
import { childrenRepository } from '@features/users/data/children.repository';
import { useEditModal } from '@chapelure/ui/composables/useEditModal';
import { useModal, type IEditModal } from '@chapelure/ui/composables/useModal';
import Field from '@chapelure/ui/forms/Field.vue';
import FieldError from '@chapelure/ui/forms/FieldError.vue';
import Fieldset from '@chapelure/ui/forms/Fieldset.vue';
import { SaveIcon, XIcon } from 'lucide-vue-next';
import Modal from '@chapelure/ui/overlays/Modal.vue';
import Button from '@chapelure/ui/primitives/Button.vue';
import TextInput from '@chapelure/ui/primitives/TextInput.vue';
import { type ChildrenData } from '@features/users/model/child';
import InterestsSelect from '@features/users/components/children/InterestsSelect.vue';
import { computed } from 'vue';

const controller = useModal<ChildrenData>();
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
            <Fieldset class="grow">
                <Field label="children.form.name" :error="errors.get('name')">
                    <TextInput v-model="children.name" :error="!!errors.get('name')" />
                </Field>
                <Field label="children.form.age" :error="errors.get('age')">
                    <TextInput type="number" v-model="children.age" :error="!!errors.get('age')" min="0" />
                </Field>
            </Fieldset>

            <InterestsSelect v-model:selected="children.interests" />
        </div>
        <FieldError :error="errors.global.value" />

        <template #actions>
            <Button @click="cancel">
                <XIcon />
                {{ $t('actions.cancel') }}
            </Button>
            <Button variant="primary" :loading="isLoading" @click="confirm">
                <SaveIcon />
                {{ $t('actions.save') }}
            </Button>
        </template>
    </Modal>
</template>
