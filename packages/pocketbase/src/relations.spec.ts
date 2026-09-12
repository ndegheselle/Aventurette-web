import { describe, expect, it } from 'vitest';
import { inlineRelations, relationFields, relationsToIds } from './relations';

describe('inlineRelations', () => {
    it('replaces an id list with the records themselves and drops `expand`', () => {
        const record = inlineRelations<any>({
            id: 'act1',
            name: 'Treasure hunt',
            steps: ['stp1'],
            expand: { steps: [{ id: 'stp1', description: 'Hide' }] },
        });

        expect(record).toEqual({
            id: 'act1',
            name: 'Treasure hunt',
            steps: [{ id: 'stp1', description: 'Hide' }],
        });
        expect(record).not.toHaveProperty('expand');
    });

    it('inlines a to-one relation as the record, not an array', () => {
        expect(inlineRelations<any>({ id: 'chd1', user: 'usr1', expand: { user: { id: 'usr1' } } }))
            .toEqual({ id: 'chd1', user: { id: 'usr1' } });
    });

    it('recurses, so steps.materials arrives inlined on each step', () => {
        const record = inlineRelations<any>({
            id: 'act1',
            steps: ['stp1'],
            expand: {
                steps: [{
                    id: 'stp1',
                    materials: ['mat1'],
                    expand: { materials: [{ id: 'mat1', name: 'Rope' }] },
                }],
            },
        });

        expect(record.steps[0].materials).toEqual([{ id: 'mat1', name: 'Rope' }]);
        expect(record.steps[0]).not.toHaveProperty('expand');
    });

    it('leaves ids in place for a relation that was never expanded', () => {
        expect(inlineRelations<any>({ id: 'act1', steps: ['stp1'], benefits: ['bnf1'], expand: {} }))
            .toEqual({ id: 'act1', steps: ['stp1'], benefits: ['bnf1'] });
    });

    it('leaves ids in place when a to-many relation matched nothing', () => {
        // PocketBase omits an empty relation from `expand` rather than sending back []. The
        // field therefore still holds whatever ids the record itself carries — for an empty
        // relation, none.
        expect(inlineRelations<any>({ id: 'act1', steps: [] })).toEqual({ id: 'act1', steps: [] });
    });

    it('passes non-objects straight through', () => {
        expect(inlineRelations<any>(null)).toBeNull();
        expect(inlineRelations<any>('stp1')).toBe('stp1');
    });
});

describe('relationsToIds', () => {
    it('turns records back into ids for the fields it is given', () => {
        expect(relationsToIds(
            { id: 'act1', steps: [{ id: 'stp1' }, { id: 'stp2' }], name: 'Hunt' },
            ['steps'],
        )).toEqual({ id: 'act1', steps: ['stp1', 'stp2'], name: 'Hunt' });
    });

    it('handles a to-one relation', () => {
        expect(relationsToIds({ id: 'chd1', user: { id: 'usr1' } }, ['user']))
            .toEqual({ id: 'chd1', user: 'usr1' });
    });

    it('leaves values that are already ids untouched', () => {
        expect(relationsToIds({ id: 'act1', steps: ['stp1'] }, ['steps']))
            .toEqual({ id: 'act1', steps: ['stp1'] });
    });

    it('ignores a relation the update does not mention', () => {
        expect(relationsToIds({ id: 'act1', name: 'Hunt' }, ['steps']))
            .toEqual({ id: 'act1', name: 'Hunt' });
    });

    it('does not mutate its argument', () => {
        const data = { id: 'act1', steps: [{ id: 'stp1' }] };
        relationsToIds(data, ['steps']);
        expect(data.steps[0]).toEqual({ id: 'stp1' });
    });
});

describe('relationFields', () => {
    it('keeps only the top level of an expand path, deduplicated', () => {
        expect(relationFields(['benefits', 'steps', 'steps.materials', 'steps.resources']))
            .toEqual(['benefits', 'steps']);
    });

    it('is empty when nothing was requested', () => {
        expect(relationFields(undefined)).toEqual([]);
        expect(relationFields([])).toEqual([]);
    });
});
