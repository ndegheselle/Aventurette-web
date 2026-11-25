import example from '@docs/user/import/example/130973697/activity.json';
import {
    checkImport,
    readFiche,
    readImport,
    unzipImport,
    type ImportContext,
} from '@features/activities-authoring/models/import';
import type { References } from '@features/activities-authoring/models/glossary.import';
import { ActivityTagType } from '@features/activities/models/tag';
import { anActivity, aSafetyInstruction, aTag, aTip } from '@tests';
import { strToU8, zipSync } from 'fflate';
import { describe, expect, it } from 'vitest';

let ids = 0;
const newId = () => `new${++ids}`;

/** A zip of these files, each given as text or bytes. */
function zipOf(files: Record<string, string | Uint8Array>): Uint8Array {
    return zipSync(Object.fromEntries(Object.entries(files).map(([path, data]) =>
        [path, typeof data === 'string' ? strToU8(data) : data])));
}

/** The example fiche, with what a test changes. */
function aFiche(overrides: Record<string, unknown> = {}) {
    return { ...structuredClone(example), ...overrides };
}

/** The catalogues the example fiche names, and nothing else. */
function referencesOfExample(): References {
    const tag = (type: ActivityTagType, slug: string) => aTag({ type, slug, name: slug });
    return {
        tags: [
            tag(ActivityTagType.THEME, 'vie-au-camp'),
            tag(ActivityTagType.THEME, 'communication'),
            tag(ActivityTagType.IMAGINARY, 'post-apocalyptique'),
            ...['cooperation', 'concentration', 'memoire', 'ecoute'].map(slug => tag(ActivityTagType.GOAL, slug)),
            tag(ActivityTagType.IDEAL_FOR, 'conclure-un-temps-collectif'),
            tag(ActivityTagType.DEVELOP_PHYSICAL, 'connaitre-et-reguler-son-corps'),
            tag(ActivityTagType.DEVELOP_INTELLECTUAL, 'apprendre-et-memoriser'),
            tag(ActivityTagType.DEVELOP_INTELLECTUAL, 'raisonner-et-resoudre'),
            tag(ActivityTagType.DEVELOP_SOCIAL, 'communiquer-et-ecouter'),
            tag(ActivityTagType.DEVELOP_SOCIAL, 'cooperer-et-s-entraider'),
            tag(ActivityTagType.DEVELOP_MORAL, 'perseverance-et-courage'),
        ],
        safetyInstructions: [aSafetyInstruction({ slug: 'meteo-extreme' }), aSafetyInstruction({ slug: 'premiers-secours' })],
        tips: ['constitution-equipes', 'annoncer-fin', 'mener-un-debriefing'].map(slug => aTip({ slug })),
    };
}

function context(overrides: Partial<ImportContext> = {}): ImportContext {
    return { references: referencesOfExample(), catalogue: [], existing: [], newId, ...overrides };
}

const PDF = new Uint8Array([37, 80, 68, 70]);

describe('the documented example', () => {
    it('imports with no error once its identifiers are in the catalogues', () => {
        const report = checkImport(readImport(unzipImport(zipOf({
            '130973697/activity.json': JSON.stringify(example),
            '130973697/ressources/code-morse.pdf': PDF,
        }))), context());

        expect(report.fiches[0]!.problems.filter(problem => problem.level === 'error')).toEqual([]);
    });
});

