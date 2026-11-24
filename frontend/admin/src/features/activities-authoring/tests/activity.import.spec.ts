import {
    ActivityFormat,
    ActivityLocation,
    ActivityPractice,
    ActivitySeason,
    ChildrenPace,
    DEVELOPMENT_AXES,
    HostEffort,
    ImaginaryRule,
    SUMMARY_MAX_LENGTH,
} from '@features/activities/models/activity';
import { StepEndCriterion, StepKind } from '@features/activities/models/step';
import { ActivityTagType } from '@features/activities/models/tag';
import {
    activityFromSheet,
    draftFromSheet,
    materialsOfSheet,
    readActivitySheet,
    resourcesOfSheet,
    SHEET_VERSION,
    stepFromSheet,
    unsetFields,
    type ActivitySheet,
} from '@features/activities-authoring/models/activity.import';
import { MAX_STEP_RESOURCES } from '@features/activities-authoring/models/step.edit';
import { aCatalogueMaterial, aMaterial, anActivity, aResource, aSafetyInstruction, aTag, aTip } from '@tests';
import { describe, expect, it } from 'vitest';
import schema from '@features/activities-authoring/mcp/activity-sheet.schema.json?raw';
import example from '@features/activities-authoring/tests/activity-sheet.example.json?raw';

// A sheet is written by an assistant from a fiche, outside the app: reading it is the one place that
// says what an imported activity may hold. Then the names in it become links.

const nothingKnown = { tags: [], safetyInstructions: [], tips: [] };

function sheetOf(json: object): ActivitySheet {
    const reading = readActivitySheet(JSON.stringify(json));
    if (!reading.sheet) throw new Error(`unexpected problems: ${JSON.stringify(reading.problems)}`);
    return reading.sheet;
}

describe('readActivitySheet', () => {
    it('reads the example written against the schema', () => {
        // The schema is what the assistant writes from; this keeps it and the reader together.
        expect(readActivitySheet(example).problems).toEqual([]);
    });

    it('accepts the codes the schema lists, and only those', () => {
        // The assistant writes against the schema; the enums come from the database.
        const { properties, $defs } = JSON.parse(schema);
        const codes = (name: string) => $defs[name].oneOf.map((option: { const: string }) => option.const);

        expect(properties.version.const).toBe(SHEET_VERSION);
        expect(codes('format')).toEqual(Object.values(ActivityFormat));
        expect(codes('practice')).toEqual(Object.values(ActivityPractice));
        expect(codes('imaginaryRule')).toEqual(Object.values(ImaginaryRule));
        expect(codes('childrenPace')).toEqual(Object.values(ChildrenPace));
        expect(codes('hostEffort')).toEqual(Object.values(HostEffort));
        expect(codes('location')).toEqual(Object.values(ActivityLocation));
        expect(codes('season')).toEqual(Object.values(ActivitySeason));
        expect(codes('stepKind')).toEqual(Object.values(StepKind));
        expect(codes('endCriterion')).toEqual(Object.values(StepEndCriterion));
        expect(properties.pedagogy.properties.development.required).toEqual([...DEVELOPMENT_AXES]);
    });

    it('refuses what is not JSON', () => {
        expect(readActivitySheet('{ name: ').problems).toEqual([{ path: '', code: 'json' }]);
    });

    it('reports every problem at once, each where it is', () => {
        // The author fixes the file once, not once per run.
        const reading = readActivitySheet(JSON.stringify({
            name: ' ',
            classification: { format: 'OUTING' },
            steps: [{ kind: 'PREPARE' }, { kind: 'NAP', duration: -5 }],
            place: 'outdoor',
        }));

        expect(reading.sheet).toBeNull();
        expect(reading.problems).toEqual([
            { path: 'place', code: 'object' },
            { path: 'name', code: 'required' },
            { path: 'classification.format', code: 'choice', value: 'OUTING' },
            { path: 'steps[0].title', code: 'required' },
            { path: 'steps[1].title', code: 'required' },
            { path: 'steps[1].kind', code: 'choice', value: 'NAP' },
            { path: 'steps[1].duration', code: 'number' },
        ]);
    });

    it('refuses a format version it does not know', () => {
        // Version 1 named safety tags and gave each step a tip: read as 2, they would be lost.
        const reading = readActivitySheet(JSON.stringify({ version: 1, name: 'Tag' }));

        expect(reading.problems).toEqual([{ path: 'version', code: 'version', value: '1' }]);
    });

    it('refuses a summary longer than the collection takes, rather than cutting it', () => {
        const reading = readActivitySheet(JSON.stringify({ name: 'Tag', summary: 'a'.repeat(SUMMARY_MAX_LENGTH + 1) }));

        expect(reading.problems).toEqual([{ path: 'summary', code: 'length', value: String(SUMMARY_MAX_LENGTH) }]);
    });

    it('reads anything missing or null as unset, the way a blank activity holds it', () => {
        const sheet = sheetOf({ name: 'Tag', classification: { format: null }, audience: { ageMin: null } });

        expect(sheet.classification.format).toBeNull();
        expect(sheet.audience.ageMin).toBe(0);
        expect(sheet.place.indoor).toBe(false);
        expect(sheet.steps).toEqual([]);
    });

    it('takes a step that does not say its kind as a free one', () => {
        const sheet = sheetOf({ name: 'Tag', steps: [{ title: 'Hide the flags' }] });

        expect(sheet.steps[0]!.kind).toBe(StepKind.CUSTOM);
    });

    it('drops blank names and repeated choices rather than refusing them', () => {
        const sheet = sheetOf({
            name: 'Tag',
            classification: { format: ActivityFormat.WORKSHOP, practices: ['COOKING', 'COOKING'], themes: ['  ', 'Insects'] },
            materials: [{ name: '' }, { name: 'Chalk' }],
        });

        expect(sheet.classification.practices).toEqual(['COOKING']);
        expect(sheet.classification.themes).toEqual(['Insects']);
        expect(sheet.materials).toEqual([{ name: 'Chalk', quantity: '' }]);
    });
});

