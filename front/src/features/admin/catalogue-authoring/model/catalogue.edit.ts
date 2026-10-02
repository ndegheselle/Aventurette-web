import { createFilter, createGroup, createSearchFilter, FilterOperator, removeEmptyFilters, type FilterGroup } from '@chapelure/core';
import type { ActivityTipData, SafetyInstructionData } from '@features/activities/model/activity';
import { ActivityTagType, type ActivityTagData } from '@features/activities/model/tag';

/**
 * The catalogues seen from the screens that write them: materials, tags, safety instructions
 * and tips.
 */

/**
 * The name to write when a material's field is left: what was typed, trimmed — or nothing when
 * that is blank or the name it already has, so an untouched field costs no write.
 *
 * @param saved the name the catalogue holds
 * @param typed what the field holds now
 */
export function renamedTo(saved: string, typed: string): string | null {
    const name = typed.trim();
    return name && name !== saved ? name : null;
}

/**
 * A wording as a slug, the way the backend's migrations make one: lower case, accents dropped,
 * every run of anything else a single dash. "Forêt/arbres" is `foret-arbres`.
 */
export function slugify(words: string): string {
    return words
        .toLowerCase()
        .replace(/œ/g, 'oe')
        .replace(/æ/g, 'ae')
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

/**
 * The slug of a new entry as its name changes: it follows the name while it is empty or still
 * the one the previous name gave, and stays once the author has written one of their own.
 *
 * Only for a new entry. An existing slug is what the import matches on, so it changes only by hand.
 */
export function slugFollowing(slug: string, previousName: string, name: string): string {
    return !slug || slug === slugify(previousName) ? slugify(name) : slug;
}

/**
 * What a tags tab asks for: a search on the name or the slug, within one kind unless `null`.
 *
 * The search group is left out when there is no search: an empty group nested in another
 * reaches the backend as `()`, which it refuses.
 */
export function tagsFilter(search: string, type: ActivityTagType | null): FilterGroup<ActivityTagData> {
    const filters: FilterGroup<ActivityTagData>['filters'] = [
        createFilter<ActivityTagData>({ key: 'type', value: type, operator: FilterOperator.Equals }),
    ];
    if (search.trim())
        filters.unshift(createSearchFilter<ActivityTagData>(search.trim(), ['name', 'slug']));

    return removeEmptyFilters(createGroup<ActivityTagData>({ filters }));
}

/** A tag not written yet, of the kind the tab shows, or a theme on the "all" tab. */
export function newTag(type: ActivityTagType | null): ActivityTagData {
    return { name: '', slug: '', type: type ?? ActivityTagType.THEME } as ActivityTagData;
}

/** A safety instruction not written yet. */
export function newSafetyInstruction(): SafetyInstructionData {
    return { name: '', slug: '', description: '' } as SafetyInstructionData;
}

/** A tip not written yet. */
export function newTip(): ActivityTipData {
    return { name: '', description: '' } as ActivityTipData;
}
