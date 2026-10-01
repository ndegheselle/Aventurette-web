<script setup lang="ts">
import List from '@chapelure/ui/data/List.vue';
import Pagination from '@chapelure/ui/data/Pagination.vue';
import SearchInput from '@chapelure/ui/data/SearchInput.vue';
import { useConfirmation } from '@chapelure/ui/modals/useConfirmation';
import type { ActivityTipData } from '@features/activities/model/activity';
import TipEditModal from '@features/admin/catalogue-authoring/components/TipEdit.modal.vue';
import { useTipsEditList } from '@features/admin/catalogue-authoring/composables/useCatalogueEditList';
import { newTip } from '@features/admin/catalogue-authoring/model/catalogue.edit';
import { PenIcon, PlusIcon, TrashIcon, TriangleAlertIcon } from 'lucide-vue-next';
import { useTemplateRef } from 'vue';
import { useI18n } from 'vue-i18n';

const { paginated, search, refresh, remove } = useTipsEditList();

const { t } = useI18n();
const confirm = useConfirmation();
const modal = useTemplateRef('modal');

async function edit(tip: ActivityTipData) {
    if (await modal.value?.show(tip))
        await refresh();
}

// The confirmation is the screen's; the write is the composable's.
async function removeTip(tip: ActivityTipData) {
    if (await confirm.show(
        t('confirmation.remove.title'),
        t('catalogue.tips.removeWarning', { name: tip.name }),
        TriangleAlertIcon,
    ) !== true)
        return;

    await remove(tip);
}
</script>

<template>
    <div class="flex flex-col gap-2">
        <div class="flex gap-2">
            <SearchInput @search="() => refresh()"
                         v-model="search" />
            <button class="btn btn-primary btn-square"
                    :title="$t('catalogue.tips.new')"
                    @click="() => edit(newTip())">
                <PlusIcon />
            </button>
        </div>

        <List :items="paginated.items"
              v-slot="{ item }"
              class="flex-1">
            <div class="list-col-grow my-auto">
                <b>{{ item.name }}</b>
                <div class="text-xs opacity-60 line-clamp-2" v-html="item.description"></div>
            </div>
            <div class="my-auto flex gap-2">
                <button class="btn btn-soft btn-square btn-error"
                        :title="$t('catalogue.remove')"
                        @click="() => removeTip(item)">
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

        <TipEditModal ref="modal" />
    </div>
</template>
