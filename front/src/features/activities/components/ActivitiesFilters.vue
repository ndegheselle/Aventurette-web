<script setup lang="ts">
import { createFilter, createGroup, FilterOperator, type FilterGroup } from '@chapelure/api/filters';
import { type ActivityData, ActivityEnvironment } from '@features/activities/data/activities';
import { useDeferredModal } from '@chapelure/common/composables/popups/useModal';
import Modal from '@chapelure/common/components/popups/Modal.vue';
import { FunnelIcon, ChevronRightIcon, BabyIcon, MapIcon, ClockIcon } from 'lucide-vue-next';
import { reactive, computed } from 'vue';
import { useAgeDisplay } from '@features/activities/locales/helpers';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const controller = useDeferredModal();

/* Filter definitions */
const filterAgeMin = reactive(createFilter<ActivityData>({
    key: 'ageMin',
    value: null,
    operator: FilterOperator.GreaterThan,
}));
const filterAgeMax = reactive(createFilter<ActivityData>({
    key: 'ageMax',
    value: null,
    operator: FilterOperator.LessThan,
}));
const filterDurationMin = reactive(createFilter<ActivityData>({
    key: 'durationMinutes',
    value: null,
    operator: FilterOperator.GreaterThan,
}));
const filterDurationMax = reactive(createFilter<ActivityData>({
    key: 'durationMinutes',
    value: null,
    operator: FilterOperator.LessThan,
}));
const filterEnvironment = reactive(createFilter<ActivityData>({
    key: 'environment',
    value: [],
    operator: FilterOperator.Contains,
}));

const availablesEnvironments = [
    { label: 'activities.environment.INDOOR', value: ActivityEnvironment.INDOOR },
    { label: 'activities.environment.OUTDOOR', value: ActivityEnvironment.OUTDOOR },
    { label: 'activities.environment.CLASSROOM', value: ActivityEnvironment.CLASSROOM },
    { label: 'activities.environment.CAR', value: ActivityEnvironment.CAR },
];

const group: FilterGroup<ActivityData> = createGroup({
    filters: [
        filterAgeMin,
        filterAgeMax,
        filterDurationMin,
        filterDurationMax,
        filterEnvironment
    ],
});

const ageDisplay = computed(() => useAgeDisplay(t, filterAgeMin.value, filterAgeMax.value));
const additionalFilters = computed(() => filterDurationMin.value || filterDurationMax.value ? 1 : 0);
</script>

<template>
    <section class="flex gap-1">
        <button class="btn btn-sm flex-1" @click="() => controller.show()">
            <BabyIcon />
            {{ ageDisplay || $t('activities.fields.age') }}
            <ChevronRightIcon />
        </button>
        <button class="btn btn-sm flex-1" @click="() => controller.show()">
            <MapIcon />
            <span v-if="!filterEnvironment.value.length">
                {{ $t('activities.fields.environment') }}
            </span>
            <span v-else>
                {{filterEnvironment.value.map((v: any) => $t(`activities.environment.${v}`)).join(', ')}}
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
                    <input type="number" class="input input-sm w-full" v-model="filterAgeMin.value" />
                    <span class="text-sm opacity-50">{{ $t('data.maximum') }}</span>
                    <input type="number" class="input input-sm w-full" v-model="filterAgeMax.value" />
                </div>

                <legend class="fieldset-legend justify-start">
                    <ClockIcon /> {{ $t('activities.fields.durationMinutes') }}
                </legend>
                <div class="flex gap-2 items-center">
                    <span class="text-sm opacity-50">{{ $t('data.minimum') }}</span>
                    <input type="number" class="input input-sm w-full" v-model="filterDurationMin.value" />
                    <span class="text-sm opacity-50">{{ $t('data.maximum') }}</span>
                    <input type="number" class="input input-sm w-full" v-model="filterDurationMax.value" />
                </div>

                <legend class="fieldset-legend justify-start">
                    <MapIcon /> {{ $t('activities.fields.environment') }}
                </legend>
                <div class="flex gap-2 flex-col">
                    <label v-for="choice in availablesEnvironments" :key="choice.value"
                        class="label cursor-pointer gap-2">
                        <input type="checkbox" class="checkbox checkbox-sm" :value="choice.value"
                            v-model="filterEnvironment.value" />
                        <span class="text-sm">{{ $t(choice.label) }}</span>
                    </label>
                </div>
            </fieldset>
        </section>
    </Modal>
</template>