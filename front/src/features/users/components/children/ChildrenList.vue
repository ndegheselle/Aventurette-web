<script setup lang="ts">
import { childrenApi } from '@features/users/api/children.api';
import List from '@chapelure/ui/data/List.vue';
import { useConfirmation } from '@chapelure/ui/modals/useConfirmation';
import type { IEditModal } from '@chapelure/ui/modals/useModal';
import { MinusIcon, PenIcon, PlusIcon, TriangleAlertIcon, UsersRoundIcon } from 'lucide-vue-next';
import Panel from '@chapelure/ui/layout/Panel.vue';
import { useAuth } from '@features/auth/composables/useAuth';
import { type ChildrenData } from '@features/users/model/child';
import ChildrenEditModal from '@features/users/components/children/ChildrenEditModal.vue';
import { onMounted, ref, useTemplateRef } from 'vue';
import { useI18n } from 'vue-i18n';

const modal = useTemplateRef<IEditModal<ChildrenData>>('modal');
const auth = useAuth();
const children = ref<ChildrenData[]>([]);

const confirm = useConfirmation();
const { t } = useI18n();

// The modal saves; the list only takes in what it hands back.
async function add() {
    const created = await modal.value?.show({ user: auth.currentId() } as ChildrenData);
    if (created) children.value = [...children.value, created];
}

async function edit(child: ChildrenData) {
    const updated = await modal.value?.show(child);
    if (updated) Object.assign(child, updated);
}

async function remove(child: ChildrenData, index: number) {
    if (await confirm.show(t('confirmation.remove.title'), t('confirmation.remove.message', { name: child.name }), TriangleAlertIcon) !== true)
        return;

    await childrenApi.remove(child.id);
    children.value = children.value.filter((_, i) => i !== index);
}

onMounted(async () => {
    children.value = await childrenApi.getAll();
});
</script>

<template>
    <Panel>
        <div class="flex justify-between">
            <h2 class="text-2xl flex items-center gap-2 ms-2">
                <UsersRoundIcon /> {{ $t('children.title') }}
            </h2>
            <button class="btn btn-primary btn-circle" @click="add">
                <PlusIcon />
            </button>
        </div>

        <List :items="children" v-slot="{ item, index }">
            <div><img class="size-10 rounded-box" src="https://placeholder.pagebee.io/api/plain/64/64" /></div>
            <div>
                <div class="flex">
                    <div>{{ item.name }}</div>
                    <div class="text-xs uppercase font-semibold opacity-60 my-auto ms-2">{{
                        $t("children.years",
                            { years: item.age }) }} </div>
                </div>
            </div>
            <button class="btn btn-ghost btn-square" @click="() => remove(item, index)">
                <MinusIcon />
            </button>
            <button class="btn btn-ghost btn-square" @click="() => edit(item)">
                <PenIcon />
            </button>
        </List>
    </Panel>
    <ChildrenEditModal ref="modal" />
</template>
