<!--
  What every catalogue tab shows around its entries: the search and the add button, a delete
  button on each row (and an edit one when `editable`), and the pages. What a row reads as is the
  tab's, through the default slot; `toolbar` goes before the search.

  Deleting asks first: the confirmation is the screen's, the write is the tab's `@remove`.
-->
<script setup lang="ts" generic="T extends { id: string, name: string }">
import type { Paginated } from '@chapelure/core';
import List from '@chapelure/ui/data/List.vue';
import Pagination from '@chapelure/ui/data/Pagination.vue';
import SearchInput from '@chapelure/ui/data/SearchInput.vue';
import { useConfirmation } from '@chapelure/ui/modals/useConfirmation';
import { PenIcon, PlusIcon, TrashIcon, TriangleAlertIcon } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';

const { addLabel, removeWarning, canAdd = true, editable = false } = defineProps<{
    /** The add button's title, as a translation key. */
    addLabel: string,
    /** What deleting an entry does, as a translation key given the entry's `name`. */
    removeWarning: string,
    canAdd?: boolean,
    editable?: boolean,
}>();

const paginated = defineModel<Paginated<T>>('paginated', { required: true });
const search = defineModel<string>('search', { required: true });

const emit = defineEmits<{
    refresh: [],
    add: [],
    edit: [entry: T],
    remove: [entry: T],
}>();

defineSlots<{
    default(props: { item: T }): any,
    toolbar?(): any,
}>();

const { t } = useI18n();
const confirm = useConfirmation();

async function confirmRemove(entry: T) {
    const confirmed = await confirm.show(
        t('confirmation.remove.title'),
        t(removeWarning, { name: entry.name }),
        TriangleAlertIcon,
    );
    if (confirmed !== true) return;

    emit('remove', entry);
}
</script>

<template>
    <div class="flex flex-col gap-2">
        <div class="flex flex-wrap gap-2">
            <slot name="toolbar" />
            <div class="flex-1 min-w-64 flex gap-2">
                <SearchInput @search="() => emit('refresh')"
                             v-model="search" />
                <button class="btn btn-primary btn-square"
                        :disabled="!canAdd"
                        :title="$t(addLabel)"
                        @click="() => emit('add')">
                    <PlusIcon />
                </button>
            </div>
        </div>

        <List :items="paginated.items"
              v-slot="{ item }"
              class="flex-1">
            <slot :item="item" />
            <div class="my-auto flex gap-2">
                <button class="btn btn-soft btn-square btn-error"
                        :title="$t('catalogue.remove')"
                        @click="() => confirmRemove(item)">
                    <TrashIcon class="icon-sm" />
                </button>
                <button v-if="editable"
                        class="btn btn-soft btn-square"
                        :title="$t('actions.update')"
                        @click="() => emit('edit', item)">
                    <PenIcon class="icon-sm" />
                </button>
            </div>
        </List>

        <Pagination v-if="paginated.options.perPage < paginated.total"
                    v-model:page="paginated.options.page"
                    v-model:perPage="paginated.options.perPage"
                    :total="paginated.total"
                    @change="() => emit('refresh')" />
    </div>
</template>
