import { PaginationOptions, SortDirection, type BaseEntity } from '@chapelure/core';
import { describe, expect, it } from 'vitest';
import { createPocketBaseCached } from './cached';
import { fakePocketBase } from './testing';

type Benefit = BaseEntity & { name: string };

const someBenefits = () => [
    { id: 'bnf1', name: 'Coordination' },
    { id: 'bnf2', name: 'Attention' },
    { id: 'bnf3', name: 'Balance' },
];

function countOf(pb: ReturnType<typeof fakePocketBase>, method: string) {
    return pb.calls.filter(c => c.method === method).length;
}

describe('createPocketBaseCached', () => {
    it('fetches the collection once and serves later reads from memory', async () => {
        const pb = fakePocketBase(someBenefits());
        const cached = createPocketBaseCached<Benefit>(pb.client, 'benefits');

        await cached.getAll();
        await cached.getAll();
        await cached.getById('bnf1');

        expect(countOf(pb, 'getFullList')).toBe(1);
    });

    it('collapses concurrent first reads into one request', async () => {
        // Several components mounting at once is the normal case for a reference collection —
        // each awaiting the same in-flight promise is the whole point of this service.
        const pb = fakePocketBase(someBenefits());
        const cached = createPocketBaseCached<Benefit>(pb.client, 'benefits');

        await Promise.all([cached.getAll(), cached.getAll(), cached.getById('bnf2')]);

        expect(countOf(pb, 'getFullList')).toBe(1);
    });

    it('answers getById from the cache, and with null for an id it does not hold', async () => {
        const pb = fakePocketBase(someBenefits());
        const cached = createPocketBaseCached<Benefit>(pb.client, 'benefits');

        expect(await cached.getById('bnf2')).toEqual({ id: 'bnf2', name: 'Attention' });
        expect(await cached.getById('nope')).toBeNull();
        expect(countOf(pb, 'getOne')).toBe(0);
    });

    it('pages and sorts in memory', async () => {
        const pb = fakePocketBase(someBenefits());
        const cached = createPocketBaseCached<Benefit>(pb.client, 'benefits');

        const page = await cached.getList(new PaginationOptions(2, 2, 'name', SortDirection.ASC));

        expect(page.items.map(b => b.name)).toEqual(['Coordination']);
        expect(page.total).toBe(3);
    });

    it('sorts descending when asked', async () => {
        const pb = fakePocketBase(someBenefits());
        const cached = createPocketBaseCached<Benefit>(pb.client, 'benefits');

        const page = await cached.getList(new PaginationOptions(1, 3, 'name', SortDirection.DESC));

        expect(page.items.map(b => b.name)).toEqual(['Coordination', 'Balance', 'Attention']);
    });

    it('reflects a create in the cache without refetching', async () => {
        const pb = fakePocketBase(someBenefits());
        const cached = createPocketBaseCached<Benefit>(pb.client, 'benefits');
        await cached.getAll();

        const created = await cached.create({ id: '', name: 'Patience' });

        expect(await cached.getById(created.id)).toEqual(created);
        expect(countOf(pb, 'getFullList')).toBe(1);
    });

    it('reflects an update in the cache', async () => {
        const pb = fakePocketBase(someBenefits());
        const cached = createPocketBaseCached<Benefit>(pb.client, 'benefits');
        await cached.getAll();

        await cached.update('bnf1', { name: 'Coordination fine' });

        expect((await cached.getById('bnf1'))?.name).toBe('Coordination fine');
    });

    it('reflects a delete in the cache', async () => {
        const pb = fakePocketBase(someBenefits());
        const cached = createPocketBaseCached<Benefit>(pb.client, 'benefits');
        await cached.getAll();

        await cached.remove('bnf1');

        expect(await cached.getById('bnf1')).toBeNull();
        expect(await cached.getAll()).toHaveLength(2);
    });

    it('always goes to the server for filter', async () => {
        const pb = fakePocketBase(someBenefits());
        const cached = createPocketBaseCached<Benefit>(pb.client, 'benefits');
        await cached.getAll();

        await cached.filter({ filters: [], combine: 'and' } as any, new PaginationOptions(1, 5));

        expect(countOf(pb, 'getList')).toBe(1);
    });

    it('refetches after invalidate', async () => {
        const pb = fakePocketBase(someBenefits());
        const cached = createPocketBaseCached<Benefit>(pb.client, 'benefits');
        await cached.getAll();

        cached.invalidate();
        await cached.getAll();

        expect(countOf(pb, 'getFullList')).toBe(2);
    });
});
