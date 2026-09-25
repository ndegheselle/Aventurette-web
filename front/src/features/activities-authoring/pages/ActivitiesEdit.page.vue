<script setup lang="ts">
import List from '@chapelure/ui/data/List.vue';
import Pagination from '@chapelure/ui/data/Pagination.vue';
import Container from '@chapelure/ui/layout/Container.vue';
import { useConfirmation } from '@chapelure/ui/modals/useConfirmation';
import ActivityRowActions from '@features/activities-authoring/components/ActivityRowActions.vue';
import { useActivitiesEditList } from '@features/activities-authoring/composables/useActivitiesEditList';
import { authoredStateTabs } from '@features/activities-authoring/model/activity.edit';
import { ActivityState, type ActivityData } from '@features/activities/model/activity';
import { PlusIcon, TriangleAlertIcon } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';
import { inject, onMounted } from 'vue';
import { useNavbar } from '@/app/useNavbar';

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

useNavbar(t('activities.authoring.title'));
</script>

<template>
    <Container>
        <div role="tablist" class="tabs tabs-box">
            <a v-for="tab in authoredStateTabs" :key="tab.label" role="tab" class="tab"
                :class="{ 'tab-active': state === tab.value }" @click="selectState(tab.value)">
                {{ $t(tab.label) }}
            </a>
            <button class="btn btn-primary btn-circle ms-auto" :disabled="isCreating" @click="createActivity">
                <PlusIcon />
            </button>
        </div>
        <List :items="paginated.items" v-slot="{ item }" class="flex-1">
            <div><img class="size-16 rounded-box" src="https://placeholder.pagebee.io/api/plain/64/64" /></div>
            <div>
                <div class="flex flex-wrap gap-2">
                    <b class="my-auto">{{ item.name }}</b>
                    <span class="badge badge-sm my-auto"
                        :class="item.state === ActivityState.PUBLISHED ? 'badge-success' : 'badge-ghost'">
                        {{ $t(`activities.state.${item.state}`) }}
                    </span>
                </div>
                <p class="text-xs" v-html="item.description"></p>
            </div>

            <ActivityRowActions :id="item.id" @remove="() => remove(item)" />
        </List>

        <Pagination v-if="paginated.options.perPage < paginated.total" v-model:page="paginated.options.page"
            v-model:perPage="paginated.options.perPage" :total="paginated.total" @change="refresh" />
    </Container>
</template>
