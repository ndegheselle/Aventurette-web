import {
    createFilter,
    createGroup,
    createSearchFilter,
    FilterOperator,
    removeEmptyFilters,
    type Filter,
    type FilterGroup,
    type Paginated,
} from '@chapelure/core';
import {
    optionsCriterion,
    rangeCriterion,
    tagsCriterion,
    type Criterion,
    type CriterionChoice,
} from '@chapelure/ui/filter/criteria';
import { useFilters } from '@chapelure/ui/filter/useFilters';
import {
    ActivitiesEnergyLevelOptions,
    ActivitiesEnvironnementOptions,
    ActivitiesSeasonOptions,
    ActivitiesWeatherOptions,
} from '@/backend/schema.g';
import { activitiesApi as activities } from '@features/activities/api/activities.api';
import type { ReferentialField } from '@features/activities/api/referentials.api';
import { useReferentials, type Referentials } from '@features/activities/composables/useReferentials';
import type { ActivityData } from '@features/activities/model/activity';
import {
    BabyIcon,
    CalendarIcon,
    CloudSunIcon,
    MapIcon,
    ShapesIcon,
    ShieldCheckIcon,
    SparklesIcon,
    TrendingUpIcon,
    UserRoundIcon,
    UsersIcon,
    ZapIcon,
} from 'lucide-vue-next';
import { onMounted, ref, watch, type Component } from 'vue';
import { useI18n } from 'vue-i18n';
import { getMessage } from '@/app/i18n';

const DEFAULT_PER_PAGE = 5;

/** The six developmental axes, in the order the Glossaire lists them. */
const DEVELOPMENT: ReferentialField[] = [
    'develop_physical',
    'develop_intellectual',
    'develop_affect',
    'develop_social',
    'develop_moral',
    'develop_spritual',
];

/**
 * What the list can be narrowed by. Every criterion names a column or a relation of `activities`
 * — which is the change from the catalogue this replaced: adding a filter is editing this file
 * again, and in exchange one query answers the whole form.
 *
 * It sits in `composables/` and not in `model/`: a criterion names an icon, and `model/` may not
 * import the view layer ([ADR 0009](docs/adr/0009-logic-lives-outside-components.md)).
 */
export function activityCriteria(): Criterion[] {
    return [
        optionsCriterion({
            key: 'environnement', label: 'activities.fields.environnement', icon: MapIcon,
            field: 'environnement', operator: FilterOperator.AnyEquals,
            choices: enumChoices('environnement', ActivitiesEnvironnementOptions),
        }),
        rangeCriterion({
            key: 'age', label: 'activities.fields.age', icon: BabyIcon,
            display: 'activities.bounds', minField: 'age_min', maxField: 'age_max',
            floor: 0, ceiling: 18,
        }),
        rangeCriterion({
            key: 'participants', label: 'activities.fields.participants', icon: UsersIcon,
            display: 'activities.bounds', minField: 'participants_min', maxField: 'participants_max',
            floor: 1, ceiling: 50,
        }),
        rangeCriterion({
            key: 'hosts', label: 'activities.fields.hosts', icon: UserRoundIcon,
            display: 'activities.bounds',
            // One column, bounded from both ends — see `criterionFilters`.
            minField: 'recommended_hosts_numbers', maxField: 'recommended_hosts_numbers',
            floor: 1, ceiling: 20,
        }),
        referentialCriterion('fields', ShapesIcon),
        referentialCriterion('imaginary', SparklesIcon),
        optionsCriterion({
            key: 'season', label: 'activities.fields.season', icon: CalendarIcon,
            field: 'season', operator: FilterOperator.AnyEquals,
            choices: enumChoices('season', ActivitiesSeasonOptions),
        }),
        optionsCriterion({
            key: 'weather', label: 'activities.fields.weather', icon: CloudSunIcon,
            field: 'weather', operator: FilterOperator.AnyEquals,
            choices: enumChoices('weather', ActivitiesWeatherOptions),
        }),
        optionsCriterion({
            key: 'energy_level', label: 'activities.fields.energy_level', icon: ZapIcon,
            field: 'energy_level', operator: FilterOperator.AnyEquals,
            choices: enumChoices('energy_level', ActivitiesEnergyLevelOptions),
        }),
        referentialCriterion('security', ShieldCheckIcon),
        ...DEVELOPMENT.map(field => referentialCriterion(field, TrendingUpIcon)),
    ];
}

