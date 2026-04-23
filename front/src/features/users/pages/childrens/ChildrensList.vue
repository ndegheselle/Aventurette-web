<script setup lang="ts">
import { useAuth } from '@chapelure/auth/composables/useAuth';
import List from '@chapelure/common/components/data/List.vue';
import Group from '@chapelure/common/components/layout/Group.vue';
import { useConfirmation } from '@chapelure/common/composables/popups/useConfirmation';
import { type ChildrenData, childrens } from '@features/users/data/childrens';
import ChildrensEditModal from '@features/users/pages/childrens/ChildrensEditModal.vue';
import InterestsList from '@features/users/pages/childrens/InterestsList.vue';
import { MinusIcon, PenIcon, PlusIcon, TriangleAlertIcon, UsersRoundIcon } from 'lucide-vue-next';
import { onMounted, ref, useTemplateRef } from 'vue';
import { useI18n } from 'vue-i18n';

const modal = useTemplateRef('modal');
const auth = useAuth();
const list = ref<ChildrenData[]>([]);
const confirm = useConfirmation();
const { t } = useI18n();

async function add() {
    if (!modal.value) return;

    const newChild = await modal.value.show({ user: auth.currentId() } as ChildrenData);
    if (newChild)
        list.value.push(newChild);
}

async function remove(children: ChildrenData, index: number) {
    if (await confirm.show(t('confirmation.remove.title'), t('confirmation.remove.message', { name: children.name }), TriangleAlertIcon) !== true)
        return;

    await childrens.delete(children.id);
    list.value.splice(index, 1);
}

async function edit(children: ChildrenData) {
    if (!modal.value) return;
    const updatedChild = await modal.value.show(children);
    if (updatedChild) {
        Object.assign(children, updatedChild);
    }
}

onMounted(async () => {
    list.value = await childrens.getAll();
});
</script>

<template>
    <Group :title="$t('childrens.title')">
        <template v-slot:title>
            <UsersRoundIcon /> {{ $t('childrens.title') }}
        </template>
        <template v-slot:action>
            <button class="btn btn-circle btn-primary" @click="() => add()">
                <PlusIcon />
            </button>
        </template>
        <List :items="list" v-slot="{ item, index }" class="mt-1">
            <div><img class="size-10 rounded-box" src="https://placeholder.pagebee.io/api/plain/64/64" /></div>
            <div>
                <div class="flex">
                    <div>{{ item.name }}</div>
                    <div class="text-xs uppercase font-semibold opacity-60 my-auto ms-2">{{
                        $t("childrens.years",
                            { years: item.age }) }} </div>
                </div>
                <InterestsList :interests="item.expand.interests" />
            </div>
            <button class="btn btn-square btn-ghost" @click="() => remove(item, index)">
                <MinusIcon />
            </button>
            <button class="btn btn-square btn-ghost" @click="() => edit(item)">
                <PenIcon />
            </button>
        </List>
        <ChildrensEditModal ref="modal" />
    </Group>
</template>