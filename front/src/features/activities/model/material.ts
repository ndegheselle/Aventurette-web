import type { StepsMaterialsResponse } from "@/backend/schema.g";

/** A material belongs to the step that needs it: `step` is what owns this record. */
export type ActivityMaterialData = StepsMaterialsResponse;

/**
 * The names to offer for a step's materials.
 *
 * A material belongs to one step, so the same rope is a row per step and there is no catalogue
 * to pick from. What is worth offering is the distinct *names* already used anywhere, minus the
 * ones this step has, narrowed by what the user typed — picking one writes a new row rather
 * than linking someone else's.
 *
 * Names are matched case-insensitively, and the first spelling seen is the one offered.
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
 * Whether what the user typed is worth offering to create.
 *
 * Not when the step already has that material, and not when it is one of the suggestions —
 * picking that one creates the same row.
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

/** What two spellings of the same material have in common. */
function key(name: string | undefined): string {
    return (name ?? "").trim().toLowerCase();
}
