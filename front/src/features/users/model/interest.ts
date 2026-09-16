import type { InterestsResponse } from "@/backend/schema.g";
import type { Entity, EntityMapper } from "@chapelure/core";

export type InterestPayload = InterestsResponse;

export type InterestData = Entity<InterestPayload>;

export const interestMapper: EntityMapper<InterestPayload, InterestData> = {
    relations: [],
    toEntity: ({ expand: _expand, ...interest }) => interest,
    toPayload: (interest) => interest,
};

/** An interest as the picker shows it: the record, plus whether this child has it. */
export type SelectableInterest = InterestData & { isSelected: boolean };

/**
 * Mark which of the available interests a child already has. Matched by id: the two lists come
 * from different requests, so they are equal records but never the same objects.
 */
export function withSelection(
    available: InterestData[],
    selected: InterestData[] | undefined,
): SelectableInterest[] {
    const selectedIds = new Set((selected ?? []).map(item => item.id));

    return available.map(item => ({ ...item, isSelected: selectedIds.has(item.id) }));
}

/** The picked interests, back as plain records — `isSelected` is the picker's, not the data's. */
export function selectionOf(list: SelectableInterest[]): InterestData[] {
    return list
        .filter(item => item.isSelected)
        .map(({ isSelected: _isSelected, ...item }) => item);
}
