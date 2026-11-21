<script setup lang="ts">
import List from '@chapelure/ui/data/List.vue';
import Pagination from '@chapelure/ui/data/Pagination.vue';
import Container from '@chapelure/ui/layout/Container.vue';
import { useNavbar } from '@chapelure/ui/layout/useNavbar';
import { useConfirmation } from '@chapelure/ui/modals/useConfirmation';
import { Badge } from '@chapelure/ui/shadcn/badge';
import { Button } from '@chapelure/ui/shadcn/button';
import { Tabs, TabsList, TabsTrigger } from '@chapelure/ui/shadcn/tabs';
import { ActivityState, type ActivityData } from '@features/activities/models/activity';
import { useActivitiesEditList } from '@features/admin/activities-authoring/composables/useActivitiesEditList';
import { authoredStateTabs } from '@features/admin/activities-authoring/models/activity.edit';
import { routesNames } from '@features/admin/activities-authoring/routes';
import ActivityImportModal from '@features/admin/activities-authoring/ui/ActivityImport.modal.vue';
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
        <div class="flex gap-2 my-2">
            <!-- The tabs filter the list rather than switch panels: picking one is the composable's.
                 A state is null for "all", so the tabs key on its string. -->
            <Tabs class="flex-1"
                  activation-mode="manual"
                  :model-value="String(state)">
                <TabsList class="w-full">
                    <TabsTrigger v-for="tab in authoredStateTabs"
                                 :key="tab.label"
                                 :value="String(tab.value)"
                                 @click="selectState(tab.value)">
                        {{ $t(tab.label) }}
                    </TabsTrigger>
                </TabsList>
            </Tabs>
            <div class="ms-auto my-auto flex gap-2">
                <Button variant="secondary"
                        size="icon"
                        :title="$t('activities.authoring.import.title')"
                        @click="() => importModal?.show()">
                    <ImportIcon />
                </Button>
                <Button size="icon"
                        as-child>
                    <RouterLink :title="$t('actions.add')"
                                :to="{ name: routesNames.new }">
                        <PlusIcon />
                    </RouterLink>
                </Button>
            </div>
        </div>

        <List :items="paginated.items"
              v-slot="{ item }"
              class="flex-1">
            <div><img class="size-16 rounded-md"
                     src="https://placeholder.pagebee.io/api/plain/64/64" /></div>
            <div class="flex-1">
                <div class="flex flex-wrap items-center gap-2">
                    <b>{{ item.name }}</b>
                    <Badge :variant="item.state === ActivityState.PUBLISHED ? 'default' : 'secondary'">
                        {{ $t(`activities.state.${item.state}`) }}
                    </Badge>
                </div>
                <p class="text-xs"
                   v-html="item.description"></p>
            </div>
            <div class="flex gap-2">
                <Button variant="destructive"
                        size="icon"
                        @click="() => remove(item)">
                    <TrashIcon />
                </Button>
                <Button variant="secondary"
                        size="icon"
                        as-child>
                    <RouterLink :to="{ name: routesNames.page, params: { id: item.id } }">
                        <PenIcon />
                    </RouterLink>
                </Button>
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
