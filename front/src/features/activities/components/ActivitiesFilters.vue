<script setup lang="ts">
import { createFilter, createGroup, createSearchFilter, FilterOperator, removeEmptyFilters, type FilterGroup } from '@chapelure/api/filters';
import Search from '@chapelure/common/components/inputs/Search.vue';
import Modal from '@chapelure/common/components/popups/Modal.vue';
import { useModal } from '@chapelure/common/composables/popups/useModal';
import { type ActivityData } from '@features/activities/data/activities';
import { availablesEnvironments, useAgeDisplay } from '@features/activities/locales/helpers';
import { BabyIcon, CheckIcon, ChevronRightIcon, ClockIcon, FunnelIcon, MapIcon, XIcon } from 'lucide-vue-next';
import { computed, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const controller = useModal({onCancel, onConfirm, onShow});
const search = ref<string>('');
const model = defineModel<FilterGroup<ActivityData>>();

const emit = defineEmits<{
    (e: 'change', value: FilterGroup<ActivityData>): void;
}>();

/* Filter values */
const current = reactive({
    ageMin: null as number | null,
    ageMax: null as number | null,
    durationMin: null as number | null,
    durationMax: null as number | null,
    environment: [] as string[],
});

const pending = reactive({
    ageMin: null as number | null,
    ageMax: null as number | null,
    durationMin: null as number | null,
    durationMax: null as number | null,
    environment: [] as string[],
});

const ageDisplay = computed(() => useAgeDisplay(t, current["ageMin"], current["ageMax"]));
const additionalFilters = computed(() => current["durationMin"] || current["durationMax"] ? 1 : 0);

function onShow()
{
    Object.assign(current, pending);
}

function onCancel()
{
    Object.assign(pending, current);
}

function onConfirm()
{
    Object.assign(current, pending);
}

function onChanged() {
    const searchFilter = createSearchFilter<ActivityData>(search.value, ['name', 'summary', 'description']);
    let group = createGroup({
        filters: [
            createFilter<ActivityData>({ key: 'ageMin', value: current["ageMin"], operator: FilterOperator.GreaterThan }),
            createFilter<ActivityData>({ key: 'ageMax', value: current["ageMax"], operator: FilterOperator.LessThan }),
            createFilter<ActivityData>({ key: 'durationMinutes', value: current["durationMin"], operator: FilterOperator.GreaterThan }),
            createFilter<ActivityData>({ key: 'durationMinutes', value: current["durationMax"], operator: FilterOperator.LessThan }),
            createFilter<ActivityData>({ key: 'environment', value: [...current["environment"]], operator: FilterOperator.Contains }),
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
    pending["ageMin"] = null;
    pending["ageMax"] = null;
    pending["durationMin"] = null;
    pending["durationMax"] = null;
    pending["environment"] = [];
}
</script>

<template>
    <Search @search="() => onChanged()" v-model="search" />
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
            <span v-if="additionalFilters" class="badge badge-sm badge-primary">{{ additionalFilters }}</span>
        </button>
    </section>
    <Modal :controller="controller">
        <template #title>
            {{ $t('actions.filter') }}
        </template>
        <section class="flex flex-col gap-2">
            <fieldset class="fieldset">
                <legend class="fieldset-legend justify-start">
                    <BabyIcon /> {{ $t('activities.fields.age') }}
                </legend>
                <div class="flex gap-2 items-center">
                    <span class="text-sm opacity-50">{{ $t('data.minimum') }}</span>
                    <input type="number" class="input input-sm w-full" v-model="pending['ageMin']" @change="onChanged" />
                    <span class="text-sm opacity-50">{{ $t('data.maximum') }}</span>
                    <input type="number" class="input input-sm w-full" v-model="pending['ageMax']" @change="onChanged" />
                </div>

                <legend class="fieldset-legend justify-start">
                    <ClockIcon /> {{ $t('activities.fields.durationMinutes') }}
                </legend>
                <div class="flex gap-2 items-center">
                    <span class="text-sm opacity-50">{{ $t('data.minimum') }}</span>
                    <input type="number" class="input input-sm w-full" v-model="pending['durationMin']" @change="onChanged" />
                    <span class="text-sm opacity-50">{{ $t('data.maximum') }}</span>
                    <input type="number" class="input input-sm w-full" v-model="pending['durationMax']" @change="onChanged" />
                </div>

                <legend class="fieldset-legend justify-start">
                    <MapIcon /> {{ $t('activities.fields.environment') }}
                </legend>
                <div class="flex gap-2 flex-col">
                    <label v-for="choice in availablesEnvironments" :key="choice.value"
                        class="label cursor-pointer gap-2">
                        <input type="checkbox" class="checkbox checkbox-sm" :value="choice.value" v-model="pending['environment']"
                            @change="onChanged" />
                        <span class="text-sm">{{ $t(choice.label) }}</span>
                    </label>
                </div>
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