/**
 * The query the list sends: one group, everything AND-ed, the search in a nested group of its
 * own so its ORs cannot widen the rest.
 *
 * Untouched criteria contribute empty filters, which `removeEmptyFilters` drops — so nothing
 * here branches on "not set", and an untouched form asks for everything.
 */
export function buildActivityFilters(criteria: Criterion[], search: string): FilterGroup<ActivityData> {
    const group = createGroup<ActivityData>({ filters: [] });

    for (const criterion of criteria)
        group.filters.push(...criterionFilters(criterion));

    const searchFilter = createSearchFilter<ActivityData>(search, ['name', 'description']);
    if (searchFilter)
        group.filters.push(searchFilter);

    return removeEmptyFilters(group);
}

/**
 * What one criterion contributes.
 *
 * A range matches by **overlap**, not containment: the stored maximum has to reach the asked-for
 * minimum, and the stored minimum must not run past the asked-for maximum. Inclusive on both
 * ends — a 6-10 activity answers "for a 10 year old", which is what `GreaterOrEquals` is for.
 *
 * A single column bounded both ways — the host count — declares itself as both fields and falls
 * out of the same two comparisons.
 */
export function criterionFilters(criterion: Criterion): Filter<ActivityData>[] {
    if (criterion.type !== 'range')
        return [createFilter<ActivityData>({
            key: criterion.field as keyof ActivityData,
            // Copied, so editing the criterion afterwards cannot mutate a query already sent.
            value: [...criterion.value],
            operator: criterion.operator,
        })];

    return [
        createFilter<ActivityData>({
            key: criterion.maxField as keyof ActivityData,
            value: criterion.value.min,
            operator: FilterOperator.GreaterOrEquals,
        }),
        createFilter<ActivityData>({
            key: criterion.minField as keyof ActivityData,
            value: criterion.value.max,
            operator: FilterOperator.LessOrEquals,
        }),
    ];
}

/**
 * The choices a referential offers, in the locale on screen. Rows carry their own wordings, so
 * a label is text rather than a key — which is why `describeCriterion` renders a `tags` chip
 * as-is and an `options` chip through `t`.
 */
export function referentialChoices(rows: Referentials, locale: string): Record<string, CriterionChoice[]> {
    return Object.fromEntries(
        Object.entries(rows).map(([field, list]) => [
            field,
            list.map(row => ({ label: getMessage(row.name, locale), value: row.id })),
        ]),
    );
}

/**
 * The public activity list: what is on it, and what narrows it. Read-only — writing an activity
 * is the `activities-authoring` feature's, which lists the author's own rather than everybody's.
 */
export function useActivitiesList(perPage: number = DEFAULT_PER_PAGE) {
    const { locale } = useI18n();
    const paginated = ref<Paginated<ActivityData>>(
        { items: [], total: 0, options: { page: 1, perPage } },
    );

    const { rows } = useReferentials();
    const filters = useFilters(activityCriteria(), () => { refresh(); });

    // The referentials arrive after the first paint; until they do, the tag criteria offer
    // nothing. The criteria themselves are declared, so the form is on screen from the start.
    watch(rows, (loaded) => {
        for (const [field, choices] of Object.entries(referentialChoices(loaded, locale.value)))
            filters.setChoices(field, choices);
    });

    /** Re-query with the applied criteria and the current page. */
    async function refresh() {
        paginated.value = await activities.filter(
            buildActivityFilters(filters.applied.value, filters.search.value),
            paginated.value.options,
        );
    }

    onMounted(refresh);

    return { paginated, refresh, filters };
}

/** A tag criterion over one referential. Its choices are filled in once the rows arrive. */
function referentialCriterion(field: ReferentialField, icon: Component): Criterion {
    return tagsCriterion({
        key: field,
        label: `activities.fields.${field}`,
        icon,
        field,
        operator: FilterOperator.AnyEquals,
    });
}

/** A fixed set of stored values, each labelled by a key of its own. */
function enumChoices(name: string, values: Record<string, string>): CriterionChoice[] {
    return Object.values(values).map(value => ({
        label: `activities.${name}.${value}`,
        value,
    }));
}
