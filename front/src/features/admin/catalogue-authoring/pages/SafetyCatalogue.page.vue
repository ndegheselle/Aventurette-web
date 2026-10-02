<script setup lang="ts">
import List from '@chapelure/ui/data/List.vue';
import Pagination from '@chapelure/ui/data/Pagination.vue';
import SearchInput from '@chapelure/ui/data/SearchInput.vue';
import { useConfirmation } from '@chapelure/ui/modals/useConfirmation';
import type { SafetyInstructionData } from '@features/activities/model/activity';
import SafetyInstructionEditModal from '@features/admin/catalogue-authoring/components/SafetyInstructionEdit.modal.vue';
import { useSafetyInstructionsEditList } from '@features/admin/catalogue-authoring/composables/useCatalogueEditList';
import { newSafetyInstruction } from '@features/admin/catalogue-authoring/model/catalogue.edit';
import { PenIcon, PlusIcon, TrashIcon, TriangleAlertIcon } from 'lucide-vue-next';
import { useTemplateRef } from 'vue';
import { useI18n } from 'vue-i18n';

const { paginated, search, refresh, remove } = useSafetyInstructionsEditList();

const { t } = useI18n();
const confirm = useConfirmation();
const modal = useTemplateRef('modal');

async function edit(instruction: SafetyInstructionData) {
    if (await modal.value?.show(instruction))
        await refresh();
}

// The confirmation is the screen's; the write is the composable's.
async function removeInstruction(instruction: SafetyInstructionData) {
    if (await confirm.show(
        t('confirmation.remove.title'),
        t('catalogue.safety.removeWarning', { name: instruction.name }),
        TriangleAlertIcon,
    ) !== true)
        return;

    await remove(instruction);
}
</script>

<template>
    <div class="flex flex-col gap-2">
        <div class="flex gap-2">
            <SearchInput @search="() => refresh()"
                         v-model="search" />
            <button class="btn btn-primary btn-square"
                    :title="$t('catalogue.safety.new')"
                    @click="() => edit(newSafetyInstruction())">
                <PlusIcon />
            </button>
        </div>

        <List :items="paginated.items"
              v-slot="{ item }"
              class="flex-1">
            <div class="list-col-grow my-auto">
                <b>{{ item.name }}</b>
                <p class="text-xs opacity-60">{{ item.slug }}</p>
            </div>
            <div class="my-auto flex gap-2">
                <button class="btn btn-soft btn-square btn-error"
                        :title="$t('catalogue.remove')"
                        @click="() => removeInstruction(item)">
                    <TrashIcon class="icon-sm" />
                </button>
                <button class="btn btn-soft btn-square"
                        :title="$t('actions.update')"
                        @click="() => edit(item)">
                    <PenIcon class="icon-sm" />
                </button>
            </div>
        </List>

        <Pagination v-if="paginated.options.perPage < paginated.total"
                    v-model:page="paginated.options.page"
                    v-model:perPage="paginated.options.perPage"
                    :total="paginated.total"
                    @change="refresh" />

        <SafetyInstructionEditModal ref="modal" />
    </div>
</template>
