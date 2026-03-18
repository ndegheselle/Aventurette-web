<script setup lang="ts">
import EditModal from '@common/components/data/EditModal.vue';
import { computed, useTemplateRef } from 'vue';
import { type ChildrenData, childrens } from '@features/users/data/childrens';
import FormInput from '@common/components/form/FormInput.vue';

const dialog = useTemplateRef('dialog');
const data = computed(() => dialog.value?.data);
function show(child: ChildrenData) {
  return dialog.value!.show(child)
}
defineExpose({ client: data, show });
</script>

<template>
    <EditModal :crud="childrens" ref="dialog">
        <template #form="{ data, errors }">
            <fieldset class="fieldset ">
                <FormInput v-model="data.name" :error="errors.get" label="Nom *" />
                <FormInput type="number" v-model="data.age" :error="errors?.sku" label="SKU" />
            </fieldset>
        </template>
    </EditModal>
</template>