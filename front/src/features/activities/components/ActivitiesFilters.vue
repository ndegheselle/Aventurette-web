<script setup lang="ts">
import { useModal } from '@chapelure/ui/composables/useModal';
import SearchInput from '@chapelure/ui/data/SearchInput.vue';
import TagSelect from '@chapelure/ui/data/TagSelect.vue';
import Field from '@chapelure/ui/forms/Field.vue';
import Modal from '@chapelure/ui/overlays/Modal.vue';
import type { ActivityFilters } from '@features/activities/composables/useActivitiesList';
import { availablesEnvironments, formatAgeRange } from '@features/activities/model/activity';
import { BabyIcon, CheckIcon, ChevronRightIcon, ClockIcon, FunnelIcon, MapIcon, TrendingUpIcon, XIcon } from 'lucide-vue-next';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

/**
 * The list screen's filter state, owned by `useActivitiesList`. Handed down whole rather than
 * as ten props — and rebuilt into a query there, next to the call that sends it.
 */
const props = defineProps<{ filters: ActivityFilters }>();

// Destructured so the template sees plain bindings: a ref reached through an object is not
// unwrapped in templates, only a top-level one is.
const {
    search, applied, draft, availableBenefits, draftBenefits, showsAdvancedBadge,
    apply, openDraft, discardDraft, applyDraft, resetDraft,
} = props.filters;

// The modal is only a way to edit the draft; the composable owns what that means.
const controller = useModal({
    onShow: openDraft,
    onCancel: discardDraft,
    onConfirm: applyDraft,
});

const ageDisplay = computed(() => formatAgeRange(t, applied.ageMin, applied.ageMax));
</script>

<template>
    <SearchInput @search="() => apply()" v-model="search" />
    <section class="flex gap-1">
        <button class="btn btn-sm flex-1" @click="() => controller.show()">
            <BabyIcon />
            {{ ageDisplay || $t('activities.fields.age') }}
            <ChevronRightIcon />
        </button>
        <button class="btn btn-sm flex-1" @click="() => controller.show()">
            <MapIcon />
            <span v-if="!applied.environment.length">
                {{ $t('activities.fields.environment') }}
            </span>
            <span v-else>
                {{ applied.environment.map((v) => $t(`activities.environment.${v}`)).join(', ') }}
            </span>
            <ChevronRightIcon />
        </button>
        <button class="btn btn-sm ms-auto" @click="() => controller.show()">
            <FunnelIcon />
            {{ $t('actions.filter') }}
            <!-- An indicator, not a count — see hasAdvancedCriteria in model/activity.filters.ts. -->
            <span v-if="showsAdvancedBadge" class="badge badge-primary badge-sm">1</span>
        </button>
    </section>
    <Modal :controller="controller">
        <template #title>
            {{ $t('actions.filter') }}
        </template>
        <section class="flex flex-col gap-2">
            <fieldset class="fieldset">
                <Field>
                    <template #label>
                        <span class="flex items-center gap-1"><BabyIcon /> {{ $t('activities.fields.age') }}</span>
                    </template>
                    <div class="flex gap-2 items-center">
                        <span class="text-sm opacity-50">{{ $t('data.minimum') }}</span>
                        <input type="number" class="input input-sm w-full" v-model="draft.ageMin" />
                        <span class="text-sm opacity-50">{{ $t('data.maximum') }}</span>
                        <input type="number" class="input input-sm w-full" v-model="draft.ageMax" />
                    </div>
                </Field>

                <Field>
                    <template #label>
                        <span class="flex items-center gap-1"><ClockIcon /> {{ $t('activities.fields.durationMinutes') }}</span>
                    </template>
                    <div class="flex gap-2 items-center">
                        <span class="text-sm opacity-50">{{ $t('data.minimum') }}</span>
                        <input type="number" class="input input-sm w-full" v-model="draft.durationMin" />
                        <span class="text-sm opacity-50">{{ $t('data.maximum') }}</span>
                        <input type="number" class="input input-sm w-full" v-model="draft.durationMax" />
                    </div>
                </Field>

                <Field>
                    <template #label>
                        <span class="flex items-center gap-1"><MapIcon /> {{ $t('activities.fields.environment') }}</span>
                    </template>
                    <div class="flex gap-2 flex-col">
                        <label v-for="choice in availablesEnvironments" :key="choice.value"
                               class="label cursor-pointer gap-2">
                            <input type="checkbox" class="checkbox checkbox-sm" :value="choice.value" v-model="draft.environment" />
                            <span class="text-sm">{{ $t(choice.label) }}</span>
                        </label>
                    </div>
                </Field>

                <Field>
                    <template #label>
                        <span class="flex items-center gap-1"><TrendingUpIcon /> {{ $t('activities.fields.benefits') }}</span>
                    </template>
                    <TagSelect :items="availableBenefits" display-key="name" v-model="draftBenefits" />
                </Field>
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
