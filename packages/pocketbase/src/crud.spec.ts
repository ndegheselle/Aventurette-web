import {
    createFilter,
    createGroup,
    PaginationOptions,
    SortDirection,
    ValidationError,
    type BaseEntity,
} from '@chapelure/core';
import { describe, expect, it } from 'vitest';
import { createPocketBaseCrud } from './crud';
import { fakePocketBase } from './testing';

type Step = BaseEntity & { description: string };
type Activity = BaseEntity & { name: string; steps: Step[] };

describe('createPocketBaseCrud', () => {
    it('asks for the relations it was configured with', async () => {
        const pb = fakePocketBase();
        const crud = createPocketBaseCrud<Activity>(pb.client, 'activities', ['steps', 'steps.materials']);

        await crud.getAll();

        expect(pb.lastCall('getFullList')?.[0]).toEqual({ expand: 'steps,steps.materials' });
    });

    it('inlines expanded relations on the way out', async () => {
        const pb = fakePocketBase([
            { id: 'act1', name: 'Hunt', steps: ['stp1'], expand: { steps: [{ id: 'stp1', description: 'Hide' }] } },
        ]);
        const crud = createPocketBaseCrud<Activity>(pb.client, 'activities', ['steps']);

        const activity = await crud.getById('act1');

        expect(activity?.steps).toEqual([{ id: 'stp1', description: 'Hide' }]);
        expect(activity).not.toHaveProperty('expand');
    });

    it('writes relations as ids, whatever the caller passed', async () => {
        const pb = fakePocketBase();
        const crud = createPocketBaseCrud<Activity>(pb.client, 'activities', ['steps']);

        await crud.create({ id: '', name: 'Hunt', steps: [{ id: 'stp1', description: 'Hide' }] });

        expect(pb.lastCall('create')?.[0]).toMatchObject({ steps: ['stp1'] });
    });

    it('reports the server total, not the size of the page', async () => {
        const pb = fakePocketBase(Array.from({ length: 12 }, (_, i) => ({ id: `act${i}` })));
        const crud = createPocketBaseCrud<Activity>(pb.client, 'activities');

        const paginated = await crud.getList(new PaginationOptions(1, 5));

        expect(paginated.items).toHaveLength(5);
        expect(paginated.total).toBe(12);
    });

    it('renders sort as the direction glued to the field', async () => {
        const pb = fakePocketBase();
        const crud = createPocketBaseCrud<Activity>(pb.client, 'activities');

        await crud.getList(new PaginationOptions(1, 5, 'name', SortDirection.DESC));

        expect(pb.lastCall('getList')?.[2]).toMatchObject({ sort: '-name' });
    });

    it('sends no sort when none was asked for', async () => {
        const pb = fakePocketBase();
        const crud = createPocketBaseCrud<Activity>(pb.client, 'activities');

        await crud.getList(new PaginationOptions(1, 5));

        expect(pb.lastCall('getList')?.[2]).toMatchObject({ sort: undefined });
    });

    it('compiles a filter group into the query language', async () => {
        const pb = fakePocketBase();
        const crud = createPocketBaseCrud<Activity>(pb.client, 'activities');

        await crud.filter(
            createGroup<Activity>({ filters: [createFilter<Activity>({ key: 'name', value: 'hunt' })] }),
            new PaginationOptions(1, 5),
        );

        expect(pb.lastCall('getList')?.[2]).toMatchObject({ filter: "name~'hunt'" });
    });

    it('sends no filter at all for an empty group, rather than an empty expression', async () => {
        const pb = fakePocketBase();
        const crud = createPocketBaseCrud<Activity>(pb.client, 'activities');

        await crud.filter(createGroup<Activity>({}), new PaginationOptions(1, 5));

        expect(pb.lastCall('getList')?.[2]).toMatchObject({ filter: undefined });
    });

    it('normalises a rejected write into a ValidationError', async () => {
        const pb = fakePocketBase();
        pb.failNextWith({ status: 400, message: 'Failed', response: { data: { name: { code: 'validation_required' } } } });
        const crud = createPocketBaseCrud<Activity>(pb.client, 'activities');

        await expect(crud.create({ id: '', name: '', steps: [] })).rejects.toBeInstanceOf(ValidationError);
    });
});
