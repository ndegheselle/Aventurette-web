<script setup lang="ts">
import List from '@chapelure/ui/data/List.vue';
import Dropdown from '@chapelure/ui/dropdown/Dropdown.vue';
import { useMaterialSuggestions } from '@features/activities-authoring/composables/useActivityEdit';
import { type ActivityMaterialData } from '@features/activities/model/material';
import { CircleOffIcon, CircleQuestionMarkIcon, PlusIcon, SearchIcon, TrashIcon } from 'lucide-vue-next';
import { ref } from 'vue';

// The activity's material list. Every change is a write of its own, made by the parent: adding
// a name creates a row, a quantity is saved as it is typed, and removing deletes the row.
const selected = defineModel<ActivityMaterialData[]>({ default: () => [] });

const emit = defineEmits<{
    add: [name: string];
    update: [material: ActivityMaterialData];
    remove: [material: ActivityMaterialData];
}>();

const { search, suggestions, isNewName } = useMaterialSuggestions(selected);

const open = ref<boolean>(false);

function add(name: string) {
    emit('add', name);
    search.value = '';
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
                        @focus="open = true" @keyup.enter="isNewName && add(search)" v-model="search" />
                </div>
            </summary>
        </template>
        <ul class="menu p-2 w-full">
            <!-- An unused name is still worth offering: the row is this activity's either way. -->
            <li v-if="isNewName">
                <a @click="() => add(search)">
                    <PlusIcon class="icon-sm" />
                    {{ $t('activities.authoring.materials.create', { name: search.trim() }) }}
                </a>
            </li>
            <li v-for="name in suggestions" :key="name">
                <a @click="() => add(name)"><img class="size-10 rounded-box"
                        src="https://placeholder.pagebee.io/api/plain/64/64" /> {{ name }}</a>
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
