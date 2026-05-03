<script setup lang="ts">
import { createFilter, createGroup, FilterOperator, removeEmptyFilters, type FilterGroup } from '@chapelure/api/filters';
import { type ActivityData } from '@features/activities/data/activities';
import { useDeferredModal } from '@chapelure/common/composables/popups/useModal';
import Modal from '@chapelure/common/components/popups/Modal.vue';
import { FunnelIcon, ChevronRightIcon, BabyIcon, MapIcon, ClockIcon, XIcon, CheckIcon} from 'lucide-vue-next';
import { computed, ref } from 'vue';
import { availablesEnvironments, useAgeDisplay } from '@features/activities/locales/helpers';
import { useI18n } from 'vue-i18n';
import Search from '@chapelure/common/components/inputs/Search.vue';
import { createSearchFilter } from '@features/activities/data/activities.filters';

const { t } = useI18n();
const controller = useDeferredModal();
const search = ref<string>('');
const model = defineModel<FilterGroup<ActivityData>>();

const emit = defineEmits<{
    (e: 'change', value: FilterGroup<ActivityData>): void;
}>();

/* Filter values */
const ageMin = ref<number | null>(null);
const ageMax = ref<number | null>(null);
const durationMin = ref<number | null>(null);
const durationMax = ref<number | null>(null);
const environment = ref<string[]>([]);

const ageDisplay = computed(() => useAgeDisplay(t, ageMin.value, ageMax.value));
const additionalFilters = computed(() => durationMin.value || durationMax.value ? 1 : 0);

function onChanged() {
    const searchFilter = createSearchFilter(search.value);
    let group = createGroup({
        filters: [
            createFilter<ActivityData>({ key: 'ageMin', value: ageMin.value, operator: FilterOperator.GreaterThan }),
            createFilter<ActivityData>({ key: 'ageMax', value: ageMax.value, operator: FilterOperator.LessThan }),
            createFilter<ActivityData>({ key: 'durationMinutes', value: durationMin.value, operator: FilterOperator.GreaterThan }),
            createFilter<ActivityData>({ key: 'durationMinutes', value: durationMax.value, operator: FilterOperator.LessThan }),
            createFilter<ActivityData>({ key: 'environment', value: [...environment.value], operator: FilterOperator.Contains }),
        ],
    });

    if (searchFilter)
        group.filters.push(searchFilter);

    group = removeEmptyFilters(group);
    console.log(group);
    model.value = group;
    emit('change', group);
}

function reset() {
    search.value = '';
    ageMin.value = null;
    ageMax.value = null;
    durationMin.value = null;
    durationMax.value = null;
    environment.value = [];
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
            <span v-if="!environment.length">
                {{ $t('activities.fields.environment') }}
            </span>
            <span v-else>
                {{environment.map((v) => $t(`activities.environment.${v}`)).join(', ')}}
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
                    <input type="number" class="input input-sm w-full" v-model="ageMin" @change="onChanged" />
                    <span class="text-sm opacity-50">{{ $t('data.maximum') }}</span>
                    <input type="number" class="input input-sm w-full" v-model="ageMax" @change="onChanged" />
                </div>

                <legend class="fieldset-legend justify-start">
                    <ClockIcon /> {{ $t('activities.fields.durationMinutes') }}
                </legend>
                <div class="flex gap-2 items-center">
                    <span class="text-sm opacity-50">{{ $t('data.minimum') }}</span>
                    <input type="number" class="input input-sm w-full" v-model="durationMin" @change="onChanged" />
                    <span class="text-sm opacity-50">{{ $t('data.maximum') }}</span>
                    <input type="number" class="input input-sm w-full" v-model="durationMax" @change="onChanged" />
                </div>

                <legend class="fieldset-legend justify-start">
                    <MapIcon /> {{ $t('activities.fields.environment') }}
                </legend>
                <div class="flex gap-2 flex-col">
                    <label v-for="choice in availablesEnvironments" :key="choice.value"
                        class="label cursor-pointer gap-2">
                        <input type="checkbox" class="checkbox checkbox-sm" :value="choice.value" v-model="environment"
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