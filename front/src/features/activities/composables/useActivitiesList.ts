import {
    createFilter,
    createGroup,
    createSearchFilter,
    FilterLogical,
    FilterOperator,
    Paginated,
    PaginationOptions,
    removeEmptyFilters,
    type FilterGroup,
} from '@chapelure/core';
import {
    isCriterionSet,
    optionsCriterion,
    rangeCriterion,
    tagsCriterion,
    type Criterion,
} from '@chapelure/ui/filter/criteria';
import { useFilters } from '@chapelure/ui/filter/useFilters';
import { activitiesApi as activities } from '@features/activities/api/activities.api';
import {
    activityAttributeOptionsApi as picks,
    activityAttributeValuesApi as values,
} from '@features/activities/api/attributes.api';
import { attributeIcon } from '@features/activities/composables/attributeIcons';
import { useAttributes } from '@features/activities/composables/useAttributes';
import type { ActivityData } from '@features/activities/model/activity';
import {
    activitiesMatchingAll,
    AttributeType,
    isFilterable,
    type ActivityAttributeOptionData,
    type ActivityAttributeValueData,
    type AttributeData,
} from '@features/activities/model/attribute';
import { ref, watch } from 'vue';

const DEFAULT_PER_PAGE = 5;

/** The criterion carrying the groups an activity belongs to — a field of its own, not an attribute. */
const GROUPS_CRITERION = 'groups';

/**
 * How many attribute rows one sweep reads. PocketBase caps a page at 1000, and the sweep is a
 * union across the criteria — a filter matching more rows than this narrows to the first 1000.
 */
const SWEEP_LIMIT = 1000;

/**
 * What the list can be narrowed by, generated from the catalogue: one criterion per filterable
 * attribute, plus the groups. Adding a filter is seeding an attribute, not editing this file.
 *
 * An attribute's name and its options' labels are stored, not translated, so they are handed to
 * the form as-is — vue-i18n renders an unknown key as itself, which is exactly the name.
 */
export function activityCriteria(attributes: AttributeData[]): Criterion[] {
    return attributes.filter(isFilterable).map((attribute) => {
        const shared = { key: attribute.slug, label: attribute.name, icon: attributeIcon(attribute.slug) };
        const choices = attribute.options.map(option => ({ label: option.label, value: option.id }));

        switch (attribute.type) {
            case AttributeType.range:
            case AttributeType.number:
                // Both bounds compare against the value row, so neither names a field of the
                // activity — `buildAttributeSweep` is what reads them.
                return rangeCriterion({ ...shared, display: 'activities.bounds', minField: '', maxField: '' });
            case AttributeType.single_choice:
                return optionsCriterion({ ...shared, field: 'option', operator: FilterOperator.AnyEquals, choices });
            default:
                return { ...tagsCriterion({ ...shared, field: 'option', operator: FilterOperator.AnyEquals }), choices };
        }
    });
}

/**
 * The query for the activity's own fields: the search, and the groups it belongs to. Everything
 * else is an attribute, and lives in rows of another collection.
 */
export function buildActivityFilters(
    criteria: Criterion[],
    search: string,
    matched: string[] | null,
): FilterGroup<ActivityData> {
    const group = createGroup<ActivityData>({ filters: [] });

    const groups = criteria.find(criterion => criterion.key === GROUPS_CRITERION);
    if (groups && groups.type !== 'range' && groups.value.length)
        group.filters.push(createFilter<ActivityData>({
            key: 'groups', value: [...groups.value], operator: FilterOperator.AnyEquals,
        }));

    // Null means nothing was narrowed by an attribute. An empty list cannot be expressed as a
    // filter — `removeEmptyFilters` drops it, and the list would come back unfiltered — so the
    // caller answers that case without asking.
    if (matched?.length)
        group.filters.push(createFilter<ActivityData>({
            key: 'id', value: matched, operator: FilterOperator.AnyEquals,
        }));

    const searchFilter = createSearchFilter<ActivityData>(search, ['name', 'description']);
    if (searchFilter)
        group.filters.push(searchFilter);

    return removeEmptyFilters(group);
}

/**
 * The union of what each attribute criterion matches, as one query per collection: typed values
 * on one side, picked options on the other.
 *
 * A union and not an intersection, because one row can only ever satisfy one criterion — an
 * activity's age and its domain are two rows. What matched them all is counted in the model.
 */
