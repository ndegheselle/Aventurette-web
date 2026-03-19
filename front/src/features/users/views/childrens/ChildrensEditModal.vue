<script setup lang="ts">
import { useTemplateRef, computed } from 'vue';
import { childrens } from '@features/users/data/childrens';
import { SaveIcon, XIcon } from 'lucide-vue-next';
import { useEditModal } from '@common/composables/data/useEditModal';
import FieldLabel from '@common/components/form/FieldLabel.vue';
import FieldError from '@common/components/form/FieldError.vue';

const dialog = useTemplateRef('dialog');
const { show, confirm, cancel, isNew, data, errors, isLoading } = useEditModal(dialog, childrens);
const children = computed(() => data.value);
defineExpose({ show });
</script>

<template>
    <dialog ref="dialog" class="modal">
        <div class="modal-box">
            <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" @click="cancel">
                <XIcon />
            </button>
            <h3 class="text-lg font-bold">
                {{ isNew ? $t('actions.new') : $t('actions.update') }}
            </h3>

            <div class="flex flex-1">
                <fieldset class="fieldset grow">
                    <FieldLabel label="childrens.form.name" :error="errors.get('name')">
                        <input class="input w-full" v-model="children.name"
                            :class="{ 'input-error': errors.get('name') }" />
                    </FieldLabel>
                    <FieldLabel label="childrens.form.age" :error="errors.get('age')">
                        <input type="number" v-model="children.age" class="input w-full" :class="{ 'input-error': errors.get('age') }"
                            min="0" />
                    </FieldLabel>
                </fieldset>
            </div>

            <FieldError :error="errors.global.value" />

            <div class="modal-action">
                <button class="btn" @click="cancel">
                    <XIcon />
                    {{ $t('actions.cancel') }}
                </button>
                <button class="btn btn-primary" :disabled="isLoading" @click="confirm">
                    <span v-if="isLoading" class="loading loading-spinner loading-sm"></span>
                    <SaveIcon />
                    {{ $t('actions.save') }}
                </button>
            </div>
        </div>
        <div class="modal-backdrop">
            <button @click="cancel">close</button>
        </div>
    </dialog>
</template>