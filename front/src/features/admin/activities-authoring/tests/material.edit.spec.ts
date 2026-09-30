import {
    canCreateMaterial,
    materialNamed,
    materialSuggestions,
    withoutMaterial,
} from '@features/admin/activities-authoring/model/material.edit';
import { aCatalogueMaterial, aMaterial, aStep, aWorkshop, anActivity } from '@tests';
import { describe, expect, it } from 'vitest';

const rope = aCatalogueMaterial({ id: 'mat1', name: 'Rope' });
const chalk = aCatalogueMaterial({ id: 'mat2', name: 'Chalk' });
const ball = aCatalogueMaterial({ id: 'mat3', name: 'Ball' });

describe('materialSuggestions', () => {
    it('offers the catalogue by name', () => {
        expect(materialSuggestions([rope, chalk, ball], []).map(m => m.name)).toEqual(['Ball', 'Chalk', 'Rope']);
    });

    it('leaves out what the activity already links, told by the catalogue id', () => {
        const linked = aMaterial({ material: 'mat1', name: 'Rope' });

        expect(materialSuggestions([rope, chalk], [linked])).toEqual([chalk]);
    });

    it('narrows by what was typed, whatever its case, anywhere in the name', () => {
        expect(materialSuggestions([rope, chalk, ball], [], 'AL')).toEqual([ball, chalk]);
    });
});

describe('canCreateMaterial', () => {
    it('offers to add a name the catalogue does not have', () => {
        expect(canCreateMaterial('Hoop', [rope], [])).toBe(true);
    });

    it('does not for a name the catalogue has, whatever its case — the backend would refuse it', () => {
        expect(canCreateMaterial(' rope ', [rope], [])).toBe(false);
    });

    it('does not for a name the activity lists, though the catalogue read missed it', () => {
        expect(canCreateMaterial('Hoop', [rope], [aMaterial({ name: 'Hoop' })])).toBe(false);
    });

    it('does not, for whitespace', () => {
        expect(canCreateMaterial('   ', [], [])).toBe(false);
    });
});

describe('materialNamed', () => {
    it('finds the catalogue material whatever the case and the spaces around it', () => {
        expect(materialNamed([rope, chalk], '  CHALK ')).toBe(chalk);
    });

    it('finds none for a name the catalogue does not have', () => {
        expect(materialNamed([rope], 'Chalk')).toBeUndefined();
    });
});

describe('withoutMaterial', () => {
    it('takes a removed material off the activity and off every step and workshop recalling it', () => {
        // The backend drops the links itself; a step still holding the id would send it back on
        // its next save.
        const needsRope = aMaterial({ id: 'amt1' });
        const needsChalk = aMaterial({ id: 'amt2' });
        const activity = anActivity({
            materials: [needsRope, needsChalk],
            steps: [aStep({ materials: [{ ...needsRope }, { ...needsChalk }] })],
            workshops: [aWorkshop({ materials: [{ ...needsRope }] })],
        });

        const after = withoutMaterial(activity, 'amt1');

        expect(after.materials).toEqual([needsChalk]);
        expect(after.steps[0]!.materials.map(material => material.id)).toEqual(['amt2']);
        expect(after.workshops[0]!.materials).toEqual([]);
    });
});
