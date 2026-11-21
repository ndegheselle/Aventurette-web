<script setup lang="ts">
import { debounce } from '@chapelure/core';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@chapelure/ui/shadcn/input-group';
import { SearchIcon, XIcon } from 'lucide-vue-next';

/** Long enough that typing a word searches once, at its end. */
const SEARCH_DELAY_MS = 300;

const model = defineModel<string>();

const emit = defineEmits<{
    (e: 'search', value: string): void;
}>();

const emitSearch = debounce((value: string) => emit('search', value), SEARCH_DELAY_MS);

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
    <InputGroup>
        <InputGroupAddon>
            <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput type="text" :placeholder="$t('actions.search')" v-model="model" @input="onInput" />
        <InputGroupAddon v-if="model" align="inline-end">
            <InputGroupButton size="icon-xs" :aria-label="$t('actions.clear')" @click="clear">
                <XIcon />
            </InputGroupButton>
        </InputGroupAddon>
    </InputGroup>
</template>