describe('unzipImport', () => {
    it('makes a fiche of each folder holding an activity.json, with its files by their path in it', () => {
        const zip = unzipImport(zipOf({
            'glossary.json': '{}',
            '130973697/activity.json': '{"id":"130973697"}',
            '130973697/ressources/code-morse.pdf': PDF,
        }));

        expect(zip.glossary).toBe('{}');
        expect(zip.folders).toHaveLength(1);
        expect(zip.folders[0]!.name).toBe('130973697');
        expect([...zip.folders[0]!.files.keys()]).toEqual(['ressources/code-morse.pdf']);
        expect(zip.stray).toEqual([]);
    });

    it('reads a zip that wraps everything in one more folder the same way', () => {
        const zip = unzipImport(zipOf({
            'export/glossary.json': '{}',
            'export/130973697/activity.json': '{}',
        }));

        expect(zip.glossary).toBe('{}');
        expect(zip.folders.map(folder => folder.name)).toEqual(['130973697']);
    });

    it('sets apart the files no fiche holds, and skips the copies macOS adds', () => {
        const zip = unzipImport(zipOf({
            '130973697/activity.json': '{}',
            'notes.txt': 'x',
            '__MACOSX/130973697/._activity.json': 'x',
        }));

        expect(zip.stray).toEqual(['notes.txt']);
    });

    it('throws on bytes that are not a zip', () => {
        expect(() => unzipImport(strToU8('not a zip'))).toThrow();
    });
});

describe('readImport', () => {
    it('refuses a fiche whose folder is not named after its id: the id is what updates it later', () => {
        const reading = readImport(unzipImport(zipOf({ '42/activity.json': JSON.stringify(aFiche()) })));

        expect(reading.fiches[0]!.reading.problems).toEqual([{ level: 'error', code: 'folder', value: '130973697' }]);
    });

    it('refuses a file that does not say it is a fiche, such as a glossary in a fiche\'s place', () => {
        expect(readFiche(JSON.stringify({ schema: 'aventurette.glossary.v1' })).problems)
            .toEqual([{ level: 'error', code: 'format', value: 'aventurette.activity.v1' }]);
    });

    it('refuses a zip with no fiche', () => {
        expect(readImport(unzipImport(zipOf({ 'glossary.json': '{}' }))).problems)
            .toContainEqual({ level: 'error', code: 'noFiche' });
    });
});

describe('checkImport', () => {
    function reportOf(files: Record<string, string | Uint8Array>, overrides: Partial<ImportContext> = {}) {
        return checkImport(readImport(unzipImport(zipOf(files))), context(overrides));
    }

    const withMorse = { '130973697/ressources/code-morse.pdf': PDF };

    it('checks a fiche against the catalogues the glossary of the same zip leaves', () => {
        const references = referencesOfExample();
        references.tags = references.tags.filter(tag => tag.slug !== 'communication');
        const glossary = {
            schema: 'aventurette.glossary.v1',
            tags: [{ kind: 'THEME', id: 'communication', name: 'Communication' }],
            tips: [],
            safety: [],
        };

        const report = reportOf({
            'glossary.json': JSON.stringify(glossary),
            '130973697/activity.json': JSON.stringify(aFiche()),
            ...withMorse,
        }, { references });

        expect(report.glossary?.plan.tags.create.map(tag => tag.slug)).toEqual(['communication']);
        expect(report.fiches[0]!.problems.filter(problem => problem.level === 'error')).toEqual([]);
    });

    it('finds the activity an earlier import made of the fiche, by its page id', () => {
        const earlier = anActivity({ sourceId: '130973697' });

        const report = reportOf({ '130973697/activity.json': JSON.stringify(aFiche()), ...withMorse }, {
            existing: [anActivity({ sourceId: '1' }), earlier],
        });

        expect(report.fiches[0]!.existing).toBe(earlier);
    });

    it('reports a fiche too broken to look up, rather than failing the whole check', () => {
        const { steps: _dropped, ...broken } = aFiche();

        const report = reportOf({ '130973697/activity.json': JSON.stringify(broken), ...withMorse });

        expect(report.fiches[0]!.problems).toEqual([{ level: 'error', code: 'malformed' }]);
    });

    it('warns of a file in a fiche\'s folder that the fiche does not name', () => {
        const report = reportOf({
            '130973697/activity.json': JSON.stringify(aFiche()),
            ...withMorse,
            '130973697/brouillon.png': PDF,
        });

        expect(report.fiches[0]!.problems).toContainEqual({ level: 'warning', code: 'unusedFile', value: 'brouillon.png' });
    });
});
