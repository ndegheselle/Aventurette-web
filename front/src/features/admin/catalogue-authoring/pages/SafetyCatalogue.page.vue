<script setup vapor lang="ts">
import type { SafetyInstructionData } from '@features/activities/model/activity';
import CatalogueTab from '@features/admin/catalogue-authoring/components/CatalogueTab.vue';
import SafetyInstructionEditModal from '@features/admin/catalogue-authoring/components/SafetyInstructionEdit.modal.vue';
import { useSafetyInstructionsEditList } from '@features/admin/catalogue-authoring/composables/useCatalogueEditList';
import { newSafetyInstruction } from '@features/admin/catalogue-authoring/model/catalogue.edit';
import { useTemplateRef } from 'vue';

const { paginated, search, refresh, remove } = useSafetyInstructionsEditList();

const modal = useTemplateRef('modal');

async function edit(instruction: SafetyInstructionData) {
    if (await modal.value?.show(instruction))
        await refresh();
}
</script>

<template>
    <CatalogueTab v-model:paginated="paginated"
                  v-model:search="search"
                  add-label="catalogue.safety.new"
                  remove-warning="catalogue.safety.removeWarning"
                  editable
                  @refresh="refresh"
                  @add="() => edit(newSafetyInstruction())"
                  @edit="edit"
                  @remove="remove"
                  v-slot="{ item }">
        <div class="list-col-grow my-auto">
            <b>{{ item.name }}</b>
            <p class="text-xs opacity-60">{{ item.slug }}</p>
        </div>
    </CatalogueTab>

    <SafetyInstructionEditModal ref="modal" />
</template>
