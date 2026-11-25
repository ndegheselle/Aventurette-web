import example from '@docs/user/import/example/130973697/activity.json';
import { ActivityState } from '@features/activities/models/activity';
import { StepKind } from '@features/activities/models/step';
import { ActivityTagType } from '@features/activities/models/tag';
import {
    draftFromFiche,
    ficheProblems,
    MAX_FILE_SIZE,
    type ActivityFiche,
    type DraftContext,
    type FicheContext,
} from '@features/activities-authoring/models/fiche.import';
import type { References } from '@features/activities-authoring/models/glossary.import';
import { aCatalogueMaterial, anActivity, aSafetyInstruction, aStep, aTag, aTip } from '@tests';
import { describe, expect, it } from 'vitest';

let ids = 0;
const newId = () => `new${++ids}`;

/** A small fiche: one theme, one safety instruction, one material, one resource, two steps. */
function aFiche(overrides: Partial<ActivityFiche> = {}): ActivityFiche {
    const base = structuredClone(example) as ActivityFiche;
    return {
        ...base,
        classification: { format: 'BIG_GAME', practices: [], themes: ['communication'] },
        imaginary: { rule: null, universes: [] },
        safety: ['feu'],
        pedagogy: { goals: [], idealFor: [], development: { physical: [], intellectual: [], affect: [], social: [], moral: [], spiritual: [] } },
        materials: [{ name: 'Lampe frontale', quantity: '1 par adulte' }],
        resources: [{ name: 'Code Morse', file: 'ressources/code-morse.pdf' }],
        steps: [
            { ...base.steps[0]!, materials: ['Lampe frontale'], resources: ['Code Morse'], tips: [] },
            { ...base.steps[5]!, tips: ['bien-conclure'] },
        ],
        toConfirm: [],
        ...overrides,
    };
}

function references(): References {
    return {
        tags: [aTag({ type: ActivityTagType.THEME, slug: 'communication' })],
        safetyInstructions: [aSafetyInstruction({ slug: 'feu' })],
        tips: [aTip({ slug: 'bien-conclure' })],
    };
}

function checkContext(overrides: Partial<FicheContext> = {}): FicheContext {
    return {
        references: references(),
        catalogue: [aCatalogueMaterial({ name: 'Lampe frontale' })],
        files: new Map([['ressources/code-morse.pdf', 1000]]),
        ...overrides,
    };
}

const errorsOf = (fiche: ActivityFiche, context = checkContext()) =>
    ficheProblems(fiche, context).filter(problem => problem.level === 'error');

describe('ficheProblems', () => {
    it('finds nothing to stop a fiche whose identifiers, names and files all exist', () => {
        expect(errorsOf(aFiche())).toEqual([]);
    });

    it('refuses an identifier the catalogue lacks, rather than creating it', () => {
        expect(errorsOf(aFiche({ safety: ['feu', 'photosensibilite'] }))).toEqual([
            { level: 'error', code: 'reference', path: 'safety[1]', value: 'photosensibilite', label: 'activities.fields.safetyInstructions' },
        ]);
    });

    it('looks a tag up in its own kind only', () => {
        const fiche = aFiche({ imaginary: { rule: null, universes: ['communication'] } });

        expect(errorsOf(fiche).map(problem => problem.path)).toEqual(['imaginary.universes[0]']);
    });

    it('refuses a file the folder lacks, and one over the size the collections take', () => {
        const fiche = aFiche({ visual: { brief: '', file: 'couverture.png' } });
        const files = new Map([['ressources/code-morse.pdf', MAX_FILE_SIZE + 1]]);

        expect(errorsOf(fiche, checkContext({ files })).map(problem => problem.code)).toEqual(['missingFile', 'fileSize']);
    });

    it('refuses a step naming a material or resource the fiche does not list, whatever the case', () => {
        const fiche = aFiche();
        fiche.steps[0]!.materials = ['lampe FRONTALE', 'Sifflet'];
        fiche.steps[0]!.resources = ['Cartes-messages'];

        expect(errorsOf(fiche)).toEqual([
            { level: 'error', code: 'unlistedMaterial', path: 'steps[0].materials[1]', value: 'Sifflet' },
            { level: 'error', code: 'unlistedResource', path: 'steps[0].resources[0]', value: 'Cartes-messages' },
        ]);
    });

    it('warns of a new material, a resource no step uses, and a row still « à valider »', () => {
        const fiche = aFiche({
            materials: [{ name: 'Lampe frontale', quantity: '' }, { name: 'Sifflet', quantity: '' }],
            resources: [...aFiche().resources, { name: 'Annexe', file: 'ressources/code-morse.pdf' }],
            toConfirm: ['Effectif recommandé'],
        });

        const warnings = ficheProblems(fiche, checkContext()).filter(problem => problem.level === 'warning');

        expect(warnings).toEqual(expect.arrayContaining([
            { level: 'warning', code: 'newMaterial', value: 'Sifflet' },
            { level: 'warning', code: 'unattachedResource', value: 'Annexe' },
            { level: 'warning', code: 'toConfirm', value: 'Effectif recommandé' },
        ]));
    });
});

