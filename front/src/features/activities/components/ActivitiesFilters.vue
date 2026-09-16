<script setup lang="ts">
import SearchInput from '@chapelure/ui/data/SearchInput.vue';
import Modal from '@chapelure/ui/modals/Modal.vue';
import { useModal } from '@chapelure/ui/modals/useModal';
import CriterionField from '@features/activities/components/CriterionField.vue';
import type { ActivityFilters } from '@features/activities/composables/useActivitiesList';
import { describeCriterion, isCriterionSet } from '@features/activities/model/criteria';
import { CheckIcon, FunnelIcon, XIcon } from 'lucide-vue-next';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

/**
 * The list screen's filter state, owned by `useActivitiesList`. Handed down whole rather than
 * as ten props — and rebuilt into a query there, next to the call that sends it.
 *
 * Nothing here knows what an activity can be narrowed by: the form and the chips are both
 * generated from the criteria, so a new filter appears in each without this file changing.
 */
const props = defineProps<{ filters: ActivityFilters }>();

// Destructured so the template sees plain bindings: a ref reached through an object is not
// unwrapped in templates, only a top-level one is.
const {
    search, applied, draft,
    apply, openDraft, discardDraft, applyDraft, resetDraft, clearApplied, removeCriterion,
} = props.filters;

// The modal is only a way to edit the draft; the composable owns what that means.
const controller = useModal({
    onShow: openDraft,
    onCancel: discardDraft,
    onConfirm: applyDraft,
});

/** Only what the user has set: untouched criteria show no chip, and the row collapses. */
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