describe('activityFromSheet', () => {
    it('links a tag by name or slug, whatever the case, within its own kind', () => {
        const insects = aTag({ type: ActivityTagType.THEME, name: 'Insectes', slug: 'insectes' });
        const pirates = aTag({ type: ActivityTagType.IMAGINARY, name: 'Pirates', slug: 'pirates' });
        const sheet = sheetOf({
            name: 'Bug hunt',
            classification: { themes: ['INSECTES', 'pirates'] },
            imaginary: { universes: ['Pirates'] },
        });

        const { activity, unknown } = activityFromSheet(sheet, { ...nothingKnown, tags: [insects, pirates] });

        expect(activity.classification.themes).toEqual([insects]);
        expect(activity.imaginary.universes).toEqual([pirates]);
        // A pirate universe is not a theme: the name matched a tag of the wrong kind.
        expect(unknown).toEqual([{ kind: ActivityTagType.THEME, label: 'activities.tagType.THEME', name: 'pirates', description: '' }]);
    });

    it('reports a tag that does not exist and leaves it off, for the save to create', () => {
        const sheet = sheetOf({ name: 'Tag', pedagogy: { development: { DEVELOP_SOCIAL: ['Écoute'] } } });

        const { activity, unknown } = activityFromSheet(sheet, nothingKnown);

        expect(activity.pedagogy.development.DEVELOP_SOCIAL).toEqual([]);
        expect(unknown).toEqual([{ kind: ActivityTagType.DEVELOP_SOCIAL, label: 'activities.tagType.DEVELOP_SOCIAL', name: 'Écoute', description: '' }]);
    });

    it('reports a name that matched nothing once, whatever its case', () => {
        const sheet = sheetOf({ name: 'Tag', classification: { themes: ['Bugs', 'bugs', 'Birds'] } });

        const { unknown } = activityFromSheet(sheet, nothingKnown);

        expect(unknown.map(reference => reference.name)).toEqual(['Bugs', 'Birds']);
    });

    it('links a name given twice once', () => {
        const chalk = aTag({ type: ActivityTagType.THEME, name: 'Craie', slug: 'craie' });
        const sheet = sheetOf({ name: 'Tag', classification: { themes: ['Craie', 'craie'] } });

        expect(activityFromSheet(sheet, { ...nothingKnown, tags: [chalk] }).activity.classification.themes).toEqual([chalk]);
    });

    it('links safety instructions by name or slug, and each step\'s tips by name, reporting the rest', () => {
        const fire = aSafetyInstruction({ name: 'Feu', slug: 'feu' });
        const water = aSafetyInstruction({ name: 'Eau (baignade)', slug: 'eau' });
        const pace = aTip({ name: 'Garder le rythme' });
        const sheet = sheetOf({
            name: 'Tag',
            safety: { instructions: ['FEU', 'eau', 'Froid'] },
            steps: [{ title: 'Jeu', tips: ['garder le rythme', 'Chanter'] }],
        });

        const { activity, stepTips, unknown } = activityFromSheet(sheet, { tags: [], safetyInstructions: [fire, water], tips: [pace] });

        expect(activity.safety.instructions).toEqual([fire, water]);
        expect(stepTips).toEqual([[pace]]);
        expect(unknown).toEqual([
            { kind: 'SAFETY', label: 'activities.fields.safetyInstructions', name: 'Froid', description: '' },
            { kind: 'TIP', label: 'activities.tips.title', name: 'Chanter', description: '' },
        ]);
    });

    it('creates a reference with the first description the sheet gives it, and ignores it for one that exists', () => {
        const pace = aTip({ name: 'Garder le rythme' });
        const sheet = sheetOf({
            name: 'Tag',
            safety: { instructions: [{ name: 'Photosensibilité', description: '<p>1 éclair par seconde au plus.</p>' }] },
            steps: [
                { title: 'Jeu', tips: ['Lettre par lettre', { name: 'Garder le rythme', description: '<p>Ignored.</p>' }] },
                { title: 'Fin', tips: [{ name: 'lettre par lettre', description: '<p>Renvoyer lettre par lettre.</p>' }] },
            ],
        });

        const { stepTips, unknown } = activityFromSheet(sheet, { ...nothingKnown, tips: [pace] });

        expect(stepTips[0]).toEqual([pace]);
        expect(unknown.map(({ kind, name, description }) => ({ kind, name, description }))).toEqual([
            { kind: 'SAFETY', name: 'Photosensibilité', description: '<p>1 éclair par seconde au plus.</p>' },
            { kind: 'TIP', name: 'Lettre par lettre', description: '<p>Renvoyer lettre par lettre.</p>' },
        ]);
    });
});

