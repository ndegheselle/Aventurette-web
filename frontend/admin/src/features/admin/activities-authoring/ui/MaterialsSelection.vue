<script setup lang="ts">
import List from '@chapelure/ui/data/List.vue';
import { Button } from '@chapelure/ui/shadcn/button';
import { Input } from '@chapelure/ui/shadcn/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@chapelure/ui/shadcn/input-group';
import { Popover, PopoverAnchor, PopoverContent } from '@chapelure/ui/shadcn/popover';
import type { ActivityMaterialData, MaterialData } from '@features/activities/models/material';
import { useMaterialCatalogue } from '@features/admin/activities-authoring/composables/useActivityEdit';
import { CircleOffIcon, CircleQuestionMarkIcon, PlusIcon, SearchIcon, TrashIcon } from 'lucide-vue-next';
import { ref, useTemplateRef } from 'vue';

// The activity's material list, picked from the catalogue. The parent changes the list — linking a
// catalogue material, a name the catalogue does not have, or taking one off — and a quantity is
// typed straight into its link. All of it is written with the activity.
const selected = defineModel<ActivityMaterialData[]>({ default: () => [] });

const emit = defineEmits<{
    add: [material: MaterialData];
    create: [name: string];
    remove: [material: ActivityMaterialData];
}>();

const { search, suggestions, isNewName } = useMaterialCatalogue(selected);

const open = ref<boolean>(false);
const anchor = useTemplateRef<HTMLElement>('anchor');

function add(material: MaterialData) {
    emit('add', material);
    search.value = '';
}

function createAndAdd(name: string) {
    emit('create', name);
    search.value = '';
}

/** Enter adds the typed name, when it is one the catalogue and the list do not have yet. */
function createTyped() {
    if (!isNewName.value) return;
    createAndAdd(search.value);
}

// Typing in the field is not leaving the picker.
function keepOpenInField(event: CustomEvent<{ originalEvent: Event }>) {
    if (anchor.value?.contains(event.detail.originalEvent.target as Node)) event.preventDefault();
}
</script>

<template>
    <Popover v-model:open="open">
        <PopoverAnchor as-child>
            <div ref="anchor" class="w-full">
                <InputGroup>
                    <InputGroupAddon>
                        <SearchIcon />
                    </InputGroupAddon>
                    <InputGroupInput type="text" :placeholder="$t('actions.search')"
                        @focus="open = true" @keyup.enter="createTyped" v-model="search" />
                </InputGroup>
            </div>
        </PopoverAnchor>
        <!-- Clicking an entry closes the list; Enter in the field adds the typed name and leaves it open. -->
        <PopoverContent align="start"
                        class="w-(--reka-popover-trigger-width) p-1"
                        @open-auto-focus.prevent
                        @interact-outside="keepOpenInField">
            <!-- A name nobody has used yet joins the catalogue, for this activity and the next. -->
            <button v-if="isNewName" type="button"
                class="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                @click="() => { open = false; createAndAdd(search); }">
                <PlusIcon class="icon-sm" />
                {{ $t('activities.authoring.materials.create', { name: search.trim() }) }}
            </button>
            <button v-for="material in suggestions" :key="material.id" type="button"
                class="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                @click="() => { open = false; add(material); }">
                <img class="size-10 rounded-md" src="https://placeholder.pagebee.io/api/plain/64/64" /> {{ material.name }}
            </button>
            <div v-if="!suggestions.length && !isNewName" class="flex justify-center gap-2 p-2 text-sm text-muted-foreground">
                <CircleQuestionMarkIcon />
                <span>{{ $t('data.noData') }}</span>
            </div>
        </PopoverContent>
    </Popover>
    <List v-if="selected.length" :items="selected" v-slot="{ item }" class="mt-1">
        <img class="size-10 rounded-md" src="https://placeholder.pagebee.io/api/plain/64/64" />
        <span class="flex-1">{{ item.name }}</span>
        <Input type="text" class="h-8 w-40" :placeholder="$t('activities.materials.quantity')"
            v-model="item.quantity" />
        <Button variant="ghost" size="icon-sm" @click="() => emit('remove', item)">
            <TrashIcon />
        </Button>
    </List>
    <div v-else class="text-muted-foreground flex mx-auto items-center gap-2 h-10">
        <CircleOffIcon />
        <span>{{ $t('activities.materials.notNeeded') }}</span>
    </div>
</template>
