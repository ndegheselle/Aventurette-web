<script setup lang="ts">
import { useConfirmation } from '@common/composables/popups/confirmation';
import { useAuth } from '@features/users/composables/auth';
import { type ChildrenData, childrens } from '@features/users/data/childrens';
import ChildrensEditModal from '@features/users/views/childrens/ChildrensEditModal.vue';
import { CircleQuestionMarkIcon, MinusIcon, PenIcon, PlusIcon, TriangleAlertIcon } from 'lucide-vue-next';
import { onMounted, ref, useTemplateRef } from 'vue';
import { useI18n } from 'vue-i18n';

const modal = useTemplateRef('modal');
const auth = useAuth();
const list = ref<ChildrenData[]>([]);
const confirm = useConfirmation();
const {t} = useI18n();

async function add() {
    if (!modal.value) return;

    const newChild = await modal.value.show({ user: auth.currentId() } as ChildrenData);
    if (newChild)
        list.value.push(newChild);
}

async function remove(children: ChildrenData, index: number) {
    if (await confirm.show(t('confirmation.remove.title') , t('confirmation.remove.message', {name: children.name}), TriangleAlertIcon) !== true)
        return;

    await childrens.delete(children.id);
    list.value.splice(index, 1);
}

async function edit(children: ChildrenData)
{
    if (!modal.value) return;
    await modal.value.show(children);
}

onMounted(async () => {
    list.value = await childrens.getAll();
});
</script>

<template>
    <div class="container mx-auto flex flex-col my-2">
        <button class="btn btn-primary"
                @click="add">
            <PlusIcon />
            {{ $t("actions.add") }}
        </button>

        <ul class="list bg-base-100 rounded-box border border-base-300 mt-1">
            <li class="p-4 opacity-60 tracking-wide flex" v-if="!list.length">
                <div class="flex mx-auto">
                    <CircleQuestionMarkIcon class="mr-2 my-auto" /> 
                    <span>{{ $t('data.noResult') }}</span>
                </div>
            </li>
            <li class="list-row"
                v-for="(children, index) in list">
                <div><img class="size-10 rounded-box"
                         src="https://placeholder.pagebee.io/api/plain/64/64" /></div>
                <div>
                    <div>{{ children.name }}</div>
                    <div class="text-xs uppercase font-semibold opacity-60">{{ children.age }}</div>
                </div>
                <button class="btn btn-square btn-ghost"
                        @click="() => remove(children, index)">
                    <MinusIcon />
                </button>
                <button class="btn btn-square btn-ghost"
                        @click="() => edit(children)">
                    <PenIcon />
                </button>
            </li>
        </ul>
        <ChildrensEditModal ref="modal" />
    </div>
</template>