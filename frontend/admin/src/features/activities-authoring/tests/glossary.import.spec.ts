import { ActivityTagType } from '@features/activities/models/tag';
import {
    planGlossary,
    referencesAfter,
    type GlossaryFile,
    type References,
} from '@features/activities-authoring/models/glossary.import';
import { aSafetyInstruction, aTag, aTip } from '@tests';
import { describe, expect, it } from 'vitest';

let ids = 0;
const newId = () => `new${++ids}`;

function aGlossary(overrides: Partial<GlossaryFile> = {}): GlossaryFile {
    return { schema: 'aventurette.glossary.v1', tags: [], tips: [], safety: [], ...overrides };
}

function known(overrides: Partial<References> = {}): References {
    return { tags: [], tips: [], safetyInstructions: [], ...overrides };
}

describe('planGlossary', () => {
    it('creates what the catalogue lacks, under the identifier as slug', () => {
        const plan = planGlossary(aGlossary({
            tags: [{ kind: ActivityTagType.GOAL, id: 'ecoute', name: 'Écoute' }],
            tips: [{ id: 'bien-conclure', name: 'Bien conclure', description: '<ul><li>Féliciter</li></ul>' }],
        }), known(), newId);

        expect(plan.tags.create).toEqual([expect.objectContaining({ type: ActivityTagType.GOAL, slug: 'ecoute', name: 'Écoute' })]);
        expect(plan.tips.create).toEqual([expect.objectContaining({ slug: 'bien-conclure', description: '<ul><li>Féliciter</li></ul>' })]);
    });

    it('finds a tag by its kind and identifier: the same slug in another kind is another entry', () => {
        const plan = planGlossary(aGlossary({
            tags: [{ kind: ActivityTagType.IMAGINARY, id: 'animaux', name: 'Animaux' }],
        }), known({ tags: [aTag({ type: ActivityTagType.THEME, slug: 'animaux', name: 'Animaux' })] }), newId);

        expect(plan.tags.create).toHaveLength(1);
    });

    it('renames a known entry and changes its description, and leaves one that says the same alone', () => {
        const feu = aSafetyInstruction({ id: 'sfi1', slug: 'feu', name: 'Feu', description: '<p>Old.</p>' });
        const eau = aSafetyInstruction({ id: 'sfi2', slug: 'eau', name: 'Eau', description: '<p>Same.</p>' });

        const plan = planGlossary(aGlossary({
            safety: [
                { id: 'feu', name: 'Feu de camp', description: '<p>New.</p>' },
                { id: 'eau', name: 'Eau', description: '<p>Same.</p>' },
            ],
        }), known({ safetyInstructions: [feu, eau] }), newId);

        expect(plan.safety.update).toEqual([{ ...feu, name: 'Feu de camp', description: '<p>New.</p>' }]);
        expect(plan.safety.create).toEqual([]);
    });

    it('reports an identifier given twice, and plans it once', () => {
        const tip = { id: 'annoncer-fin', name: 'Annoncer la fin', description: '' };

        const plan = planGlossary(aGlossary({ tips: [tip, tip] }), known(), newId);

        expect(plan.duplicates).toEqual(['tip:annoncer-fin']);
        expect(plan.tips.create).toHaveLength(1);
    });
});

describe('referencesAfter', () => {
    it('holds what the glossary creates and changes, and keeps what it leaves out', () => {
        const kept = aTip({ id: 'tip1', slug: 'quand-arreter', name: 'Quand arrêter' });
        const renamed = aTip({ id: 'tip2', slug: 'bien-conclure', name: 'Conclure' });

        const plan = planGlossary(aGlossary({
            tips: [
                { id: 'bien-conclure', name: 'Bien conclure', description: renamed.description },
                { id: 'annoncer-fin', name: 'Annoncer la fin', description: '' },
            ],
        }), known({ tips: [kept, renamed] }), newId);

        expect(referencesAfter(known({ tips: [kept, renamed] }), plan).tips.map(tip => tip.name))
            .toEqual(['Quand arrêter', 'Bien conclure', 'Annoncer la fin']);
    });
});
