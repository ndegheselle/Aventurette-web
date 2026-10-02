<script setup lang="ts">
import List from '@chapelure/ui/data/List.vue';
import Pagination from '@chapelure/ui/data/Pagination.vue';
import SearchInput from '@chapelure/ui/data/SearchInput.vue';
import { useConfirmation } from '@chapelure/ui/modals/useConfirmation';
import { ActivityTagType, type ActivityTagData } from '@features/activities/model/tag';
import TagEditModal from '@features/admin/catalogue-authoring/components/TagEdit.modal.vue';
import { useTagsEditList } from '@features/admin/catalogue-authoring/composables/useCatalogueEditList';
import { newTag } from '@features/admin/catalogue-authoring/model/catalogue.edit';
import { PenIcon, PlusIcon, TrashIcon, TriangleAlertIcon } from 'lucide-vue-next';
import { useTemplateRef } from 'vue';
import { useI18n } from 'vue-i18n';

const { paginated, search, type, refresh, selectType, remove } = useTagsEditList();

const { t } = useI18n();
const confirm = useConfirmation();
const modal = useTemplateRef('modal');

async function edit(tag: ActivityTagData) {
    if (await modal.value?.show(tag))
        await refresh();
}

// The confirmation is the screen's; the write is the composable's.
async function removeTag(tag: ActivityTagData) {
    if (await confirm.show(
        t('confirmation.remove.title'),
        t('catalogue.tags.removeWarning', { name: tag.name }),
        TriangleAlertIcon,
    ) !== true)
        return;

    await remove(tag);
}
</script>

<template>
    <div class="flex flex-col gap-2">
        <div class="flex flex-wrap gap-2">
            <select class="select w-auto"
                    :aria-label="$t('catalogue.tags.fields.type')"
                    :value="type"
                    @change="selectType(($event.target as HTMLSelectElement).value as ActivityTagType || null)">
                <option value="">{{ $t('catalogue.tags.allTypes') }}</option>
                <option v-for="kind in ActivityTagType" :key="kind" :value="kind">
                    {{ $t(`activities.tagType.${kind}`) }}
                </option>
            </select>
            <div class="flex-1 min-w-64 flex gap-2">
                <SearchInput @search="() => refresh()"
                             v-model="search" />
                <button class="btn btn-primary btn-square"
                        :title="$t('catalogue.tags.new')"
                        @click="() => edit(newTag(type))">
                    <PlusIcon />
                </button>
            </div>
        </div>

        <List :items="paginated.items"
              v-slot="{ item }"
              class="flex-1">
            <div class="list-col-grow my-auto">
                <div class="flex flex-wrap gap-2">
                    <b>{{ item.name }}</b>
                    <span class="badge badge-sm badge-ghost my-auto">{{ $t(`activities.tagType.${item.type}`) }}</span>
                </div>
                <p class="text-xs opacity-60">{{ item.slug }}</p>
            </div>
            <div class="my-auto flex gap-2">
                <button class="btn btn-soft btn-square btn-error"
                        :title="$t('catalogue.remove')"
                        @click="() => removeTag(item)">
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

        <TagEditModal ref="modal" />
    </div>
</template>
