<script setup lang="ts">
import List from '@chapelure/ui/data/List.vue';
import Pagination from '@chapelure/ui/data/Pagination.vue';
import Container from '@chapelure/ui/layout/Container.vue';
import { useConfirmation } from '@chapelure/ui/modals/useConfirmation';
import { ActivityState, type ActivityData } from '@features/activities/model/activity';
import ActivityRowActions from '@features/activities-authoring/components/ActivityRowActions.vue';
import { useActivitiesEditList } from '@features/activities-authoring/composables/useActivitiesEditList';
import { authoredStateTabs } from '@features/activities-authoring/model/activity.edit';
import { PlusIcon, TriangleAlertIcon } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';

const {
    paginated,
    state,
    refresh,
    selectState,
    isCreating,
    createActivity,
    removeActivity,
} = useActivitiesEditList();

const { t } = useI18n();
const confirm = useConfirmation();

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
</script>

<template>
    <Container>
        <div class="flex gap-2">
            <h1 class="text-2xl my-auto">{{ $t('activities.edit.title') }}</h1>
            <button class="btn btn-primary ms-auto"
                    :disabled="isCreating"
                    @click="createActivity">
                <span v-if="isCreating" class="loading loading-spinner loading-sm"></span>
                <PlusIcon />
                {{ $t('actions.add') }}
            </button>
        </div>

        <div role="tablist" class="tabs tabs-box">
            <a v-for="tab in authoredStateTabs"
               :key="tab.label"
               role="tab"
               class="tab"
               :class="{ 'tab-active': state === tab.value }"
               @click="selectState(tab.value)">
                {{ $t(tab.label) }}
            </a>
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

            <ActivityRowActions :id="item.id" @remove="() => remove(item)" />
        </List>

        <Pagination v-if="paginated.options.perPage < paginated.total"
                    v-model:page="paginated.options.page"
                    v-model:perPage="paginated.options.perPage"
                    :total="paginated.total"
                    @change="refresh" />
    </Container>
</template>
