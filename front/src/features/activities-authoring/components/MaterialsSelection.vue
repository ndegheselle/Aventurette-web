<script setup lang="ts">
import Dropdown from '@chapelure/ui/overlays/Dropdown.vue';
import MaterialDisplay from '@features/activities-authoring/components/MaterialDisplay.vue';
import { useStepMaterials } from '@features/activities-authoring/composables/useStepEdit';
import { type ActivityMaterialData } from '@features/activities/model/step';
import { CircleOffIcon, CircleQuestionMarkIcon, PlusIcon, SearchIcon, TrashIcon } from 'lucide-vue-next';
import { ref } from 'vue';

/** The step these belong to: choosing a name writes a row of its own against it. */
const props = defineProps<{ step: string }>();

const selected = defineModel<ActivityMaterialData[]>({ default: () => [] });

const { search, suggestions, isNewName, add, remove } = useStepMaterials(selected, () => props.step);

const open = ref<boolean>(false);
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
            <!-- A name nobody has used yet is worth offering: the row is this step's either way. -->
            <li v-if="isNewName">
                <a @click="() => add(search)">
                    <PlusIcon class="icon-sm" />
                    {{ $t('activities.steps.fields.materials.create', { name: search.trim() }) }}
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
    <div class="flex flex-wrap mt-1 bg-base-200 rounded-box pt-1">
        <MaterialDisplay :material="value" v-for="(value, index) in selected" :key="value.id" class="relative">
            <button class="btn btn-error btn-xs btn-circle absolute top-0 right-0" @click="() => remove(index)">
                <TrashIcon class="icon-sm" />
            </button>
        </MaterialDisplay>
        <div v-if="!selected.length" class="opacity-60 flex mx-auto items-center gap-2 h-10">
            <CircleOffIcon />
            <span>{{ $t('activities.steps.fields.materials.notNeeded') }}</span>
        </div>
    </div>
</template>
