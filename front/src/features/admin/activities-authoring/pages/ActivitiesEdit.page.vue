<script setup lang="ts">
import List from '@chapelure/ui/data/List.vue';
import Pagination from '@chapelure/ui/data/Pagination.vue';
import Container from '@chapelure/ui/layout/Container.vue';
import { useNavbar } from '@chapelure/ui/layout/useNavbar';
import { useConfirmation } from '@chapelure/ui/modals/useConfirmation';
import { ActivityState, type ActivityData } from '@features/activities/model/activity';
import ActivityImportModal from '@features/admin/activities-authoring/components/ActivityImport.modal.vue';
import { useActivitiesEditList } from '@features/admin/activities-authoring/composables/useActivitiesEditList';
import { authoredStateTabs } from '@features/admin/activities-authoring/model/activity.edit';
import { routesNames } from '@features/admin/activities-authoring/routes';
import { ImportIcon, PenIcon, PlusIcon, TrashIcon, TriangleAlertIcon } from 'lucide-vue-next';
import { useTemplateRef } from 'vue';
import { useI18n } from 'vue-i18n';

const {
    paginated,
    state,
    refresh,
    selectState,
    removeActivity,
} = useActivitiesEditList();

const { t } = useI18n();
const confirm = useConfirmation();
const importModal = useTemplateRef('importModal');

// The confirmation is the screen's; the write is the composable's.
async function remove(activity: ActivityData) {
    if (await confirm.show(
        t('confirmation.remove.title'),
        t('confirmation.remove.message', { name: activity.name }),
        TriangleAlertIcon,
    ) !== true)
        return;

    await removeActivity(activity);
}

useNavbar(t('activities.authoring.title'));
</script>

<template>
    <Container>
        <div class="flex gap-2">
            <div role="tablist"
                 class="tabs flex-1 tabs-box">
                <a v-for="tab in authoredStateTabs"
                   :key="tab.label"
                   role="tab"
                   class="tab"
                   :class="{ 'tab-active': state === tab.value }"
                   @click="selectState(tab.value)">
                    {{ $t(tab.label) }}
                </a>
            </div>
            <div class="ms-auto my-auto flex gap-2">
                <button class="btn btn-soft btn-square"
                        :title="$t('activities.authoring.import.title')"
                        @click="() => importModal?.show()">
                    <ImportIcon />
                </button>
                <RouterLink class="btn btn-primary btn-square"
                            :title="$t('actions.add')"
                            :to="{ name: routesNames.new }">
                    <PlusIcon />
                </RouterLink>
            </div>
        </div>

        <List :items="paginated.items"
              v-slot="{ item }"
              class="flex-1">
            <div><img class="size-16 rounded-box"
                     src="https://placeholder.pagebee.io/api/plain/64/64" /></div>
            <div>
                <div class="flex flex-wrap gap-2">
                    <b class="my-auto">{{ item.name }}</b>
                    <span class="badge badge-sm my-auto"
                          :class="item.state === ActivityState.PUBLISHED ? 'badge-success' : 'badge-ghost'">
                        {{ $t(`activities.state.${item.state}`) }}
                    </span>
                </div>
                <p class="text-xs"
                   v-html="item.description"></p>
            </div>
            <div class="my-auto flex gap-2">
                <a class="btn btn-soft btn-square btn-error"
                   @click="() => remove(item)">
                    <TrashIcon class="icon-sm" />
                </a>
                <RouterLink class="btn btn-soft btn-square"
                            :to="{ name: routesNames.page, params: { id: item.id } }">
                    <PenIcon class="icon-sm" />
                </RouterLink>
            </div>
        </List>

        <Pagination v-if="paginated.options.perPage < paginated.total"
                    v-model:page="paginated.options.page"
                    v-model:perPage="paginated.options.perPage"
                    :total="paginated.total"
                    @change="refresh" />

        <ActivityImportModal ref="importModal" />
    </Container>
</template>
