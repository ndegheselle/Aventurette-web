<script setup lang="ts">
import { ActivityTagType, type ActivityTagData } from '@features/activities/model/tag';
import CatalogueTab from '@features/admin/catalogue-authoring/components/CatalogueTab.vue';
import TagEditModal from '@features/admin/catalogue-authoring/components/TagEdit.modal.vue';
import { useTagsEditList } from '@features/admin/catalogue-authoring/composables/useCatalogueEditList';
import { newTag } from '@features/admin/catalogue-authoring/model/catalogue.edit';
import { useTemplateRef } from 'vue';

const { paginated, search, type, refresh, selectType, remove } = useTagsEditList();

const modal = useTemplateRef('modal');

async function edit(tag: ActivityTagData) {
    if (await modal.value?.show(tag))
        await refresh();
}
</script>

<template>
    <CatalogueTab v-model:paginated="paginated"
                  v-model:search="search"
                  add-label="catalogue.tags.new"
                  remove-warning="catalogue.tags.removeWarning"
                  editable
                  @refresh="refresh"
                  @add="() => edit(newTag(type))"
                  @edit="edit"
                  @remove="remove">
        <template #toolbar>
            <select class="select w-auto"
                    :aria-label="$t('catalogue.tags.fields.type')"
                    :value="type"
                    @change="selectType(($event.target as HTMLSelectElement).value as ActivityTagType || null)">
                <option value="">{{ $t('catalogue.tags.allTypes') }}</option>
                <option v-for="kind in ActivityTagType" :key="kind" :value="kind">
                    {{ $t(`activities.tagType.${kind}`) }}
                </option>
            </select>
        </template>

        <template #default="{ item }">
            <div class="list-col-grow my-auto">
                <div class="flex flex-wrap gap-2">
                    <b>{{ item.name }}</b>
                    <span class="badge badge-sm badge-ghost my-auto">{{ $t(`activities.tagType.${item.type}`) }}</span>
                </div>
                <p class="text-xs opacity-60">{{ item.slug }}</p>
            </div>
        </template>
    </CatalogueTab>

    <TagEditModal ref="modal" />
</template>
