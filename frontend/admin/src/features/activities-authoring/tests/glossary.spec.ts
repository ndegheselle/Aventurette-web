import { ActivityTagType } from '@features/activities/models/tag';
import { planGlossary, type GlossaryEntry } from '@features/activities-authoring/models/glossary';
import { aSafetyInstruction, aTag, aTip } from '@tests';
import { describe, expect, it } from 'vitest';

// A glossary is loaded once: it completes what the catalogues already hold and creates the rest,
// so that the imports after it link a fiche's wording instead of creating near duplicates.

const nothingKnown = { tags: [], safetyInstructions: [], tips: [] };

function entry(overrides: Partial<GlossaryEntry>): GlossaryEntry {
    return { kind: ActivityTagType.GOAL, name: 'Coopération', aliases: [], description: '', ...overrides };
}

describe('planGlossary', () => {
    it('creates what the catalogue lacks, with its aliases', () => {
        const plan = planGlossary([entry({ aliases: ['coopérer', 'entraide'] })], nothingKnown);

        expect(plan.create).toEqual([entry({ aliases: ['coopérer', 'entraide'] })]);
        expect(plan.update).toEqual([]);
    });

    it('completes an entry found by its name or by an alias, without renaming it', () => {
        // A first import created « coopérer »: the glossary's name becomes one of its aliases.
        const imported = aTag({ id: 'tag-1', type: ActivityTagType.GOAL, name: 'coopérer', slug: 'cooperer', aliases: '' });

        const plan = planGlossary([entry({ aliases: ['Coopérer', 'Entraide'] })], { ...nothingKnown, tags: [imported] });

        expect(plan.create).toEqual([]);
        expect(plan.update).toEqual([
            { kind: ActivityTagType.GOAL, id: 'tag-1', name: 'coopérer', aliases: 'Coopération; Entraide' },
        ]);
    });

    it('changes nothing for an entry the catalogue already has as the glossary does', () => {
        const known = aTag({ type: ActivityTagType.GOAL, name: 'Coopération', slug: 'cooperation', aliases: 'entraide' });

        const plan = planGlossary([entry({ aliases: ['Entraide'] })], { ...nothingKnown, tags: [known] });

        expect(plan.unchanged).toEqual(['Coopération']);
        expect(plan.update).toEqual([]);
    });

    it('leaves out an alias another entry of that kind answers to, and reports it', () => {
        // Found by its own name, the entry cannot also take the name of another one.
        const cooperation = aTag({ id: 'tag-1', type: ActivityTagType.GOAL, name: 'Coopération', slug: 'cooperation', aliases: '' });
        const listening = aTag({ type: ActivityTagType.GOAL, name: 'Écoute', slug: 'ecoute' });

        const plan = planGlossary([entry({ aliases: ['écoute', 'entraide'] })], { ...nothingKnown, tags: [cooperation, listening] });

        expect(plan.update).toEqual([{ kind: ActivityTagType.GOAL, id: 'tag-1', name: 'Coopération', aliases: 'entraide' }]);
        expect(plan.conflicts).toEqual([{ kind: ActivityTagType.GOAL, name: 'Coopération', alias: 'écoute', other: 'Écoute' }]);
    });

    it('fills the description of a safety instruction or a tip that has none, and only then', () => {
        const bare = aSafetyInstruction({ id: 'saf-1', name: 'Photosensibilité', slug: 'photosensibilite', description: '' });
        const written = aTip({ id: 'tip-1', name: 'Lettre par lettre', description: '<p>Déjà écrit.</p>' });

        const plan = planGlossary([
            entry({ kind: 'SAFETY', name: 'Photosensibilité', description: '<p>1 éclair par seconde.</p>' }),
            entry({ kind: 'TIP', name: 'Lettre par lettre', description: '<p>Autre texte.</p>' }),
        ], { ...nothingKnown, safetyInstructions: [bare], tips: [written] });

        expect(plan.update).toEqual([
            { kind: 'SAFETY', id: 'saf-1', name: 'Photosensibilité', aliases: '', description: '<p>1 éclair par seconde.</p>' },
        ]);
        expect(plan.unchanged).toEqual(['Lettre par lettre']);
    });

    it('reads an entry given twice as one, its aliases together', () => {
        const plan = planGlossary([entry({ aliases: ['entraide'] }), entry({ name: 'coopération', aliases: ['coopérer'] })], nothingKnown);

        expect(plan.create).toEqual([entry({ aliases: ['entraide', 'coopérer'] })]);
    });
});