describe('draftFromFiche', () => {
    const code = new File(['%PDF'], 'code-morse.pdf', { type: 'application/pdf' });

    function draftContext(overrides: Partial<DraftContext> = {}): DraftContext {
        return {
            references: references(),
            catalogue: [aCatalogueMaterial({ id: 'mat1', name: 'Lampe frontale' })],
            files: new Map([['ressources/code-morse.pdf', code]]),
            newId,
            author: 'usr1',
            original: null,
            ...overrides,
        };
    }

    it('links tags, safety instructions and tips by identifier', () => {
        const { activity } = draftFromFiche(aFiche(), draftContext());

        expect(activity.classification.themes.map(tag => tag.slug)).toEqual(['communication']);
        expect(activity.safety.instructions.map(item => item.slug)).toEqual(['feu']);
        expect(activity.steps[1]!.tips.map(tip => tip.slug)).toEqual(['bien-conclure']);
    });

    it('writes a step\'s actions after its own text, as a numbered list', () => {
        const fiche = aFiche();
        fiche.steps[0] = { ...fiche.steps[0]!, description: '<p>Avant.</p>', actions: ['Tester les lampes', 'A & B'] };

        const { activity } = draftFromFiche(fiche, draftContext());

        expect(activity.steps[0]!.description).toBe('<p>Avant.</p><ol><li>Tester les lampes</li><li>A &amp; B</li></ol>');
    });

    it('lets the title stand in for a step with neither text nor actions: the collection needs one', () => {
        const fiche = aFiche();
        fiche.steps[0] = { ...fiche.steps[0]!, title: 'Préparer', description: '<p></p>', actions: [] };

        expect(draftFromFiche(fiche, draftContext()).activity.steps[0]!.description).toBe('<p>Préparer</p>');
    });

    it('gives a step its resources as files, under the name the fiche gives them', () => {
        const step = draftFromFiche(aFiche(), draftContext()).activity.steps[0]!;

        expect(step.resources.map(resource => [resource.name, resource.file])).toEqual([['Code Morse', code]]);
        expect(step.resources[0]!.step).toBe(step.id);
    });

    it('links a material the catalogue has, and creates one it does not', () => {
        const fiche = aFiche({ materials: [{ name: 'lampe frontale', quantity: '2' }, { name: 'Sifflet', quantity: '' }] });

        const { activity, newMaterials } = draftFromFiche(fiche, draftContext());

        expect(activity.materials.map(link => [link.material, link.quantity])).toEqual([['mat1', '2'], [newMaterials[0]!.id, '']]);
        expect(newMaterials.map(material => material.name)).toEqual(['Sifflet']);
    });

    it('replaces what an earlier import made, under the same activity, author and state', () => {
        const original = anActivity({
            id: 'act1',
            user: 'usr0',
            state: ActivityState.PUBLISHED,
            visual: 'cover.png' as never,
            steps: [aStep({ id: 'old-step', kind: StepKind.CUSTOM })],
        });

        const { activity, visual } = draftFromFiche(aFiche(), draftContext({ original }));

        expect(activity).toMatchObject({ id: 'act1', user: 'usr0', state: ActivityState.PUBLISHED, visual: 'cover.png', sourceId: '130973697' });
        expect(activity.steps.map(step => step.id)).not.toContain('old-step');
        expect(activity.steps.every(step => step.activity === 'act1')).toBe(true);
        expect(visual).toBeUndefined();
    });

    it('starts a new fiche as a draft by the one importing it', () => {
        const { activity } = draftFromFiche(aFiche(), draftContext());

        expect(activity).toMatchObject({ user: 'usr1', state: ActivityState.DRAFT });
    });
});