describe('unsetFields', () => {
    const labels = (fields: { label: string }[]) => fields.map(field => field.label);

    it('lists a workshop\'s practices and notes, and universes when imposed, only then', () => {
        const game = anActivity({ classification: { format: ActivityFormat.SMALL_GAME, practices: [], themes: [] } });
        const workshop = anActivity({
            classification: { format: ActivityFormat.WORKSHOP, practices: [], themes: [] },
            imaginary: { rule: ImaginaryRule.REQUIRED, universes: [] },
        });

        expect(labels(unsetFields(game, []))).not.toContain('activities.fields.practices');
        expect(labels(unsetFields(game, []))).not.toContain('activities.fields.supervisionNotes');
        expect(labels(unsetFields(game, []))).not.toContain('activities.tagType.IMAGINARY');
        expect(labels(unsetFields(workshop, []))).toEqual(expect.arrayContaining([
            'activities.fields.practices',
            'activities.fields.supervisionNotes',
            'activities.tagType.IMAGINARY',
        ]));
    });

    it('takes one bound of a range, one place flag or one development axis as set', () => {
        const activity = anActivity();
        activity.audience.ageMax = 8;
        activity.place.outdoor = true;
        activity.pedagogy.development.DEVELOP_SOCIAL = [aTag({ type: ActivityTagType.DEVELOP_SOCIAL })];

        const unset = labels(unsetFields(activity, []));

        expect(unset).not.toContain('activities.fields.age');
        expect(unset).toContain('activities.fields.participants');
        expect(unset).not.toContain('activities.authoring.import.unset.indoorOutdoor');
        expect(unset).not.toContain('activities.families.development');
    });

    it('takes an emptied editor as no description', () => {
        expect(labels(unsetFields(anActivity({ description: '<p></p>' }), []))).toContain('activities.authoring.description');
    });

    it('names the steps with no duration', () => {
        const unset = unsetFields(anActivity(), [{ title: 'Install', duration: 5 }, { title: 'Play', duration: 0 }]);

        expect(unset.at(-1)).toEqual({ label: 'activities.steps.fields.duration', steps: ['Play'] });
        expect(labels(unset)).not.toContain('activities.steps.title');
    });
});

describe('materialsOfSheet', () => {
    it('adds what a step or workshop recalls that the list forgot, each name once', () => {
        const sheet = sheetOf({
            name: 'Tag',
            materials: [{ name: 'Ballon en mousse', quantity: '2' }],
            steps: [{ title: 'Install', materials: ['ballon en mousse', 'Craie'] }],
            workshops: [{ name: 'Relay', materials: ['craie', 'Plots'] }],
        });

        expect(materialsOfSheet(sheet)).toEqual([
            { name: 'Ballon en mousse', quantity: '2' },
            { name: 'Craie', quantity: '' },
            { name: 'Plots', quantity: '' },
        ]);
    });
});

