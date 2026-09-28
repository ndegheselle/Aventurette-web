import { ActivitiesTagsTypeOptions, type ActivitiesTagsResponse } from "@/backend/schema.g";
import type { Entity } from "@chapelure/core";

/** A wording per locale code — how `activities_tags` stores `name` and `description`. */
export type Translated = Partial<Record<string, string>>;

/**
 * A tag an activity can carry: a domain, an imaginary universe, a safety note or a developmental
 * keyword, told apart by `type` (ADR 0014). Tags are reference data — an activity links them, it
 * never writes them.
 */
export type ActivityTagData = Entity<ActivitiesTagsResponse<Translated, Translated>>;

export const ActivityTagType = ActivitiesTagsTypeOptions;

/**
 * A translated column in `locale`. A tag missing that wording shows another one rather than
 * nothing: the rows are seeded in French first, and an option with no name cannot be picked.
 */
export function translated(value: Translated | null | undefined, locale: string): string {
    if (!value) return "";

    return value[locale] || Object.values(value).find(Boolean) || "";
}

export interface TagGroup<T extends ActivityTagData = ActivityTagData> {
    type: ActivityTagData['type'];
    tags: T[];
}

/**
 * Tags grouped by kind, since they arrive mixed together. Kinds come in the order
 * `ActivityTagType` declares them, and one with no tag is left out; a kind the enum does not
 * know yet still shows, after the others. Inside a kind, tags are sorted by their wording in
 * `locale`.
 */
export function groupTagsByType<T extends ActivityTagData>(tags: T[], locale: string): TagGroup<T>[] {
    const byType = new Map<ActivityTagData['type'], T[]>(
        Object.values(ActivityTagType).map(type => [type, []]),
    );

    for (const tag of tags) {
        const group = byType.get(tag.type);
        if (group) group.push(tag);
        else byType.set(tag.type, [tag]);
    }

    return [...byType]
        .filter(([, group]) => group.length)
        .map(([type, group]) => ({
            type,
            tags: group.sort((a, b) => translated(a.name, locale).localeCompare(translated(b.name, locale), locale)),
        }));
}
