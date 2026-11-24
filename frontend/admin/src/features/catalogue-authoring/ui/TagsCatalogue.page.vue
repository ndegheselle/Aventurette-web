<script setup lang="ts">
import { Badge } from '@chapelure/ui/shadcn/badge';
import { NativeSelect, NativeSelectOption } from '@chapelure/ui/shadcn/native-select';
import { ActivityTagType, type ActivityTagData } from '@features/activities/models/tag';
import CatalogueTab from '@features/catalogue-authoring/ui/CatalogueTab.vue';
import TagEditModal from '@features/catalogue-authoring/ui/TagEdit.modal.vue';
import { useTagsEditList } from '@features/catalogue-authoring/composables/useCatalogueEditList';
import { newTag } from '@features/catalogue-authoring/models/catalogue.edit';
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
            <NativeSelect :aria-label="$t('catalogue.tags.fields.type')"
                          :model-value="type ?? ''"
                          @change="selectType(($event.target as HTMLSelectElement).value as ActivityTagType || null)">
                <NativeSelectOption value="">{{ $t('catalogue.tags.allTypes') }}</NativeSelectOption>
                <NativeSelectOption v-for="kind in ActivityTagType" :key="kind" :value="kind">
                    {{ $t(`activities.tagType.${kind}`) }}
                </NativeSelectOption>
            </NativeSelect>
        </template>

        <template #default="{ item }">
            <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                    <b>{{ item.name }}</b>
                    <Badge variant="secondary">{{ $t(`activities.tagType.${item.type}`) }}</Badge>
                </div>
                <p class="text-xs text-muted-foreground">{{ item.slug }}</p>
            </div>
        </template>
    </CatalogueTab>

    <TagEditModal ref="modal" />
</template>
