<!--
  Picks several items from a dropdown of checkboxes. Picked items stay listed, checked, and read
  as a comma-separated summary. `keyBy` matches a picked item to an option by that key, rather
  than by reference. `display` labels an item, for when `displayKey` is not enough (a translated
  enum value).
-->
<script setup lang="ts" generic="T">
import Dropdown from '@chapelure/ui/dropdown/Dropdown.vue';
import { isPicked, toggled } from '@chapelure/ui/inputs/selection';
import { ChevronDownIcon, CircleQuestionMarkIcon } from 'lucide-vue-next';
import { computed, ref } from 'vue';

const { items = [], displayKey, display, keyBy, placeholder } = defineProps<{
    items: T[],
    displayKey?: keyof T,
    display?: (item: T) => string,
    keyBy?: keyof T,
    placeholder?: string
}>();

const selected = defineModel<T[]>({ default: () => [] });

const open = ref<boolean>(false);

const summary = computed(() => selected.value.map(getDisplay).join(', '));

function getDisplay(value: T): string {
    if (display)
        return display(value);
    return displayKey ? new String(value[displayKey]).toString() : new String(value).toString();
}

function toggle(item: T) {
    selected.value = toggled(selected.value, item, keyBy);
}
</script>
<template>
    <Dropdown v-model="open" :isFullWidth="true">
        <template #summary>
            <summary
                class="bg-base-100 rounded-box border border-base-content/20 flex items-center gap-2 min-h-10 px-3 cursor-pointer">
                <span class="flex-1 truncate" :class="{ 'opacity-50': !selected.length }">
                    {{ summary || placeholder || $t('actions.select') }}
                </span>
                <ChevronDownIcon class="icon-sm opacity-50" />
            </summary>
        </template>
        <!-- Stopped here so a tick does not close the dropdown. -->
        <ul class="menu p-2 w-full" @click.stop>
            <li v-for="value in items">
                <label class="flex items-center gap-2">
                    <input type="checkbox" class="checkbox checkbox-sm"
                        :checked="isPicked(selected, value, keyBy)" @change="() => toggle(value)" />
                    <span>{{ getDisplay(value) }}</span>
                </label>
            </li>
            <li class="opacity-30" v-if="!items.length">
                <div class="flex justify-center">
                    <CircleQuestionMarkIcon />
                    <span>{{ $t('data.noData') }}</span>
                </div>
            </li>
        </ul>
    </Dropdown>
</template>