export function buildAttributeSweep(criteria: Criterion[], attributes: AttributeData[]) {
    const bySlug = new Map(attributes.map(attribute => [attribute.slug, attribute]));
    const valueGroups: FilterGroup<ActivityAttributeValueData>[] = [];
    const pickGroups: FilterGroup<ActivityAttributeOptionData>[] = [];

    for (const criterion of criteria) {
        const attribute = bySlug.get(criterion.key);
        if (!attribute || !isCriterionSet(criterion)) continue;

        const belongs = createFilter<any>({
            key: 'attribute', value: attribute.id, operator: FilterOperator.Equals,
        });

        if (criterion.type === 'range') {
            const { min, max } = criterion.value;
            // A stored range matches when it overlaps the one asked for; a single number when it
            // falls inside it. Inclusive on both sides — a 6-10 activity answers "for a 10 year old".
            const bounds = attribute.type === AttributeType.range
                ? [
                    createFilter<any>({ key: 'range_max', value: min, operator: FilterOperator.GreaterOrEquals }),
                    createFilter<any>({ key: 'range_min', value: max, operator: FilterOperator.LessOrEquals }),
                ]
                : [
                    createFilter<any>({ key: 'number_value', value: min, operator: FilterOperator.GreaterOrEquals }),
                    createFilter<any>({ key: 'number_value', value: max, operator: FilterOperator.LessOrEquals }),
                ];

            valueGroups.push(removeEmptyFilters(
                createGroup({ filters: [belongs, ...bounds], combine: FilterLogical.Or }),
            ));
            continue;
        }

        const picked = createFilter<any>({
            key: 'option', value: [...criterion.value], operator: FilterOperator.AnyEquals,
        });
        const matching = createGroup<any>({ filters: [belongs, picked], combine: FilterLogical.Or });

        if (attribute.type === AttributeType.multi_choice) pickGroups.push(matching);
        else valueGroups.push(matching);
    }

    return {
        values: valueGroups.length ? createGroup({ filters: valueGroups }) : null,
        picks: pickGroups.length ? createGroup({ filters: pickGroups }) : null,
        count: valueGroups.length + pickGroups.length,
    };
}

/**
 * The public activity list: what is on it, and what narrows it. Read-only — writing an activity
 * is the `activities-authoring` feature's, which lists the author's own rather than everybody's.
 *
 * Narrowing by an attribute takes two round trips: one sweep of the attribute rows, then the
 * page of activities whose ids came back. Narrowing by nothing but the search takes one.
 */
export function useActivitiesList(perPage: number = DEFAULT_PER_PAGE) {
    const paginated = ref<Paginated<ActivityData>>(
        new Paginated<ActivityData>([], 0, new PaginationOptions(1, perPage)),
    );

    const { groups, attributes } = useAttributes();
    const filters = useFilters([groupsCriterion()], () => { refresh(); });

    // The catalogue arrives after the first paint, and the criteria are made of it.
    watch(attributes, (loaded) => {
        filters.replaceCriteria([groupsCriterion(), ...activityCriteria(loaded)]);
        filters.setChoices(GROUPS_CRITERION, groups.value.map(group => ({ label: group.name, value: group.id })));
        refresh();
    });

    /** Re-query with the applied criteria and the current page. */
    async function refresh() {
        const sweep = buildAttributeSweep(filters.applied.value, attributes.value);
        const matched = sweep.count ? await sweepMatches(sweep) : null;

        // Nothing answered every criterion: there is no query to send, and an empty `id` filter
        // would read as no filter at all.
        if (matched && !matched.length) {
            paginated.value = new Paginated<ActivityData>([], 0, paginated.value.options);
            return;
        }

        paginated.value = await activities.filter(
            buildActivityFilters(filters.applied.value, filters.search.value, matched),
            paginated.value.options,
        );
    }

    /** The activities that answered every attribute criterion, out of the union each one matched. */
    async function sweepMatches(sweep: ReturnType<typeof buildAttributeSweep>): Promise<string[]> {
        const page = new PaginationOptions(1, SWEEP_LIMIT);
        const [matchedValues, matchedPicks] = await Promise.all([
            sweep.values ? values.filter(sweep.values, page) : null,
            sweep.picks ? picks.filter(sweep.picks, page) : null,
        ]);

        return activitiesMatchingAll(
            [...(matchedValues?.items ?? []), ...(matchedPicks?.items ?? [])],
            sweep.count,
        );
    }

    return { paginated, refresh, filters, attributes };
}

/** The groups an activity belongs to — a relation on the activity, so it filters in one query. */
function groupsCriterion(): Criterion {
    return tagsCriterion({
        key: GROUPS_CRITERION,
        label: 'activities.fields.groups',
        icon: attributeIcon(GROUPS_CRITERION),
        field: 'groups',
        operator: FilterOperator.AnyEquals,
    });
}