describe('stepFromSheet', () => {
    it('recalls the activity\'s own materials by name', () => {
        const ball = aMaterial({ name: 'Ballon en mousse' });
        const chalk = aMaterial({ name: 'Craie' });
        const sheet = sheetOf({ name: 'Tag', steps: [{ title: 'Install', materials: ['CRAIE', 'Unknown'] }] });

        const step = stepFromSheet(sheet.steps[0]!, 'stp-1', 'act-1', [ball, chalk]);

        expect(step.activity).toBe('act-1');
        expect(step.materials).toEqual([chalk]);
    });

    it('puts the title in a step that has no description, since the collection requires one', () => {
        const sheet = sheetOf({ name: 'Tag', steps: [{ title: 'Cache & <cherche>' }, { title: 'Go', description: '<p>Run</p>' }] });

        expect(stepFromSheet(sheet.steps[0]!, 'stp-1', 'act-1', []).description).toBe('<p>Cache &amp; &lt;cherche&gt;</p>');
        expect(stepFromSheet(sheet.steps[1]!, 'stp-1', 'act-1', []).description).toBe('<p>Run</p>');
    });

    it('carries the visual brief and the end criteria, codes and words apart', () => {
        const sheet = sheetOf({
            name: 'Tag',
            steps: [{
                title: 'Play',
                visualBrief: ' Children in a circle ',
                endCriteria: ['TIME_UP', 'TIME_UP'],
                endCriteriaOther: 'Night falls',
            }],
        });

        expect(stepFromSheet(sheet.steps[0]!, 'stp-1', 'act-1', [])).toMatchObject({
            visual_brief: 'Children in a circle',
            end_criteria: [StepEndCriterion.TIME_UP],
            end_criteria_other: 'Night falls',
        });
    });
});

describe('draftFromSheet', () => {
    /** Ids in the order they were asked for, so a spec can tell which record got which. */
    function counter() {
        let next = 0;
        return () => `id-${++next}`;
    }

    const sheet = () => sheetOf({
        name: 'Bug hunt',
        materials: [{ name: 'Loupe', quantity: '1 par enfant' }],
        steps: [{ title: 'Hide the bugs', materials: ['loupe'] }],
        workshops: [{ name: 'Leaves', materials: ['Bocal'] }],
    });

    it('links the catalogue material going by that name, whatever its case, rather than adding it again', () => {
        const loupe = aCatalogueMaterial({ id: 'mat-loupe', name: 'LOUPE' });

        const draft = draftFromSheet(sheet(), anActivity({ id: 'act-1' }), [loupe], counter());

        const links = draft.activity.materials;
        expect(links.map(link => link.material)).toContain('mat-loupe');
        expect(links.find(link => link.material === 'mat-loupe')?.quantity).toBe('1 par enfant');
        expect(draft.newMaterials.map(material => material.name)).toEqual(['Bocal']);
    });

    it('hangs every record off the activity, and has steps and workshops recall the links', () => {
        const draft = draftFromSheet(sheet(), anActivity({ id: 'act-1' }), [], counter());
        const { materials, steps, workshops } = draft.activity;

        expect([...materials, ...steps, ...workshops].every(record => record.activity === 'act-1')).toBe(true);
        expect(steps[0]!.materials).toEqual([materials[0]]);
        expect(workshops[0]!.materials).toEqual([materials[1]]);
    });

    it('gives a step the files picked for it, under the id they point at', () => {
        const file = aResource({ step: 'stp-picked' });

        const draft = draftFromSheet(sheet(), anActivity({ id: 'act-1' }), [], counter(), [{ id: 'stp-picked', resources: [file] }]);

        expect(draft.activity.steps[0]).toMatchObject({ id: 'stp-picked', resources: [file] });
    });

    it('links a name the catalogue lacked to the new catalogue material created for it', () => {
        const draft = draftFromSheet(sheet(), anActivity({ id: 'act-1' }), [], counter());

        expect(draft.activity.materials.map(link => link.material))
            .toEqual(draft.newMaterials.map(material => material.id));
    });
});

describe('resourcesOfSheet', () => {
    const twoSteps = { steps: [{ title: 'Préparer' }, { title: 'Jouer' }] } as Pick<ActivitySheet, 'steps'>;

    it('groups the files by the position of their step', () => {
        const reading = resourcesOfSheet(twoSteps, [{ step: 1, path: '/a.png' }, { step: 1, path: '/b.pdf' }]);

        expect(reading.paths).toEqual([[], ['/a.png', '/b.pdf']]);
    });

    it('refuses a file for a step the sheet does not have, rather than dropping it', () => {
        const reading = resourcesOfSheet(twoSteps, [{ step: 2, path: '/a.png' }]);

        expect(reading.problems).toEqual([{ path: 'resources[0].step', code: 'choice', value: '2' }]);
    });

    it('refuses more files than a step may carry', () => {
        const eleven = Array.from({ length: MAX_STEP_RESOURCES + 1 }, (_, index) => ({ step: 0, path: `/${index}.png` }));

        const reading = resourcesOfSheet(twoSteps, eleven);

        expect(reading.problems).toEqual([{ path: 'steps[0]', code: 'files', value: String(MAX_STEP_RESOURCES) }]);
    });
});
