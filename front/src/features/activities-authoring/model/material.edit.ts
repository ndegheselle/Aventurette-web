import type { ActivityData } from "@features/activities/model/activity";
import type { ActivityMaterialData, MaterialData } from "@features/activities/model/material";

/**
 * The activity's material list seen from its author's side: which catalogue materials to offer,
 * when a typed name is a new one, and what removing one leaves behind.
 */

// ── Picking one ─────────────────────────────────────────────────────────────────────────────

/**
 * The catalogue materials to offer for the activity: the ones it does not list yet, narrowed by
 * what the user typed, by name.
 *
 * Matched case-insensitively, anywhere in the name.
 */
export function materialSuggestions(
    catalogue: MaterialData[],
    selected: ActivityMaterialData[],
    search: string = "",
): MaterialData[] {
    const taken = new Set(selected.map(link => link.material));
    const term = key(search);

    return catalogue
        .filter(material => !taken.has(material.id) && key(material.name).includes(term))
        .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Whether what the user typed is worth adding to the catalogue — not when the catalogue already
 * has it, whatever its case, and not when the activity lists it: the backend would refuse the one,
 * and the other is already there.
 */
export function canCreateMaterial(
    search: string,
    catalogue: MaterialData[],
    selected: ActivityMaterialData[],
): boolean {
    const name = key(search);
    if (!name) return false;

    return !materialNamed(catalogue, name) && !selected.some(link => key(link.name) === name);
}

/** The catalogue material going by a name, whatever its case — the one the backend would refuse to repeat. */
export function materialNamed(catalogue: MaterialData[], name: string): MaterialData | undefined {
    const wanted = key(name);
    return catalogue.find(material => key(material.name) === wanted);
}

/** Comparison key: two spellings of the same material share one. */
function key(name: string | undefined): string {
    return (name ?? "").trim().toLowerCase();
}

// ── Removing one ────────────────────────────────────────────────────────────────────────────

/**
 * The activity once a material is taken off it: off its list, and off every step and workshop
 * that recalled it. The backend drops those links itself when the link is deleted; this is the
 * screen catching up, so a step still holding the id does not send it back on its next save.
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
