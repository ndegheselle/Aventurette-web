<!-- The page's sections as a side menu; picking one is the parent's to act on. -->
<script lang="ts">
import type { Component } from 'vue';

/** A part of the page the menu leads to. */
export interface SectionEntry {
    key: string;
    label: string;
    icon: Component;
    /** Id of the element brought into view. */
    anchor: string;
    /** Runs before scrolling, to reveal what the anchor hides — a tab, say. */
    onSelect?: () => void;
    children?: SectionEntry[];
}
</script>

<script setup lang="ts">
import { Button } from '@chapelure/ui/shadcn/button';

const { entries } = defineProps<{ entries: SectionEntry[] }>();
const emit = defineEmits<{ select: [entry: SectionEntry] }>();
</script>

<template>
    <ul class="flex w-full flex-col gap-1 p-2">
        <li v-for="entry in entries"
            :key="entry.key">
            <Button variant="ghost"
                    size="sm"
                    class="w-full justify-start"
                    @click="() => emit('select', entry)">
                <component :is="entry.icon"
                           class="text-muted-foreground" />
                {{ $t(entry.label) }}
            </Button>
            <ul v-if="entry.children?.length"
                class="ms-4 mt-1 flex flex-col gap-1 border-l ps-2">
                <li v-for="child in entry.children"
                    :key="child.key">
                    <Button variant="ghost"
                            size="sm"
                            class="w-full justify-start"
                            @click="() => emit('select', child)">
                        <component :is="child.icon"
                                   class="text-muted-foreground" />
                        {{ $t(child.label) }}
                    </Button>
                </li>
            </ul>
        </li>
    </ul>
</template>
