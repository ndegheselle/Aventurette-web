<script setup vapor lang="ts">
import type { ActivityTipData } from '@features/activities/model/activity';
import CatalogueTab from '@features/admin/catalogue-authoring/components/CatalogueTab.vue';
import TipEditModal from '@features/admin/catalogue-authoring/components/TipEdit.modal.vue';
import { useTipsEditList } from '@features/admin/catalogue-authoring/composables/useCatalogueEditList';
import { newTip } from '@features/admin/catalogue-authoring/model/catalogue.edit';
import { useTemplateRef } from 'vue';

const { paginated, search, refresh, remove } = useTipsEditList();

const modal = useTemplateRef('modal');

async function edit(tip: ActivityTipData) {
    if (await modal.value?.show(tip))
        await refresh();
}
</script>

<template>
    <CatalogueTab v-model:paginated="paginated"
                  v-model:search="search"
                  add-label="catalogue.tips.new"
                  remove-warning="catalogue.tips.removeWarning"
                  editable
                  @refresh="refresh"
                  @add="() => edit(newTip())"
                  @edit="edit"
                  @remove="remove"
                  v-slot="{ item }">
        <div class="list-col-grow my-auto">
            <b>{{ item.name }}</b>
            <div class="text-xs opacity-60 line-clamp-2" v-html="item.description"></div>
        </div>
    </CatalogueTab>

    <TipEditModal ref="modal" />
</template>
