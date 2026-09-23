import {
    createFilter,
    createGroup,
    SortDirection,
    ValidationError,
    type BaseEntity,
    type EntityMapper,
} from '@chapelure/core';
import { describe, expect, it } from 'vitest';
import { createPocketBaseCrud } from './crud';
import { fakePocketBase, passthroughMapper } from './testing';

type ActivityPayload = BaseEntity & { name: string; steps?: string[]; cover?: string };
type Activity = BaseEntity & { title: string; cover: string };

/** A mapper that renames a field and resolves a file, so a spec can tell which side it is on. */
const activityMapper: EntityMapper<ActivityPayload, Activity> = {
    relations: ['steps', 'steps.materials'],
    toEntity: ({ id, name, cover }, files) => ({
        id,
        title: name,
        cover: cover ? files.getUrl({ id }, cover) : '',
    }),
    toPayload: ({ title }) => ({ name: title }),
};

describe('createPocketBaseCrud', () => {
    it('expands the relations the mapper declares', async () => {
        const pb = fakePocketBase();
        const crud = createPocketBaseCrud(pb.client, 'activities', activityMapper);

        await crud.getAll();

        expect(pb.lastCall('getFullList')?.[0]).toEqual({ expand: 'steps,steps.materials' });
    });

    it('asks for no expand when the mapper needs no relation', async () => {
        const pb = fakePocketBase();
        const crud = createPocketBaseCrud(pb.client, 'activities', passthroughMapper<BaseEntity>());

        await crud.getAll();

        expect(pb.lastCall('getFullList')?.[0]).toEqual({ expand: undefined });
    });

    it('hands every record to the mapper, and a file resolver with it', async () => {
        const pb = fakePocketBase([{ id: 'act1', name: 'Hunt', cover: 'map.png' }]);
        const crud = createPocketBaseCrud(pb.client, 'activities', activityMapper);

        expect(await crud.getById('act1')).toEqual({
            id: 'act1',
            title: 'Hunt',
            cover: 'https://pb.test/api/files/act1/map.png',
        });
    });

    it('sends what the mapper produced, not what the caller held', async () => {
        const pb = fakePocketBase();
        const crud = createPocketBaseCrud(pb.client, 'activities', activityMapper);

        await crud.create({ id: '', title: 'Hunt', cover: '' });

        expect(pb.lastCall('create')?.[0]).toEqual({ name: 'Hunt' });
    });

    it('reports the server total, not the size of the page', async () => {
        const pb = fakePocketBase(Array.from({ length: 12 }, (_, i) => ({ id: `act${i}` })));
        const crud = createPocketBaseCrud(pb.client, 'activities', passthroughMapper<BaseEntity>());

        const paginated = await crud.getList({ page: 1, perPage: 5 });

        expect(paginated.items).toHaveLength(5);
        expect(paginated.total).toBe(12);
    });

    it('renders sort as the direction glued to the field', async () => {
        const pb = fakePocketBase();
        const crud = createPocketBaseCrud(pb.client, 'activities', passthroughMapper<BaseEntity>());

        await crud.getList({ page: 1, perPage: 5, sortBy: 'name', sortDirection: SortDirection.DESC });

        expect(pb.lastCall('getList')?.[2]).toMatchObject({ sort: '-name' });
    });

    it('sends no sort when none was asked for', async () => {
        const pb = fakePocketBase();
        const crud = createPocketBaseCrud(pb.client, 'activities', passthroughMapper<BaseEntity>());

        await crud.getList({ page: 1, perPage: 5 });

        expect(pb.lastCall('getList')?.[2]).toMatchObject({ sort: undefined });
    });

    it('compiles a filter group into the query language', async () => {
        const pb = fakePocketBase();
        const crud = createPocketBaseCrud(pb.client, 'activities', passthroughMapper<BaseEntity>());

        await crud.filter(
            createGroup<BaseEntity>({ filters: [createFilter<BaseEntity>({ key: 'id', value: 'act1' })] }),
            { page: 1, perPage: 5 },
        );

        expect(pb.lastCall('getList')?.[2]).toMatchObject({ filter: "id~'act1'" });
    });

    it('sends no filter at all for an empty group, rather than an empty expression', async () => {
        const pb = fakePocketBase();
        const crud = createPocketBaseCrud(pb.client, 'activities', passthroughMapper<BaseEntity>());

        await crud.filter(createGroup<BaseEntity>({}), { page: 1, perPage: 5 });

        expect(pb.lastCall('getList')?.[2]).toMatchObject({ filter: undefined });
    });

    it('normalises a rejected write into a ValidationError', async () => {
        const pb = fakePocketBase();
        pb.failNextWith({ status: 400, message: 'Failed', response: { data: { name: { code: 'validation_required' } } } });
        const crud = createPocketBaseCrud(pb.client, 'activities', activityMapper);

        await expect(crud.create({ id: '', title: '', cover: '' })).rejects.toBeInstanceOf(ValidationError);
    });
});
