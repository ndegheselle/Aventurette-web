<script setup lang="ts">
import List from '@chapelure/ui/data/List.vue';
import Dropdown from '@chapelure/ui/dropdown/Dropdown.vue';
import type { ActivityMaterialData, MaterialData } from '@features/activities/model/material';
import { useMaterialCatalogue } from '@features/admin/activities-authoring/composables/useActivityEdit';
import { CircleOffIcon, CircleQuestionMarkIcon, PlusIcon, SearchIcon, TrashIcon } from 'lucide-vue-next';
import { ref } from 'vue';

// The activity's material list, picked from the catalogue. Every change is a write of its own,
// made by the parent: adding links a catalogue material, a quantity is saved as it is typed, and
// removing deletes the link. A name the catalogue does not have is added to it first.
const selected = defineModel<ActivityMaterialData[]>({ default: () => [] });

const emit = defineEmits<{
    add: [material: MaterialData];
    update: [material: ActivityMaterialData];
    remove: [material: ActivityMaterialData];
}>();

const { search, suggestions, isNewName, create } = useMaterialCatalogue(selected);

const open = ref<boolean>(false);

function add(material: MaterialData) {
    emit('add', material);
    search.value = '';
}

async function createAndAdd(name: string) {
    const created = await create(name);
    if (created) add(created);
}
</script>

<template>
    <Dropdown v-model="open" :isFullWidth="true">
        <template #summary>
            <summary
                class="bg-base-100 rounded-box border border-base-content/20 flex flex-wrap items-center min-h-10 p-1 pe-2">
                <div class="flex-1 flex items-center">
                    <SearchIcon class="opacity-50" />
                    <input type="text" class="w-full outline-hidden ps-1" :placeholder="$t('actions.search')"
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
            v-model="item.quantity" @change="() => emit('update', item)" />
        <button class="btn btn-ghost btn-square btn-sm" @click="() => emit('remove', item)">
            <TrashIcon class="icon-sm" />
        </button>
    </List>
    <div v-else class="opacity-60 flex mx-auto items-center gap-2 h-10">
        <CircleOffIcon />
        <span>{{ $t('activities.materials.notNeeded') }}</span>
    </div>
</template>
