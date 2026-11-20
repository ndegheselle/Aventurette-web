import { CatalogTagsTypeOptions, type CatalogTagsResponse } from "@/backend/schema.g";
import type { Entity } from "@chapelure/core";

/**
 * A tag an activity can carry: a theme, an imaginary universe, a pedagogical goal, a use it is
 * ideal for or a developmental keyword, told apart by `type` (ADR 0014). Tags are reference
 * data — an activity links them, it never writes them.
 */
export type ActivityTagData = Entity<CatalogTagsResponse>;

export const ActivityTagType = CatalogTagsTypeOptions;
export type ActivityTagType = ActivityTagData['type'];

/**
 * Every tag, as the options of each kind's picker: grouped by `type`, and sorted by name inside
 * a kind. A kind with no tag is an empty list rather than missing, so a picker can always read
 * its own.
 */
export function tagOptions<T extends ActivityTagData>(tags: T[]): Record<ActivityTagType, T[]> {
    const byType = Object.fromEntries(
        Object.values(ActivityTagType).map(type => [type, [] as T[]]),
    ) as Record<ActivityTagType, T[]>;

    // A kind the backend has gained since is grouped too, rather than dropped.
    for (const tag of tags) {
        const group = byType[tag.type] ?? [];
        group.push(tag);
        byType[tag.type] = group;
    }

    for (const group of Object.values(byType))
        group.sort((a, b) => a.name.localeCompare(b.name));

    return byType;
}
