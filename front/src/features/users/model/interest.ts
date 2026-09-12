import type { InterestsResponse } from "@/backend/schema.g";

export type InterestData = InterestsResponse;

/** An interest as the picker shows it: the record, plus whether this child has it. */
export type SelectableInterest = InterestData & { isSelected: boolean };

/**
 * Mark which of the available interests a child already has.
 *
 * Matching is by id, not by identity: the child's interests come back from a different request
 * than the list of all interests, so they are equal records but never the same objects.
 */
export function withSelection(
    available: InterestData[],
    selected: InterestData[] | undefined,
): SelectableInterest[] {
    const selectedIds = new Set((selected ?? []).map(item => item.id));

    return available.map(item => ({ ...item, isSelected: selectedIds.has(item.id) }));
}

/** The picked interests, as plain records again — `isSelected` is the picker's, not the data's. */
export function selectionOf(list: SelectableInterest[]): InterestData[] {
    return list
        .filter(item => item.isSelected)
        .map(({ isSelected: _isSelected, ...item }) => item);
}
