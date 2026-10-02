<script setup lang="ts">
import List from '@chapelure/ui/data/List.vue';
import Dropdown from '@chapelure/ui/dropdown/Dropdown.vue';
import type { ActivityMaterialData, MaterialData } from '@features/activities/model/material';
import { useMaterialCatalogue } from '@features/admin/activities-authoring/composables/useActivityEdit';
import { CircleOffIcon, CircleQuestionMarkIcon, PlusIcon, SearchIcon, TrashIcon } from 'lucide-vue-next';
import { ref } from 'vue';

// The activity's material list, picked from the catalogue. The parent changes the list — linking a
// catalogue material, a name the catalogue does not have, or taking one off — and a quantity is
// typed straight into its link. All of it is written with the activity.
const selected = defineModel<ActivityMaterialData[]>({ default: () => [] });

const emit = defineEmits<{
    add: [material: MaterialData];
    create: [name: string];
    remove: [material: ActivityMaterialData];
}>();

const { search, suggestions, isNewName } = useMaterialCatalogue(selected);

const open = ref<boolean>(false);

function add(material: MaterialData) {
    emit('add', material);
    search.value = '';
}

function createAndAdd(name: string) {
    emit('create', name);
    search.value = '';
}
</script>

<template>
    <Dropdown v-model="open" :isFullWidth="true" class="w-full">
        <template #summary>
            <summary
                class="bg-base-100 rounded-box border border-base-content/20 flex flex-wrap items-center min-h-10 p-0 pe-2">
                <div class="flex-1 flex items-center">
                    <SearchIcon class="opacity-50 mx-2" />
                    <input type="text" class="w-full outline-hidden" :placeholder="$t('actions.search')"
                        @focus="open = true" @keyup.enter="isNewName && createAndAdd(search)" v-model="search" />
                </div>
            </summary>
        </template>
        <ul class="menu p-2 w-full">
            <!-- A name nobody has used yet joins the catalogue, for this activity and the next. -->
            <li v-if="isNewName">
                <a @click="() => createAndAdd(search)">
                    <PlusIcon class="icon-sm" />
                    {{ $t('activities.authoring.materials.create', { name: search.trim() }) }}
                </a>
            </li>
            <li v-for="material in suggestions" :key="material.id">
                <a @click="() => add(material)"><img class="size-10 rounded-box"
                        src="https://placeholder.pagebee.io/api/plain/64/64" /> {{ material.name }}</a>
            </li>
            <li class="opacity-30" v-if="!suggestions.length && !isNewName">
                <div class="flex justify-center">
                    <CircleQuestionMarkIcon />
                    <span>{{ $t('data.noData') }}</span>
                </div>
            </li>
        </ul>
    </Dropdown>
    <List v-if="selected.length" :items="selected" v-slot="{ item }" class="mt-1 bg-base-200">
        <img class="size-10 rounded-box" src="https://placeholder.pagebee.io/api/plain/64/64" />
        <span class="my-auto">{{ item.name }}</span>
        <input type="text" class="input input-sm w-40" :placeholder="$t('activities.materials.quantity')"
            v-model="item.quantity" />
        <button class="btn btn-ghost btn-square btn-sm" @click="() => emit('remove', item)">
            <TrashIcon class="icon-sm" />
        </button>
    </List>
    <div v-else class="opacity-60 flex mx-auto items-center gap-2 h-10">
        <CircleOffIcon />
        <span>{{ $t('activities.materials.notNeeded') }}</span>
    </div>
</template>
