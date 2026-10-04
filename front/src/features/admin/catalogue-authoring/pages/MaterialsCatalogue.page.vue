<script setup vapor lang="ts">
import CatalogueTab from '@features/admin/catalogue-authoring/components/CatalogueTab.vue';
import { useMaterialsEditList } from '@features/admin/catalogue-authoring/composables/useMaterialsEditList';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const {
    paginated,
    search,
    refresh,
    createMaterial,
    renameMaterial,
    remove,
} = useMaterialsEditList();
</script>

<template>
    <CatalogueTab v-model:paginated="paginated"
                  v-model:search="search"
                  add-label="catalogue.materials.add"
                  remove-warning="catalogue.materials.removeWarning"
                  :can-add="!!search.trim()"
                  @refresh="refresh"
                  @add="createMaterial"
                  @remove="remove"
                  v-slot="{ item }">
        <div><img class="size-10 rounded-box"
                 src="https://placeholder.pagebee.io/api/plain/64/64" /></div>
        <input type="text"
               class="input input-ghost w-full my-auto"
               :aria-label="t('catalogue.materials.name')"
               v-model="item.name"
               @change="() => renameMaterial(item.id, item.name)" />
    </CatalogueTab>
</template>
