<script setup lang="ts">
import { useConfirmation } from '@common/composables/popups/confirmation';
import { useAuth } from '@features/users/composables/auth';
import { type ChildrenData, childrens } from '@features/users/data/childrens';
import ChildrensEditModal from '@features/users/views/childrens/ChildrensEditModal.vue';
import InterestsList from '@features/users/views/childrens/InterestsList.vue';
import { CircleQuestionMarkIcon, MinusIcon, PenIcon, PlusIcon, TriangleAlertIcon } from 'lucide-vue-next';
import { onMounted, ref, useTemplateRef } from 'vue';
import { useI18n } from 'vue-i18n';
import Group from '@common/components/layout/Group.vue';

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
        <template v-slot:action>
            <button class="btn btn-circle btn-primary" @click="add">
                <PlusIcon />
            </button>
        </template>
        <ul class="list bg-base-100 rounded-box border border-base-300 mt-1">
            <li class="p-4 opacity-60 tracking-wide flex" v-if="!list.length">
                <div class="flex mx-auto">
                    <CircleQuestionMarkIcon class="mr-2 my-auto" />
                    <span>{{ $t('data.noResult') }}</span>
                </div>
            </li>
            <li class="list-row" v-for="(children, index) in list">
                <div><img class="size-10 rounded-box" src="https://placeholder.pagebee.io/api/plain/64/64" /></div>
                <div>
                    <div class="flex">
                        <div>{{ children.name }}</div>
                        <div class="text-xs uppercase font-semibold opacity-60 my-auto ms-2">{{
                            $t("childrens.years",
                                { years: children.age }) }} </div>
                    </div>
                    <InterestsList :interests="children.expand.interests" />
                </div>
                <button class="btn btn-square btn-ghost" @click="() => remove(children, index)">
                    <MinusIcon />
                </button>
                <button class="btn btn-square btn-ghost" @click="() => edit(children)">
                    <PenIcon />
                </button>
            </li>
        </ul>
        <ChildrensEditModal ref="modal" />
    </Group>
</template>