import type { IdFactory } from "@chapelure/core";
import type { ActivityData } from "@features/activities/models/activity";
import type { MaterialData } from "@features/activities/models/material";
import {
    ficheProblems,
    type ActivityFiche,
    type ImportProblem,
} from "@features/activities-authoring/models/fiche.import";
import {
    NO_GLOSSARY,
    planGlossary,
    referencesAfter,
    type GlossaryFile,
    type GlossaryPlan,
    type References,
} from "@features/activities-authoring/models/glossary.import";
import { strFromU8, unzipSync } from "fflate";

/**
 * An import, from the zip an author uploads to the report the screen shows: one folder per
 * fiche, named after its Confluence page id, holding its `activity.json` and the files it names,
 * and an optional `glossary.json` applied first. See `docs/user/import`.
 */

export const ACTIVITY_FILE = 'activity.json';
export const GLOSSARY_FILE = 'glossary.json';

// ── The zip ─────────────────────────────────────────────────────────────────────────────────

/** A zip's files, grouped the way an import reads them. */
export interface ImportZip {
    glossary: string | null;
    folders: ImportFolder[];
    /** Files neither in a fiche's folder nor the glossary. */
    stray: string[];
}

export interface ImportFolder {
    /** The folder's own name, which is the fiche's id. */
    name: string;
    /** Its `activity.json`. */
    json: string;
    /** Every other file of the folder, by its path in it. */
    files: Map<string, Uint8Array>;
}

/**
 * The zip's files, by folder. A fiche's folder is wherever an `activity.json` is, so a zip that
 * wraps everything in one more folder reads the same. macOS's `__MACOSX` copies are skipped.
 *
 * @throws when the bytes are not a zip
 */
export function unzipImport(bytes: Uint8Array): ImportZip {
    const entries = Object.entries(unzipSync(bytes))
        .filter(([path]) => !path.endsWith('/') && !path.startsWith('__MACOSX/') && !basename(path).startsWith('.'));

    const ficheDirs = entries
        .filter(([path]) => basename(path) === ACTIVITY_FILE)
        .map(([path]) => dirname(path))
        .sort((a, b) => a.localeCompare(b));

    const glossaries = entries
        .filter(([path]) => basename(path) === GLOSSARY_FILE && !ficheDirs.some(dir => path.startsWith(`${dir}/`)))
        .sort(([a], [b]) => a.split('/').length - b.split('/').length);
    const glossary = glossaries[0];

    const folders = ficheDirs.map(dir => {
        const files = new Map<string, Uint8Array>();
        let json = '';
        for (const [path, data] of entries) {
            if (!path.startsWith(`${dir}/`)) continue;
            const inside = path.slice(dir.length + 1);
            if (inside === ACTIVITY_FILE) json = text(data);
            else files.set(inside, data);
        }
        return { name: basename(dir), json, files };
    });

    const stray = entries
        .map(([path]) => path)
        .filter(path => path !== glossary?.[0] && !ficheDirs.some(dir => path.startsWith(`${dir}/`)));

    return { glossary: glossary ? text(glossary[1]) : null, folders, stray };
}

/** A folder's files as the save uploads them, by their path in it. */
export function filesOf(folder: Pick<ImportFolder, 'files'>): Map<string, File> {
    return new Map([...folder.files].map(([path, data]) =>
        [path, new File([data as Uint8Array<ArrayBuffer>], basename(path), { type: mimeTypeOf(path) })]));
}

function text(data: Uint8Array): string {
    return strFromU8(data).replace(/^﻿/, '');
}

function basename(path: string): string {
    return path.slice(path.lastIndexOf('/') + 1);
}

function dirname(path: string): string {
    return path.includes('/') ? path.slice(0, path.lastIndexOf('/')) : '';
}

