import {
    ActivityFormat,
    ActivityLocation,
    ActivityPractice,
    ActivitySeason,
    ChildrenPace,
    type RangeEnd,
} from '@features/activities/models/activity';
import type { FilterDefaultsData } from '@features/user/models/user';

/**
 * What the catalogue is filtered on. The age, the duration and the places are the quick filters,
 * the ones the user's profile holds defaults for; the rest are only in the full sheet.
 */
export interface CatalogueFilters {
    ageMin: RangeEnd;
    ageMax: RangeEnd;
    durationMin: RangeEnd;
    durationMax: RangeEnd;
    locations: ActivityLocation[];
    formats: ActivityFormat[];
    practices: ActivityPractice[];
    childrenPaces: ChildrenPace[];
    seasons: ActivitySeason[];
}

export function emptyCatalogueFilters(): CatalogueFilters {
    return {
        ageMin: null, ageMax: null, durationMin: null, durationMax: null,
        locations: [], formats: [], practices: [], childrenPaces: [], seasons: [],
    };
}

/** A copy the sheets can edit, so cancelling leaves what is applied as it was. */
export function copyOf(filters: CatalogueFilters): CatalogueFilters {
    return {
        ...filters,
        locations: [...filters.locations],
        formats: [...filters.formats],
        practices: [...filters.practices],
        childrenPaces: [...filters.childrenPaces],
        seasons: [...filters.seasons],
    };
}

// ── The full sheet's choice groups ──────────────────────────────────────────────────────────

/** The filters picked from a list of values: which field, its title's key and its options'. */
export const CHOICE_GROUPS = [
    { field: 'formats', title: 'activities.fields.format', prefix: 'activities.format', values: Object.values(ActivityFormat) },
    { field: 'practices', title: 'activities.fields.practices', prefix: 'activities.practice', values: Object.values(ActivityPractice) },
    { field: 'childrenPaces', title: 'activities.fields.childrenPace', prefix: 'activities.childrenPace', values: Object.values(ChildrenPace) },
    { field: 'seasons', title: 'activities.fields.seasons', prefix: 'activities.season', values: Object.values(ActivitySeason) },
] as const;

export type ChoiceField = typeof CHOICE_GROUPS[number]['field'];

export function isChosen(filters: CatalogueFilters, field: ChoiceField, value: string): boolean {
    return (filters[field] as string[]).includes(value);
}

/** `filters` with `value` taken off `field` if it was chosen, added otherwise. */
export function withChoiceToggled(filters: CatalogueFilters, field: ChoiceField, value: string): CatalogueFilters {
    const chosen = filters[field] as string[];
    const next = chosen.includes(value) ? chosen.filter(other => other !== value) : [...chosen, value];

    return { ...filters, [field]: next };
}

export const LOCATIONS = Object.values(ActivityLocation);

// ── Quick filters ───────────────────────────────────────────────────────────────────────────

export const QUICK_FILTERS = ['age', 'duration', 'location'] as const;
export type QuickFilter = typeof QUICK_FILTERS[number];

export function isQuickFilterSet(filters: CatalogueFilters, quick: QuickFilter): boolean {
    switch (quick) {
        case 'age': return filters.ageMin !== null || filters.ageMax !== null;
        case 'duration': return filters.durationMin !== null || filters.durationMax !== null;
        case 'location': return filters.locations.length > 0;
    }
}

/** What a quick filter's badge reads: its name while unset, what is chosen once set. */
export interface QuickFilterLabel {
    key: string;
    params: Record<string, number>;
}

export function quickFilterLabel(filters: CatalogueFilters, quick: QuickFilter): QuickFilterLabel {
    if (!isQuickFilterSet(filters, quick)) return { key: `activities.filters.quick.${quick}`, params: {} };

    switch (quick) {
        case 'age': return rangeLabelOf('age', filters.ageMin, filters.ageMax);
        case 'duration': return rangeLabelOf('duration', filters.durationMin, filters.durationMax);
        case 'location':
            if (filters.locations.length === 1) return { key: `activities.location.${filters.locations[0]}`, params: {} };
            return { key: 'activities.filters.locations', params: { count: filters.locations.length } };
    }
}

/** A set range, in its own unit: `activities.filters.age.between` reads "3–6 years". */
function rangeLabelOf(quick: 'age' | 'duration', min: RangeEnd, max: RangeEnd): QuickFilterLabel {
    const prefix = `activities.filters.${quick}`;
    if (max === null) return { key: `${prefix}.from`, params: { min: min! } };
    if (min === null) return { key: `${prefix}.upTo`, params: { max } };
    if (min === max) return { key: `${prefix}.exactly`, params: { min } };

    return { key: `${prefix}.between`, params: { min, max } };
}

/** How many filters are set: a range or a list counts once, however much of it is chosen. */
export function activeFilterCount(filters: CatalogueFilters): number {
    const quick = QUICK_FILTERS.filter(filter => isQuickFilterSet(filters, filter)).length;
    const choices = CHOICE_GROUPS.filter(group => filters[group.field].length > 0).length;

    return quick + choices;
}

// ── The user's profile ──────────────────────────────────────────────────────────────────────

/** A profile that chose nothing has nothing to apply. */
export function isProfileEmpty(defaults: FilterDefaultsData | null): boolean {
    return defaults === null
        || (defaults.ageMin === null && defaults.ageMax === null
            && defaults.durationMin === null && defaults.durationMax === null
            && defaults.locations.length === 0);
}

/** The quick filters set to the profile's defaults; the others left as they are. */
export function withProfile(filters: CatalogueFilters, defaults: FilterDefaultsData): CatalogueFilters {
    return {
        ...filters,
        ageMin: defaults.ageMin, ageMax: defaults.ageMax,
        durationMin: defaults.durationMin, durationMax: defaults.durationMax,
        locations: [...defaults.locations],
    };
}

/** The quick filters cleared, as turning the profile off leaves them. */
export function withoutProfile(filters: CatalogueFilters): CatalogueFilters {
    return {
        ...filters,
        ageMin: null, ageMax: null, durationMin: null, durationMax: null,
        locations: [],
    };
}

/**
 * Whether the quick filters are the profile's, so the toggle reads on. Places are compared as a
 * set: picking them in another order is the same choice. An empty profile is never applied.
 */
export function matchesProfile(filters: CatalogueFilters, defaults: FilterDefaultsData | null): boolean {
    if (defaults === null || isProfileEmpty(defaults)) return false;

    return filters.ageMin === defaults.ageMin && filters.ageMax === defaults.ageMax
        && filters.durationMin === defaults.durationMin && filters.durationMax === defaults.durationMax
        && filters.locations.length === defaults.locations.length
        && defaults.locations.every(location => filters.locations.includes(location));
}
