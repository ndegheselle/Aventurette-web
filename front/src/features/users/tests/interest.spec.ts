import { anInterest } from '@tests';
import { describe, expect, it } from 'vitest';
import { selectionOf, withSelection } from '@features/users/model/interest';

const dinosaurs = anInterest({ name: 'Dinosaurs' });
const painting = anInterest({ name: 'Painting' });
const space = anInterest({ name: 'Space' });
const available = [dinosaurs, painting, space];

describe('withSelection', () => {
    it('marks nothing when the child has no interests', () => {
        expect(withSelection(available, []).map(i => i.isSelected)).toEqual([false, false, false]);
    });

    it('treats a missing selection the same as an empty one', () => {
        expect(withSelection(available, undefined).every(i => !i.isSelected)).toBe(true);
    });

    it('marks the ones the child has', () => {
        const marked = withSelection(available, [painting]);

        expect(marked.filter(i => i.isSelected).map(i => i.name)).toEqual(['Painting']);
    });

    it('matches by id, since the two lists come from different requests', () => {
        // Same record, different object — comparing by identity would mark nothing.
        const copy = { ...painting };

        expect(withSelection(available, [copy]).find(i => i.isSelected)?.id).toBe(painting.id);
    });

    it('ignores an interest the child has that is no longer offered', () => {
        const retired = anInterest({ name: 'Retired' });

        expect(withSelection(available, [retired, painting]).filter(i => i.isSelected)).toHaveLength(1);
    });

    it('copies rather than tagging the source records', () => {
        withSelection(available, [painting]);

        expect(painting).not.toHaveProperty('isSelected');
    });

    it('keeps the offered order, not the selection order', () => {
        expect(withSelection(available, [space, dinosaurs]).map(i => i.name))
            .toEqual(['Dinosaurs', 'Painting', 'Space']);
    });
});

describe('selectionOf', () => {
    it('returns the marked interests as plain records', () => {
        const marked = withSelection(available, [painting]);

        expect(selectionOf(marked)).toEqual([painting]);
    });

    it('strips the picker\'s own flag, which is not part of the data saved', () => {
        const marked = withSelection(available, [painting]);

        expect(selectionOf(marked)[0]).not.toHaveProperty('isSelected');
    });

    it('is empty when nothing is marked', () => {
        expect(selectionOf(withSelection(available, []))).toEqual([]);
    });

    it('round-trips a selection', () => {
        expect(selectionOf(withSelection(available, [dinosaurs, space]))).toEqual([dinosaurs, space]);
    });
});
