import {
    activityFromSheet,
    materialsOfSheet,
    readActivitySheet,
    stepFromSheet,
    type ActivitySheet,
} from '@features/activities-authoring/model/activity.import';
import { ActivityFormat } from '@features/activities/model/activity';
import { StepKind } from '@features/activities/model/step';
import { ActivityTagType } from '@features/activities/model/tag';
import { aMaterial, aTag } from '@tests';
import { describe, expect, it } from 'vitest';
// Relative: no alias reaches the skills folder, and this is the one file that needs to.
import example from '../../../../../.claude/skills/fiche-to-json/example.json?raw';

// A sheet is written by hand or by the skill, outside the app: reading it is the one place that
// says what an imported activity may hold. Then the names in it become links.

function sheetOf(json: object): ActivitySheet {
    const reading = readActivitySheet(JSON.stringify(json));
    if (!reading.sheet) throw new Error(`unexpected problems: ${JSON.stringify(reading.problems)}`);
    return reading.sheet;
}

describe('readActivitySheet', () => {
    it('reads the example the fiche-to-json skill writes from', () => {
        // The skill documents the format; this is what keeps the two from drifting apart.
        expect(readActivitySheet(example).problems).toEqual([]);
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
        const reading = readActivitySheet(JSON.stringify({ version: 2, name: 'Tag' }));

        expect(reading.problems).toEqual([{ path: 'version', code: 'version', value: '2' }]);
    });

    it('reads anything missing or null as unset, the way a blank activity holds it', () => {
        const sheet = sheetOf({ name: 'Tag', classification: { format: null }, audience: { ageMin: null } });

        expect(sheet.classification.format).toBe('');
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

        const { activity, unknownTags } = activityFromSheet(sheet, [insects, pirates]);

        expect(activity.classification.themes).toEqual([insects]);
        expect(activity.imaginary.universes).toEqual([pirates]);
        // A pirate universe is not a theme: the name matched a tag of the wrong kind.
        expect(unknownTags).toEqual([{ type: ActivityTagType.THEME, name: 'pirates' }]);
    });

    it('reports a tag that does not exist and leaves it off, rather than creating it', () => {
        const sheet = sheetOf({ name: 'Tag', pedagogy: { development: { DEVELOP_SOCIAL: ['Écoute'] } } });

        const { activity, unknownTags } = activityFromSheet(sheet, []);

        expect(activity.pedagogy.development.DEVELOP_SOCIAL).toEqual([]);
        expect(unknownTags).toEqual([{ type: ActivityTagType.DEVELOP_SOCIAL, name: 'Écoute' }]);
    });

    it('links a tag named twice once', () => {
        const chalk = aTag({ type: ActivityTagType.SECURITY, name: 'Craie', slug: 'craie' });
        const sheet = sheetOf({ name: 'Tag', safety: { tags: ['Craie', 'craie'] } });

        expect(activityFromSheet(sheet, [chalk]).activity.safety.tags).toEqual([chalk]);
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

        const step = stepFromSheet(sheet.steps[0]!, 'act-1', [ball, chalk]);

        expect(step.activity).toBe('act-1');
        expect(step.materials).toEqual([chalk]);
    });

    it('puts the title in a step that has no description, since the collection requires one', () => {
        const sheet = sheetOf({ name: 'Tag', steps: [{ title: 'Cache & <cherche>' }, { title: 'Go', description: '<p>Run</p>' }] });

        expect(stepFromSheet(sheet.steps[0]!, 'act-1', []).description).toBe('<p>Cache &amp; &lt;cherche&gt;</p>');
        expect(stepFromSheet(sheet.steps[1]!, 'act-1', []).description).toBe('<p>Run</p>');
    });
});
