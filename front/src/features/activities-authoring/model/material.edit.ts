import type { ActivityData } from "@features/activities/model/activity";
import type { ActivityMaterialData } from "@features/activities/model/material";

/**
 * The activity's material list seen from its author's side: which names to offer, and what
 * removing one leaves behind.
 */

// ── Suggesting a name ───────────────────────────────────────────────────────────────────────

/**
 * The names to offer for the activity's materials: distinct names used in any activity, minus
 * the ones this one has, narrowed by what the user typed. Picking one writes a new row rather
 * than linking someone else's.
 *
 * Matched case-insensitively; the first spelling seen is the one offered.
 */
export function materialNameSuggestions(
    available: ActivityMaterialData[],
    selected: ActivityMaterialData[],
    search: string = "",
): string[] {
    const taken = new Set(selected.map(material => key(material.name)));
    const term = key(search);
    const names = new Map<string, string>();

    for (const material of available) {
        const name = material.name?.trim();
        if (!name) continue;

        const id = key(name);
        if (taken.has(id) || names.has(id)) continue;
        if (term && !id.includes(term)) continue;

        names.set(id, name);
    }

    return [...names.values()];
}

/**
 * Whether what the user typed is worth offering to create — not when the activity already has
 * it, and not when it is already a suggestion.
 */
export function canCreateMaterial(
    search: string,
    suggestions: string[],
    selected: ActivityMaterialData[],
): boolean {
    const name = key(search);
    if (!name) return false;

    return !suggestions.some(suggestion => key(suggestion) === name)
        && !selected.some(material => key(material.name) === name);
}

/** Comparison key: two spellings of the same material share one. */
function key(name: string | undefined): string {
    return (name ?? "").trim().toLowerCase();
}

// ── Deleting one ────────────────────────────────────────────────────────────────────────────

/**
 * The activity once a material is deleted: off its list, and off every step and workshop that
 * recalled it. The backend drops those links itself; a step still holding the id in memory would
 * send it back on its next save, and be refused for pointing at nothing.
 */
export function withoutMaterial(activity: ActivityData, id: string): ActivityData {
    const kept = (materials: ActivityMaterialData[]) => materials.filter(material => material.id !== id);

    return {
        ...activity,
        materials: kept(activity.materials),
        steps: activity.steps.map(step => ({ ...step, materials: kept(step.materials) })),
        workshops: activity.workshops.map(workshop => ({ ...workshop, materials: kept(workshop.materials) })),
    };
}
