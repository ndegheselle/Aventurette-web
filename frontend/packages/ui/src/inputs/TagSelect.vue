<script setup lang="ts" generic="T">
import { displayOf, offered } from '@chapelure/ui/inputs/selection';
import { Badge } from '@chapelure/ui/shadcn/badge';
import { Popover, PopoverAnchor, PopoverContent } from '@chapelure/ui/shadcn/popover';
import { CircleQuestionMarkIcon, XIcon } from 'lucide-vue-next';
import { computed, ref, useTemplateRef } from 'vue';

/** `keyBy` matches a picked item to an option by that key, rather than by reference. */
const { items = [], displayKey, keyBy } = defineProps<{
    items: T[],
    displayKey?: keyof T,
    keyBy?: keyof T
}>();

const selected = defineModel<T[]>({ default: () => [] });

const open = ref<boolean>(false);
const search = ref<string>("");
const anchor = useTemplateRef<HTMLElement>('anchor');

const availableItems = computed(() => offered(items, selected.value, search.value, displayKey, keyBy));

function getDisplay(value: T): string {
    return displayOf(value, displayKey);
}

function addItem(item: T) {
    selected.value = [...selected.value, item];
}

function removeItem(index: number) {
    selected.value = selected.value.filter((_, i) => i !== index);
}

// Typing in the field is not leaving the picker.
function keepOpenInField(event: CustomEvent<{ originalEvent: Event }>) {
    if (anchor.value?.contains(event.detail.originalEvent.target as Node)) event.preventDefault();
}
</script>
<template>
    <Popover v-model:open="open">
        <PopoverAnchor as-child>
            <div ref="anchor"
                 class="flex min-h-9 w-full flex-wrap items-center gap-1 rounded-md border border-input bg-transparent p-1 pe-2 shadow-xs dark:bg-input/30">
                <Badge v-for="(value, index) in selected" class="whitespace-nowrap pe-0">
                    {{ getDisplay(value) }}
                    <span class="cursor-pointer p-0.5" @click="() => removeItem(index)">
                        <XIcon class="icon-sm" />
                    </span>
                </Badge>
                <input type="text" class="min-w-32 flex-1 bg-transparent px-1 text-sm outline-hidden placeholder:text-muted-foreground"
                       :placeholder="$t('actions.search')"
                       v-model="search"
                       @focus="open = true" />
            </div>
        </PopoverAnchor>
        <PopoverContent align="start"
                        class="w-(--reka-popover-trigger-width) p-1"
                        @open-auto-focus.prevent
                        @interact-outside="keepOpenInField">
            <button v-for="value in availableItems"
                    type="button"
                    class="flex w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                    @click="() => addItem(value)">
                {{ getDisplay(value) }}
            </button>
            <div class="flex justify-center gap-2 p-2 text-sm text-muted-foreground" v-if="!availableItems.length">
                <CircleQuestionMarkIcon />
                <span>{{ $t('data.noData') }}</span>
            </div>
        </PopoverContent>
    </Popover>
</template>
