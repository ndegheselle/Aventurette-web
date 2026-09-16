<script setup lang="ts">
import SearchInput from '@chapelure/ui/data/SearchInput.vue';
import CriterionField from '@chapelure/ui/filter/CriterionField.vue';
import { describeCriterion, isCriterionSet } from '@chapelure/ui/filter/criteria';
import type { Filters } from '@chapelure/ui/filter/useFilters';
import Modal from '@chapelure/ui/modals/Modal.vue';
import { useModal } from '@chapelure/ui/modals/useModal';
import { CheckIcon, FunnelIcon, XIcon } from 'lucide-vue-next';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

/**
 * The list screen's filter state, owned by `useActivitiesList`. Nothing here knows what an
 * activity can be narrowed by — the form and the chips are generated from the criteria, so a
 * new filter appears in both without this file changing.
 */
const props = defineProps<{ filters: Filters }>();

// Destructured: a ref reached through an object is not unwrapped in a template.
const {
    search, applied, draft,
    apply, openDraft, discardDraft, applyDraft, resetDraft, clearApplied, removeCriterion,
} = props.filters;

const controller = useModal({
    onShow: openDraft,
    onCancel: discardDraft,
    onConfirm: applyDraft,
});

/** Untouched criteria show no chip, so the row collapses when nothing is set. */
const activeCriteria = computed(() => applied.value.filter(isCriterionSet));
</script>

<template>
    <div class="flex gap-2">
        <SearchInput @search="() => apply()" v-model="search" />
        <button class="btn" @click="() => controller.show()">
            <FunnelIcon />
            {{ $t('actions.filter') }}
        </button>
    </div>

    <section v-if="activeCriteria.length" class="flex flex-wrap items-center gap-1">
        <span v-for="criterion in activeCriteria" :key="criterion.key" class="badge badge-lg gap-2 pe-0">
            <component :is="criterion.icon" class="icon-sm" />
            {{ describeCriterion(t, criterion) }}
            <button class="btn btn-xs btn-square btn-ghost" :aria-label="$t('actions.remove')"
                @click="() => removeCriterion(criterion.key)">
                <XIcon class="icon-sm" />
            </button>
        </span>
        <button class="btn btn-sm btn-ghost ms-auto" @click="clearApplied">
            <XIcon />
            {{ $t('actions.reset') }}
        </button>
    </section>

    <Modal :controller="controller">
        <template #title>
            {{ $t('actions.filter') }}
        </template>
        <section class="flex flex-col gap-2">
            <fieldset class="fieldset">
                <CriterionField v-for="criterion in draft" :key="criterion.key" :criterion="criterion" />
            </fieldset>
        </section>
        <template #actions>
            <button class="btn me-auto" @click="resetDraft">
                <XIcon />
                {{ $t("actions.reset") }}
            </button>
            <button class="btn btn-primary" @click="() => controller.confirm(true as any)">
                <CheckIcon />
                {{ $t("actions.filter") }}
            </button>
        </template>
    </Modal>
</template>
