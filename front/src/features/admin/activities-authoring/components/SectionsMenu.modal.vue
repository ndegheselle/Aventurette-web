<!-- The page's sections for a small screen: a group opens onto its children, with a way back. -->
<script setup vapor lang="ts">
import Modal from '@chapelure/ui/modals/Modal.vue';
import { useModal } from '@chapelure/ui/modals/useModal';
import type { SectionEntry } from '@features/admin/activities-authoring/components/SectionsMenu.vue';
import { ArrowLeftIcon, ChevronRightIcon } from 'lucide-vue-next';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

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
                <button class="btn btn-sm btn-ghost btn-square"
                        :aria-label="t('actions.back')"
                        @click="() => group = null">
                    <ArrowLeftIcon />
                </button>
                {{ t(group.label) }}
            </span>
            <template v-else>
                {{ t('activities.authoring.navigation.title') }}
            </template>
        </template>

        <ul class="menu w-full">
            <li v-for="entry in group?.children ?? entries"
                :key="entry.key">
                <button @click="() => pick(entry)">
                    <component :is="entry.icon"
                               class="icon-sm opacity-50" />
                    {{ t(entry.label) }}
                    <ChevronRightIcon v-if="entry.children?.length"
                                      class="icon-sm ms-auto opacity-50" />
                </button>
            </li>
        </ul>
    </Modal>
</template>
