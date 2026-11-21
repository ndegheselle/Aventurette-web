<script setup lang="ts">
import { Input } from '@chapelure/ui/shadcn/input';
import CatalogueTab from '@features/admin/catalogue-authoring/ui/CatalogueTab.vue';
import { useMaterialsEditList } from '@features/admin/catalogue-authoring/composables/useMaterialsEditList';

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
        <div><img class="size-10 rounded-md"
                 src="https://placeholder.pagebee.io/api/plain/64/64" /></div>
        <!-- Reads as text until focused: a name is renamed in place. -->
        <Input type="text"
               class="flex-1 border-transparent bg-transparent shadow-none dark:bg-transparent"
               :aria-label="$t('catalogue.materials.name')"
               v-model="item.name"
               @change="() => renameMaterial(item.id, item.name)" />
    </CatalogueTab>
</template>
