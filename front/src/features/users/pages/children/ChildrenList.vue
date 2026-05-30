<script setup lang="ts">
import { useAuth } from '@chapelure/auth/composables/useAuth';
import List from '@chapelure/common/components/data/List.vue';
import Group from '@chapelure/common/components/layout/Group.vue';
import { useEditableList } from '@chapelure/common/composables/data/useEditableList';
import { useConfirmation } from '@chapelure/common/composables/popups/useConfirmation';
import type { IEditModal } from '@chapelure/common/composables/popups/useModal';
import { type ChildrenData, useChildren } from '@features/users/composables/data/children';
import ChildrenEditModal from '@features/users/pages/children/ChildrenEditModal.vue';
import InterestsList from '@features/users/pages/children/InterestsList.vue';
import { MinusIcon, PenIcon, PlusIcon, TriangleAlertIcon, UsersRoundIcon } from 'lucide-vue-next';
import { onMounted, useTemplateRef } from 'vue';
import { useI18n } from 'vue-i18n';

const childrenApi = useChildren();
const modal = useTemplateRef<IEditModal<ChildrenData>>('modal');
const auth = useAuth();
const {items, add, remove, edit} = useEditableList<ChildrenData>(modal, {onRemove: onRemove});

const confirm = useConfirmation();
const { t } = useI18n();

async function onRemove(child: ChildrenData) {
    if (await confirm.show(t('confirmation.remove.title'), t('confirmation.remove.message', { name: child.name }), TriangleAlertIcon) !== true)
        return false;
    await childrenApi.remove(child.id);
}

onMounted(async () => {
    items.value = await childrenApi.getAll();
});
</script>

<template>
    <Group>
        <div class="flex justify-between">
            <h2 class="text-2xl flex items-center gap-2 ms-2"><UsersRoundIcon /> {{ $t('children.title') }}</h2>
            <button class="btn btn-circle btn-primary" @click="() => add({ user: auth.currentId() } as ChildrenData)">
                <PlusIcon />
            </button>
        </div>
        
        <List :items="items" v-slot="{ item, index }">
            <div><img class="size-10 rounded-box" src="https://placeholder.pagebee.io/api/plain/64/64" /></div>
            <div>
                <div class="flex">
                    <div>{{ item.name }}</div>
                    <div class="text-xs uppercase font-semibold opacity-60 my-auto ms-2">{{
                        $t("children.years",
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
    </Group>
    <ChildrenEditModal ref="modal" />
</template>