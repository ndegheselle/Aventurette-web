import type { MaterialData } from '@features/activities/model/material';
import { useMaterialsEditList } from '@features/materials-authoring/composables/useMaterialsEditList';
import { aCatalogueMaterial, fakeCrud, withSetup } from '@tests';
import { flushPromises } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// A rename is written as its field is left, so a refused one has to put the field back: nothing
// else would, and the list would go on showing a name the catalogue does not hold.

const materials = fakeCrud<MaterialData>();
vi.mock('@features/materials-authoring/api/materials.api', () => ({
    get materialsApi() { return materials; },
}));

async function setup() {
    const [subject] = withSetup(() => useMaterialsEditList());
    await flushPromises();
    return subject;
}

beforeEach(() => {
    vi.restoreAllMocks();
    materials.items = [aCatalogueMaterial({ id: 'mat-1', name: 'Rope' })];
});

describe('renameMaterial', () => {
    it('writes the new name', async () => {
        const subject = await setup();
        const [rope] = subject.paginated.value.items;

        rope!.name = '  Long rope ';
        await subject.renameMaterial(rope!);

        expect(materials.items[0]!.name).toBe('Long rope');
        expect(rope!.name).toBe('Long rope');
    });

    it('puts the saved name back when the backend refuses the new one', async () => {
        const subject = await setup();
        const [rope] = subject.paginated.value.items;
        materials.failNextWith({ name: { code: 'validation_not_unique' } });

        rope!.name = 'Chalk';
        await subject.renameMaterial(rope!);

        expect(rope!.name).toBe('Rope');
    });

    it('goes back to the last name saved, not the one first read', async () => {
        const subject = await setup();
        const [rope] = subject.paginated.value.items;

        rope!.name = 'Long rope';
        await subject.renameMaterial(rope!);
        materials.failNextWith({ name: { code: 'validation_not_unique' } });
        rope!.name = 'Chalk';
        await subject.renameMaterial(rope!);

        expect(rope!.name).toBe('Long rope');
    });

    it('writes nothing for a blank field, and shows the saved name again', async () => {
        const subject = await setup();
        const [rope] = subject.paginated.value.items;
        const write = vi.spyOn(materials, 'update');

        rope!.name = '   ';
        await subject.renameMaterial(rope!);

        expect(write).not.toHaveBeenCalled();
        expect(rope!.name).toBe('Rope');
    });
});
