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

<script setup vapor lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const { entries } = defineProps<{ entries: SectionEntry[] }>();
const emit = defineEmits<{ select: [entry: SectionEntry] }>();
</script>

<template>
    <ul class="menu w-full">
        <li v-for="entry in entries"
            :key="entry.key">
            <button @click="() => emit('select', entry)">
                <component :is="entry.icon"
                           class="icon-sm opacity-50" />
                {{ t(entry.label) }}
            </button>
            <ul v-if="entry.children?.length">
                <li v-for="child in entry.children"
                    :key="child.key">
                    <button @click="() => emit('select', child)">
                        <component :is="child.icon"
                                   class="icon-sm opacity-50" />
                        {{ t(child.label) }}
                    </button>
                </li>
            </ul>
        </li>
    </ul>
</template>
