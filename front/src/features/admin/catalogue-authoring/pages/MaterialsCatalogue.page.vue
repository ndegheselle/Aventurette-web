<script setup lang="ts">
import List from '@chapelure/ui/data/List.vue';
import Pagination from '@chapelure/ui/data/Pagination.vue';
import SearchInput from '@chapelure/ui/data/SearchInput.vue';
import { useConfirmation } from '@chapelure/ui/modals/useConfirmation';
import type { MaterialData } from '@features/activities/model/material';
import { useMaterialsEditList } from '@features/admin/catalogue-authoring/composables/useMaterialsEditList';
import { PlusIcon, TrashIcon, TriangleAlertIcon } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';

const {
    paginated,
    search,
    refresh,
    createMaterial,
    renameMaterial,
    removeMaterial,
} = useMaterialsEditList();

const { t } = useI18n();
const confirm = useConfirmation();

// The confirmation is the screen's; the write is the composable's.
async function remove(material: MaterialData) {
    if (await confirm.show(
        t('confirmation.remove.title'),
        t('catalogue.materials.removeWarning', { name: material.name }),
        TriangleAlertIcon,
    ) !== true)
        return;

    await removeMaterial(material);
}
</script>

<template>
    <div class="flex flex-col gap-2">
        <div class="flex flex-wrap gap-2">
            <div class="flex-1 min-w-64 flex gap-2">
                <SearchInput @search="() => refresh()"
                             v-model="search" />
                <button v-on:click="createMaterial"
                        class="btn btn-primary btn-square"
                        :disabled="!search.trim()"
                        :title="$t('catalogue.materials.add')">
                    <PlusIcon />
                </button>
            </div>
        </div>

        <List :items="paginated.items"
              v-slot="{ item }"
              class="flex-1">
            <div><img class="size-10 rounded-box"
                     src="https://placeholder.pagebee.io/api/plain/64/64" /></div>
            <input type="text"
                   class="input input-ghost w-full my-auto"
                   :aria-label="$t('catalogue.materials.name')"
                   v-model="item.name"
                   @change="() => renameMaterial(item)" />
            <button class="btn btn-soft btn-square btn-error my-auto"
                    :title="$t('catalogue.materials.remove')"
                    @click="() => remove(item)">
                <TrashIcon class="icon-sm" />
            </button>
        </List>

        <Pagination v-if="paginated.options.perPage < paginated.total"
                    v-model:page="paginated.options.page"
                    v-model:perPage="paginated.options.perPage"
                    :total="paginated.total"
                    @change="refresh" />
    </div>
</template>
