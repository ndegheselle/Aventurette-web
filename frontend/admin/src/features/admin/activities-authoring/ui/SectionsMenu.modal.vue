<!-- The page's sections for a small screen: a group opens onto its children, with a way back. -->
<script setup lang="ts">
import Modal from '@chapelure/ui/modals/Modal.vue';
import { useModal } from '@chapelure/ui/modals/useModal';
import { Button } from '@chapelure/ui/shadcn/button';
import type { SectionEntry } from '@features/admin/activities-authoring/ui/SectionsMenu.vue';
import { ArrowLeftIcon, ChevronRightIcon } from 'lucide-vue-next';
import { ref } from 'vue';

const { entries } = defineProps<{ entries: SectionEntry[] }>();

/** The group being listed; none lists the top level. */
const group = ref<SectionEntry | null>(null);

// Every opening starts from the top level, wherever the last one was left.
const controller = useModal<SectionEntry>({ onShow: () => group.value = null });

function pick(entry: SectionEntry) {
    if (entry.children?.length) group.value = entry;
    else controller.confirm(entry);
}

/** Resolves with the entry picked, or null when closed without one. */
defineExpose({ show: controller.show });
</script>

<template>
    <Modal :controller
           :withActions="false">
        <template #title>
            <span v-if="group"
                  class="flex items-center gap-2">
                <Button variant="ghost"
                        size="icon-sm"
                        :aria-label="$t('actions.back')"
                        @click="() => group = null">
                    <ArrowLeftIcon />
                </Button>
                {{ $t(group.label) }}
            </span>
            <template v-else>
                {{ $t('activities.authoring.navigation.title') }}
            </template>
        </template>

        <ul class="flex w-full flex-col gap-1">
            <li v-for="entry in group?.children ?? entries"
                :key="entry.key">
                <Button variant="ghost"
                        class="w-full justify-start"
                        @click="() => pick(entry)">
                    <component :is="entry.icon"
                               class="text-muted-foreground" />
                    {{ $t(entry.label) }}
                    <ChevronRightIcon v-if="entry.children?.length"
                                      class="ms-auto text-muted-foreground" />
                </Button>
            </li>
        </ul>
    </Modal>
</template>
