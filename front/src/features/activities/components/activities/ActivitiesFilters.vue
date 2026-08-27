<script setup lang="ts">
import { benefitsRepository as benefits } from '@features/activities/data/benefits.repository';
import { createFilter, createGroup, createSearchFilter, FilterOperator, removeEmptyFilters, type FilterGroup } from '@chapelure/core';
import { useModal } from '@chapelure/ui/composables/useModal';
import SearchInput from '@chapelure/ui/data/SearchInput.vue';
import TagSelect from '@chapelure/ui/data/TagSelect.vue';
import Field from '@chapelure/ui/forms/Field.vue';
import { BabyIcon, CheckIcon, ChevronRightIcon, ClockIcon, FunnelIcon, MapIcon, TrendingUpIcon, XIcon } from 'lucide-vue-next';
import Modal from '@chapelure/ui/overlays/Modal.vue';
import { type ActivityData } from '@features/activities/model/activity';
import { type BenefitData } from '@features/activities/model/benefit';
import { formatAgeRange } from '@features/activities/model/age';
import { availablesEnvironments } from '@features/activities/model/environment';
import { computed, onMounted, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const controller = useModal({ onCancel, onConfirm, onShow });
const search = ref<string>('');
const model = defineModel<FilterGroup<ActivityData>>();
const availableBenefits = ref<BenefitData[]>([]);

const emit = defineEmits<{
    (e: 'change', value: FilterGroup<ActivityData>): void;
}>();

/* Filter values */
function emptyFilters() {
    return {
        ageMin: null as number | null,
        ageMax: null as number | null,
        durationMin: null as number | null,
        durationMax: null as number | null,
        environment: [] as string[],
        benefits: [] as string[],
    };
}

const current = reactive(emptyFilters());
const pending = reactive(emptyFilters());

const ageDisplay = computed(() => formatAgeRange(t, current["ageMin"], current["ageMax"]));
const additionalFilters = computed(() => current["durationMin"] || current["durationMax"] || current["benefits"].length ? 1 : 0);

const pendingBenefits = computed({
    get: () => availableBenefits.value.filter(b => pending.benefits.includes(b.id)),
    set: (items) => {
        pending.benefits = Array.isArray(items) ? items.map(i => i.id) : [];
    }
});

function onShow() {
    // Initialize the temporary state (pending) with the currently applied filters
    Object.assign(pending, current);
}

function onCancel()
{
    Object.assign(pending, current);
}

function onConfirm()
{
    Object.assign(current, pending);
    onChanged();
}

function onChanged() {
    const searchFilter = createSearchFilter<ActivityData>(search.value, ['name', 'summary', 'description']);
    let group = createGroup({
        filters: [
            createFilter<ActivityData>({ key: 'ageMin', value: current["ageMin"], operator: FilterOperator.GreaterThan }),
            createFilter<ActivityData>({ key: 'ageMax', value: current["ageMax"], operator: FilterOperator.LessThan }),
            createFilter<ActivityData>({ key: 'durationMinutes', value: current["durationMin"], operator: FilterOperator.GreaterThan }),
            createFilter<ActivityData>({ key: 'durationMinutes', value: current["durationMax"], operator: FilterOperator.LessThan }),
            createFilter<ActivityData>({ key: 'environment', value: [...current["environment"]], operator: FilterOperator.Equals }),
            createFilter<ActivityData>({ key: 'benefits', value: [...current["benefits"]], operator: FilterOperator.AnyEquals }),
        ],
    });

    if (searchFilter)
        group.filters.push(searchFilter);

    group = removeEmptyFilters(group);
    model.value = group;
    emit('change', group);
}

function reset() {
    search.value = '';
    Object.assign(pending, emptyFilters());
}

onMounted(async () => {
    availableBenefits.value = await benefits.getAll();
});
</script>

<template>
    <SearchInput @search="() => onChanged()" v-model="search" />
    <section class="flex gap-1">
        <button class="btn btn-sm flex-1" @click="() => controller.show()">
            <BabyIcon />
            {{ ageDisplay || $t('activities.fields.age') }}
            <ChevronRightIcon />
        </button>
        <button class="btn btn-sm flex-1" @click="() => controller.show()">
            <MapIcon />
            <span v-if="!current['environment'].length">
                {{ $t('activities.fields.environment') }}
            </span>
            <span v-else>
                {{current['environment'].map((v) => $t(`activities.environment.${v}`)).join(', ')}}
            </span>
            <ChevronRightIcon />
        </button>
        <button class="btn btn-sm ms-auto" @click="() => controller.show()">
            <FunnelIcon />
            {{ $t('actions.filter') }}
            <span v-if="additionalFilters" class="badge badge-primary badge-sm">{{ additionalFilters }}</span>
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
                        <input type="number" class="input input-sm w-full" v-model="pending['ageMin']" />
                        <span class="text-sm opacity-50">{{ $t('data.maximum') }}</span>
                        <input type="number" class="input input-sm w-full" v-model="pending['ageMax']" />
                    </div>
                </Field>

                <Field>
                    <template #label>
                        <span class="flex items-center gap-1"><ClockIcon /> {{ $t('activities.fields.durationMinutes') }}</span>
                    </template>
                    <div class="flex gap-2 items-center">
                        <span class="text-sm opacity-50">{{ $t('data.minimum') }}</span>
                        <input type="number" class="input input-sm w-full" v-model="pending['durationMin']" />
                        <span class="text-sm opacity-50">{{ $t('data.maximum') }}</span>
                        <input type="number" class="input input-sm w-full" v-model="pending['durationMax']" />
                    </div>
                </Field>

                <Field>
                    <template #label>
                        <span class="flex items-center gap-1"><MapIcon /> {{ $t('activities.fields.environment') }}</span>
                    </template>
                    <div class="flex gap-2 flex-col">
                        <label v-for="choice in availablesEnvironments" :key="choice.value"
                               class="label cursor-pointer gap-2">
                            <input type="checkbox" class="checkbox checkbox-sm" :value="choice.value" v-model="pending['environment']" />
                            <span class="text-sm">{{ $t(choice.label) }}</span>
                        </label>
                    </div>
                </Field>

                <Field>
                    <template #label>
                        <span class="flex items-center gap-1"><TrendingUpIcon /> {{ $t('activities.fields.benefits') }}</span>
                    </template>
                    <TagSelect :items="availableBenefits" display-key="name" v-model="pendingBenefits" />
                </Field>
            </fieldset>
        </section>
        <template #actions>
            <button class="btn me-auto" @click="reset">
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
