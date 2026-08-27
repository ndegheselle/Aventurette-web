<script setup lang="ts">
import { materialsRepository as materials } from '@features/activities/data/materials.repository';
import Dropdown from '@chapelure/ui/overlays/Dropdown.vue';
import MaterialDisplay from '@features/activities/components/materials/MaterialDisplay.vue';
import { type ActivityMaterialData } from '@features/activities/model/material';
import { CircleOffIcon, CircleQuestionMarkIcon, SearchIcon, TrashIcon } from 'lucide-vue-next';
import { computed, onMounted, ref } from 'vue';

const selected = defineModel<ActivityMaterialData[]>({ default: () => [] });

const availableMaterials = ref<ActivityMaterialData[]>([]);
const open = ref<boolean>(false);
const search = ref<string>("");

const availableItems = computed(() => availableMaterials.value.filter(
    x => !selected.value.find((s) => s.id == x.id) && x.name.toLowerCase().includes(search.value.toLowerCase())
));

onMounted(async () => {
    availableMaterials.value = await materials.getAll();
});

function addItem(item: ActivityMaterialData) {
    selected.value = [...selected.value, item];
}

function removeItem(index: number) {
    selected.value = selected.value.filter((_, i) => i !== index);
}

function openDropdown() {
    open.value = true;
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
                        @focus="openDropdown" v-model="search" />
                </div>
            </summary>
        </template>
        <ul class="menu p-2 w-full">
            <li v-for="value in availableItems" @click="() => { }">
                <a @click="() => addItem(value)"><img class="size-10 rounded-box" src="https://placeholder.pagebee.io/api/plain/64/64" /> {{
                    value.name }}</a>
            </li>
            <li class="opacity-30" v-if="!availableItems.length">
                <div class="flex justify-center">
                    <CircleQuestionMarkIcon />
                    <span>{{ $t('data.noData') }}</span>
                </div>
            </li>
        </ul>
    </Dropdown>
    <div class="flex flex-wrap mt-1 bg-base-200 rounded-box pt-1">
        <MaterialDisplay :material="value" v-for="(value, index) in selected" class="relative">
            <button class="btn btn-error btn-xs btn-circle absolute top-0 right-0" @click="() => removeItem(index)">
                <TrashIcon class="icon-sm" />
            </button>
        </MaterialDisplay>
        <div v-if="!selected.length" class="opacity-60 flex mx-auto items-center gap-2 h-10">
            <CircleOffIcon />
            <span>{{ $t('activities.steps.fields.materials.notNeeded') }}</span>
        </div>
    </div>
</template>