function mimeTypeOf(path: string): string {
    const extension = path.slice(path.lastIndexOf('.') + 1).toLowerCase();
    return { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', pdf: 'application/pdf' }[extension] ?? '';
}

// ── Reading its files ───────────────────────────────────────────────────────────────────────

/** A file read: its value when it is one, what is wrong otherwise. */
export type Reading<T> = { value: T; problems: [] } | { value: null; problems: ImportProblem[] };

export const FICHE_FORMAT = 'aventurette.activity.v1';
export const GLOSSARY_FORMAT = 'aventurette.glossary.v1';

export function readFiche(json: string): Reading<ActivityFiche> {
    return readMarked(json, FICHE_FORMAT);
}

export function readGlossary(json: string): Reading<GlossaryFile> {
    return readMarked(json, GLOSSARY_FORMAT);
}

/**
 * A file's JSON, taken as the format its `schema` names. Nothing else of its shape is checked
 * here: the collections refuse what they cannot store, and a file too broken to look up is
 * reported by `checkImport`.
 */
function readMarked<T>(json: string, format: string): Reading<T> {
    let value: unknown;
    try {
        value = JSON.parse(json);
    } catch {
        return { value: null, problems: [{ level: 'error', code: 'json' }] };
    }

    const marked = typeof value === 'object' && value !== null && (value as { schema?: unknown }).schema === format;
    if (!marked) return { value: null, problems: [{ level: 'error', code: 'format', value: format }] };

    return { value: value as T, problems: [] };
}

/** A zip read: each file parsed, before anything is looked up. */
export interface ImportReading {
    glossary: Reading<GlossaryFile> | null;
    fiches: FicheReading[];
    /** What is wrong with the zip as a whole. */
    problems: ImportProblem[];
}

export interface FicheReading {
    folder: ImportFolder;
    reading: Reading<ActivityFiche>;
}

export function readImport(zip: ImportZip): ImportReading {
    const problems: ImportProblem[] = [];
    if (!zip.folders.length) problems.push({ level: 'error', code: 'noFiche' });
    for (const path of zip.stray) problems.push({ level: 'warning', code: 'unusedFile', value: path });

    const fiches = zip.folders.map(folder => {
        const reading = readFiche(folder.json);
        if (reading.value && reading.value.id !== folder.name)
            return {
                folder,
                reading: { value: null, problems: [{ level: 'error', code: 'folder', value: reading.value.id }] },
            } satisfies FicheReading;
        return { folder, reading };
    });

    return { glossary: zip.glossary === null ? null : readGlossary(zip.glossary), fiches, problems };
}

/** The ids of the fiches a reading holds: which activities to look for. */
export function ficheIdsOf(reading: ImportReading): string[] {
    return reading.fiches.flatMap(({ reading }) => reading.value ? [reading.value.id] : []);
}

// ── Checking it against the app ─────────────────────────────────────────────────────────────

/** What the zip is checked against. */
export interface ImportContext {
    references: References;
    catalogue: MaterialData[];
    /** The activities earlier imports made of these fiches. */
    existing: ActivityData[];
    newId: IdFactory;
}

export interface ImportReport {
    glossary: { plan: GlossaryPlan; problems: ImportProblem[] } | null;
    fiches: FicheReport[];
    problems: ImportProblem[];
    /** The catalogues once the glossary is written, which the fiches are checked against. */
    references: References;
}

export interface FicheReport {
    folder: ImportFolder;
    fiche: ActivityFiche | null;
    /** The activity it replaces, or null for a new one. */
    existing: ActivityData | null;
    problems: ImportProblem[];
}

/**
 * Everything the import would do, and everything wrong with it. The glossary is planned first and
 * the fiches checked against the catalogues it leaves, so a fiche may use an entry the same zip
 * adds. A fiche too broken to look up is reported as such, and not checked further.
 */
export function checkImport(reading: ImportReading, context: ImportContext): ImportReport {
    const { catalogue, existing, newId } = context;

    let glossary: ImportReport['glossary'] = null;
    if (reading.glossary) {
        const problems = [...reading.glossary.problems];
        let plan = NO_GLOSSARY;
        try {
            if (reading.glossary.value) plan = planGlossary(reading.glossary.value, context.references, newId);
        } catch {
            problems.push({ level: 'error', code: 'malformed' });
        }
        const duplicates = plan.duplicates.map((key): ImportProblem => ({ level: 'error', code: 'duplicateEntry', value: key }));
        glossary = { plan, problems: [...problems, ...duplicates] };
    }

    const references = glossary ? referencesAfter(context.references, glossary.plan) : context.references;

    const fiches = reading.fiches.map(({ folder, reading: read }): FicheReport => {
        const fiche = read.value;
        if (!fiche) return { folder, fiche: null, existing: null, problems: read.problems };

        const sizes = new Map([...folder.files].map(([path, data]) => [path, data.byteLength]));
        let problems: ImportProblem[];
        try {
            problems = ficheProblems(fiche, { references, catalogue, files: sizes });

            const named = new Set([fiche.visual.file, ...fiche.steps.map(step => step.visual.file), ...fiche.resources.map(resource => resource.file)]);
            for (const path of folder.files.keys()) {
                if (!named.has(path)) problems.push({ level: 'warning', code: 'unusedFile', value: path });
            }
        } catch {
            // A key missing or of the wrong type: the file does not follow activity.schema.json.
            return { folder, fiche: null, existing: null, problems: [{ level: 'error', code: 'malformed' }] };
        }

        return {
            folder,
            fiche,
            existing: existing.find(activity => activity.sourceId === fiche.id) ?? null,
            problems,
        };
    });

    return { glossary, fiches, problems: reading.problems, references };
}

/** Whether anything stops the import. */
export function hasErrors(report: ImportReport): boolean {
    return [...report.problems, ...(report.glossary?.problems ?? []), ...report.fiches.flatMap(fiche => fiche.problems)]
        .some(problem => problem.level === 'error');
}
