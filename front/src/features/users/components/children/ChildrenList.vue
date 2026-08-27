<script setup lang="ts">
import { childrenRepository as childrenApi } from '@features/users/data/children.repository';
import { useConfirmation } from '@chapelure/ui/composables/useConfirmation';
import { useEditableList } from '@chapelure/ui/composables/useEditableList';
import type { IEditModal } from '@chapelure/ui/composables/useModal';
import List from '@chapelure/ui/data/List.vue';
import { MinusIcon, PenIcon, PlusIcon, TriangleAlertIcon, UsersRoundIcon } from 'lucide-vue-next';
import Panel from '@chapelure/ui/layout/Panel.vue';
import Button from '@chapelure/ui/primitives/Button.vue';
import { useAuth } from '@features/auth/composables/useAuth';
import { type ChildrenData } from '@features/users/model/child';
import ChildrenEditModal from '@features/users/components/children/ChildrenEditModal.vue';
import InterestsList from '@features/users/components/children/InterestsList.vue';
import { onMounted, useTemplateRef } from 'vue';
import { useI18n } from 'vue-i18n';

const modal = useTemplateRef<IEditModal<ChildrenData>>('modal');
const auth = useAuth();
const { items, add, remove, edit } = useEditableList<ChildrenData>(modal, { onRemove: onRemove });

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
    <Panel>
        <div class="flex justify-between">
            <h2 class="text-2xl flex items-center gap-2 ms-2">
                <UsersRoundIcon /> {{ $t('children.title') }}
            </h2>
            <Button variant="primary" shape="circle" @click="() => add({ user: auth.currentId() } as ChildrenData)">
                <PlusIcon />
            </Button>
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
            <Button shape="square" variant="ghost" @click="() => remove(item, index)">
                <MinusIcon />
            </Button>
            <Button shape="square" variant="ghost" @click="() => edit(item)">
                <PenIcon />
            </Button>
        </List>
    </Panel>
    <ChildrenEditModal ref="modal" />
</template>
