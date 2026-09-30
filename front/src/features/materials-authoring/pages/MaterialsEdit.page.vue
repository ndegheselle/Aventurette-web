<script setup lang="ts">
import List from '@chapelure/ui/data/List.vue';
import Pagination from '@chapelure/ui/data/Pagination.vue';
import SearchInput from '@chapelure/ui/data/SearchInput.vue';
import FieldError from '@chapelure/ui/forms/FieldError.vue';
import Container from '@chapelure/ui/layout/Container.vue';
import { useNavbar } from '@chapelure/ui/layout/useNavbar';
import { useConfirmation } from '@chapelure/ui/modals/useConfirmation';
import type { MaterialData } from '@features/activities/model/material';
import { useMaterialsEditList } from '@features/materials-authoring/composables/useMaterialsEditList';
import { PlusIcon, TrashIcon, TriangleAlertIcon } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';

const {
    paginated,
    search,
    name,
    refresh,
    isCreating,
    errors,
    createMaterial,
    renameMaterial,
    removeMaterial,
} = useMaterialsEditList();

const { t } = useI18n();
const confirm = useConfirmation();

// The confirmation is the screen's; the write is the composable's.
async function remove(material: MaterialData) {
    if (await confirm.show(
        t('confirmation.remove.title'),
        t('materials.authoring.removeWarning', { name: material.name }),
        TriangleAlertIcon,
    ) !== true)
        return;

    await removeMaterial(material);
}

useNavbar(t('materials.authoring.title'));
</script>

<template>
    <Container>
        <div class="flex flex-wrap gap-2">
            <div class="flex-1 min-w-64">
                <SearchInput @search="() => refresh()" v-model="search" />
            </div>
            <form class="flex flex-col" @submit.prevent="createMaterial">
                <div class="join">
                    <input type="text" class="input join-item" :class="{ 'input-error': errors.get('name') }"
                        :placeholder="$t('materials.authoring.name')" v-model="name" />
                    <button type="submit" class="btn btn-primary btn-square join-item"
                        :disabled="isCreating || !name.trim()" :title="$t('materials.authoring.add')">
                        <PlusIcon />
                    </button>
                </div>
                <FieldError :error="errors.get('name')" />
            </form>
        </div>

        <List :items="paginated.items" v-slot="{ item }" class="flex-1">
            <div><img class="size-10 rounded-box" src="https://placeholder.pagebee.io/api/plain/64/64" /></div>
            <input type="text" class="input input-ghost w-full my-auto" :aria-label="$t('materials.authoring.name')"
                v-model="item.name" @change="() => renameMaterial(item)" />
            <button class="btn btn-soft btn-square btn-error my-auto" :title="$t('materials.authoring.remove')"
                @click="() => remove(item)">
                <TrashIcon class="icon-sm" />
            </button>
        </List>

        <Pagination v-if="paginated.options.perPage < paginated.total" v-model:page="paginated.options.page"
            v-model:perPage="paginated.options.perPage" :total="paginated.total" @change="refresh" />
    </Container>
</template>
