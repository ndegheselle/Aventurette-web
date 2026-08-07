<script setup lang="ts">
import { debounce } from '@chapelure/core';
import { SearchIcon, XIcon } from '@chapelure/ui/icons';

const props = withDefaults(defineProps<{
    delay?: number;
}>(), {
    delay: 300,
});
const model = defineModel<string>();

const emit = defineEmits<{
    (e: 'search', value: string): void;
}>();

const emitSearch = props.delay
    ? debounce((value: string) => emit('search', value), props.delay)
    : (value: string) => emit('search', value);

function onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    emitSearch(value);
}

function clear() {
    model.value = '';
    emitSearch('');
}
</script>

<template>
    <label class="input w-full p-0 ps-2 pe-0.5">
        <SearchIcon class="opacity-50" />
        <input type="search" :placeholder="$t('actions.search')" v-model="model" @input="onInput" />
        <button v-if="model" class="btn btn-sm btn-ghost btn-square" @click="clear">
            <XIcon />
        </button>
    </label>
</template>
