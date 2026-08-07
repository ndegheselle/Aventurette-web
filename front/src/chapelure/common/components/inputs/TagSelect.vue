<script setup lang="ts" generic="T">
import Dropdown from '@chapelure/common/components/popups/Dropdown.vue';
import { CircleQuestionMarkIcon, XIcon } from 'lucide-vue-next';
import { computed, ref } from 'vue';

const { items = [], displayKey } = defineProps<{
    items: T[],
    displayKey?: keyof T
}>();

const selected = defineModel<T[]>({ default: () => [] });

const availableItems = computed(() => items.filter(
    x => selected.value.indexOf(x) === -1 && getDisplay(x).toLowerCase().includes(search.value.toLowerCase())
));

const open = ref<boolean>(false);
const search = ref<string>("");

function getDisplay(value: T): string {
    return displayKey ? new String(value[displayKey]).toString() : new String(value).toString();
}

function addItem(item: T) {
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
                <div class="flex flex-wrap gap-0.5 me-2">
                    <span class="badge badge-primary whitespace-nowrap pe-0" v-for="(value, index) in selected">
                        {{ getDisplay(value) }}
                        <button class="btn btn-xs btn-square btn-ghost" @click="() => removeItem(index)">
                            <XIcon class="icon-sm" />
                        </button>
                    </span>
                </div>
                <div class="flex-1 min-w-32 flex items-center">
                    <input type="text" class="w-full outline-hidden" :placeholder="$t('actions.search')"
                        @focus="openDropdown" v-model="search" />
                </div>
            </summary>
        </template>
        <ul class="menu p-2 w-full">
            <li v-for="value in availableItems" @click="() => addItem(value)">
                <a>{{ getDisplay(value) }}</a>
            </li>
            <li class="opacity-30" v-if="!availableItems.length">
                <div class="flex justify-center">
                    <CircleQuestionMarkIcon  />
                    <span>{{ $t('data.noData') }}</span>
                </div>
            </li>
        </ul>
    </Dropdown>
</template>