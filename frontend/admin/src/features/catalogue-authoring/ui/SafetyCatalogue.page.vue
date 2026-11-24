<script setup lang="ts">
import type { SafetyInstructionData } from '@features/activities/models/activity';
import CatalogueTab from '@features/catalogue-authoring/ui/CatalogueTab.vue';
import SafetyInstructionEditModal from '@features/catalogue-authoring/ui/SafetyInstructionEdit.modal.vue';
import { useSafetyInstructionsEditList } from '@features/catalogue-authoring/composables/useCatalogueEditList';
import { newSafetyInstruction } from '@features/catalogue-authoring/models/catalogue.edit';
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
        <div class="flex-1 min-w-0">
            <b>{{ item.name }}</b>
            <p class="text-xs text-muted-foreground">{{ item.slug }}</p>
        </div>
    </CatalogueTab>

    <SafetyInstructionEditModal ref="modal" />
</template>
