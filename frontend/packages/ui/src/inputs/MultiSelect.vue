<!--
  Picks several items from a dropdown of checkboxes. Picked items stay listed, checked, and read
  as a comma-separated summary. `keyBy` matches a picked item to an option by that key, rather
  than by reference. To pick plain values, give it `Option`s from `inputs/selection`.
-->
<script setup lang="ts" generic="T">
import { displayOf, isPicked, toggled } from '@chapelure/ui/inputs/selection';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@chapelure/ui/shadcn/dropdown-menu';
import { ChevronDownIcon, CircleQuestionMarkIcon } from 'lucide-vue-next';
import { computed } from 'vue';

const { items = [], displayKey, keyBy, placeholder } = defineProps<{
    items: T[],
    displayKey?: keyof T,
    keyBy?: keyof T,
    placeholder?: string
}>();

const selected = defineModel<T[]>({ default: () => [] });

const summary = computed(() => selected.value.map(getDisplay).join(', '));

function getDisplay(value: T): string {
    return displayOf(value, displayKey);
}

function toggle(item: T) {
    selected.value = toggled(selected.value, item, keyBy);
}
</script>
<template>
    <DropdownMenu>
        <DropdownMenuTrigger as-child>
            <button type="button"
                    class="flex h-9 w-full items-center gap-2 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30">
                <span class="flex-1 truncate text-left" :class="{ 'text-muted-foreground': !selected.length }">
                    {{ summary || placeholder || $t('actions.select') }}
                </span>
                <ChevronDownIcon class="size-4 opacity-50" />
            </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" class="w-(--reka-dropdown-menu-trigger-width)">
            <!-- Prevented, so a tick does not close the dropdown. -->
            <DropdownMenuCheckboxItem v-for="value in items"
                                      :model-value="isPicked(selected, value, keyBy)"
                                      @update:model-value="() => toggle(value)"
                                      @select.prevent>
                {{ getDisplay(value) }}
            </DropdownMenuCheckboxItem>
            <div class="flex justify-center gap-2 p-2 text-sm text-muted-foreground" v-if="!items.length">
                <CircleQuestionMarkIcon />
                <span>{{ $t('data.noData') }}</span>
            </div>
        </DropdownMenuContent>
    </DropdownMenu>
</template>
