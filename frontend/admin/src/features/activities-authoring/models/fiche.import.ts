import type { HTMLString } from "@/backend/schema.g";
import type { IdFactory } from "@chapelure/core";
import {
    ActivityState,
    DEVELOPMENT_AXES,
    type ActivityData,
    type ActivityFormat,
    type ActivityLocation,
    type ActivityPractice,
    type ActivitySeason,
    type ChildrenPace,
    type DevelopmentAxis,
    type HostEffort,
    type ImaginaryRule,
} from "@features/activities/models/activity";
import type { ActivityMaterialData, MaterialData } from "@features/activities/models/material";
import type { ActivityStepData, StepEndCriterion, StepKind } from "@features/activities/models/step";
import { ActivityTagType, type ActivityTagData } from "@features/activities/models/tag";
import type { ActivityWorkshopData } from "@features/activities/models/workshop";
import { createEmptyActivity } from "@features/activities-authoring/models/activity.edit";
import type { References } from "@features/activities-authoring/models/glossary.import";
import {
    createCatalogueMaterial,
    createMaterialLink,
    materialNamed,
    nameKey,
} from "@features/activities-authoring/models/material.edit";
import {
    createEmptyStep,
    createResource,
    isBlankHtml,
    MAX_STEP_RESOURCES,
} from "@features/activities-authoring/models/step.edit";
import { createEmptyWorkshop } from "@features/activities-authoring/models/workshop.edit";

/**
 * One fiche of an import: its `activity.json`, as `docs/user/import/activity.schema.json`
 * describes it, what is wrong with it beyond the schema, and the activity it becomes.
 */

// ── The file ────────────────────────────────────────────────────────────────────────────────

export interface ActivityFiche {
    schema: 'aventurette.activity.v1';
    /** The Confluence page id. */
    id: string;
    name: string;
    summary: string;
    description: HTMLString;
    visual: FicheVisual;
    classification: { format: ActivityFormat | null; practices: ActivityPractice[]; themes: string[] };
    imaginary: { rule: ImaginaryRule | null; universes: string[] };
    audience: {
        ageMin: number | null;
        ageMax: number | null;
        participantsMin: number | null;
        participantsMax: number | null;
        childrenPace: ChildrenPace | null;
        ageVariants: HTMLString;
    };
    supervision: { hostEffort: HostEffort | null; hostsRequired: number | null; crossSupervision: boolean; notes: HTMLString };
    place: { indoor: boolean; outdoor: boolean; locations: ActivityLocation[]; conditions: HTMLString; seasons: ActivitySeason[] };
    safety: string[];
    pedagogy: { goals: string[]; idealFor: string[]; development: Record<FicheAxis, string[]> };
    gatherDuration: number | null;
    materials: { name: string; quantity: string }[];
    resources: { name: string; file: string }[];
    workshops: FicheWorkshop[];
    steps: FicheStep[];
    toConfirm: string[];
}

export interface FicheVisual {
    brief: string;
    /** A path in the zip, relative to the fiche's folder. */
    file: string | null;
}

export interface FicheWorkshop {
    name: string;
    theme: string;
    challenges: HTMLString;
    adultsRequired: number | null;
    materials: string[];
}

export interface FicheStep {
    kind: StepKind;
    title: string;
    duration: number | null;
    description: HTMLString;
    actions: string[];
    visual: FicheVisual;
    materials: string[];
    resources: string[];
    tips: string[];
    advice: HTMLString;
    endCriteria: StepEndCriterion[];
    endCriteriaOther: string;
}

/** The fiche's names for the development axes, which are tag kinds in the app. */
export type FicheAxis = 'physical' | 'intellectual' | 'affect' | 'social' | 'moral' | 'spiritual';

export const FICHE_AXES: Record<FicheAxis, DevelopmentAxis> = {
    physical: ActivityTagType.DEVELOP_PHYSICAL,
    intellectual: ActivityTagType.DEVELOP_INTELLECTUAL,
    affect: ActivityTagType.DEVELOP_AFFECT,
    social: ActivityTagType.DEVELOP_SOCIAL,
    moral: ActivityTagType.DEVELOP_MORAL,
    spiritual: ActivityTagType.DEVELOP_SPIRITUAL,
};

/** The largest file the collections take. */
export const MAX_FILE_SIZE = 2 * 1024 * 1024;

// ── What is wrong with it ───────────────────────────────────────────────────────────────────

/**
 * Something the check found. An error stops the import; a warning is shown and accepted. `code`
 * picks the message in the locales; `path` says where in the file, as `steps[2].materials`.
 */
export interface ImportProblem {
    level: 'error' | 'warning';
    code: string;
    path?: string;
    /** What the message quotes: an identifier, a name, a file. */
    value?: string;
    /** A translation key the message quotes, such as the kind of a reference. */
    label?: string;
}

/** What a fiche is checked against beyond its own file. */
export interface FicheContext {
    references: References;
    catalogue: MaterialData[];
    /** The files of its folder, by path, with their size. */
    files: Map<string, number>;
}

const error = (code: string, rest: Omit<ImportProblem, 'level' | 'code'> = {}): ImportProblem => ({ level: 'error', code, ...rest });
const warning = (code: string, rest: Omit<ImportProblem, 'level' | 'code'> = {}): ImportProblem => ({ level: 'warning', code, ...rest });

/**
 * What the schema cannot say: identifiers the catalogues lack, files the folder lacks, names a
 * step or workshop gives that the fiche does not list. Then what the author should look at
 * before importing: new materials, rows « à valider », fields left empty.
 */
export function ficheProblems(fiche: ActivityFiche, { references, catalogue, files }: FicheContext): ImportProblem[] {
    const problems: ImportProblem[] = [];

    const checkIds = (ids: string[], path: string, label: string, exists: (id: string) => boolean) => {
        ids.forEach((id, index) => {
            if (!exists(id)) problems.push(error('reference', { path: `${path}[${index}]`, value: id, label }));
        });
    };
    const checkTags = (ids: string[], path: string, kind: ActivityTagType) =>
        checkIds(ids, path, `activities.tagType.${kind}`, id => !!tagFor(references, kind, id));

    checkTags(fiche.classification.themes, 'classification.themes', ActivityTagType.THEME);
    checkTags(fiche.imaginary.universes, 'imaginary.universes', ActivityTagType.IMAGINARY);
    checkTags(fiche.pedagogy.goals, 'pedagogy.goals', ActivityTagType.GOAL);
    checkTags(fiche.pedagogy.idealFor, 'pedagogy.idealFor', ActivityTagType.IDEAL_FOR);
    for (const [axis, kind] of Object.entries(FICHE_AXES))
        checkTags(fiche.pedagogy.development[axis as FicheAxis], `pedagogy.development.${axis}`, kind);
    checkIds(fiche.safety, 'safety', 'activities.fields.safetyInstructions',
        id => references.safetyInstructions.some(item => item.slug === id));

    const checkFile = (path: string | null, at: string) => {
        if (!path) return;
        const size = files.get(path);
        if (size === undefined) problems.push(error('missingFile', { path: at, value: path }));
        else if (size > MAX_FILE_SIZE) problems.push(error('fileSize', { path: at, value: path }));
    };
    checkFile(fiche.visual.file, 'visual.file');
    fiche.resources.forEach((resource, index) => checkFile(resource.file, `resources[${index}].file`));

    const listed = new Set(fiche.materials.map(material => nameKey(material.name)));
    const resources = new Set(fiche.resources.map(resource => nameKey(resource.name)));
    const checkNames = (names: string[], path: string, known: Set<string>, code: string) => {
        names.forEach((name, index) => {
            if (!known.has(nameKey(name))) problems.push(error(code, { path: `${path}[${index}]`, value: name }));
        });
    };

    fiche.workshops.forEach((workshop, index) =>
        checkNames(workshop.materials, `workshops[${index}].materials`, listed, 'unlistedMaterial'));

    fiche.steps.forEach((step, index) => {
        const path = `steps[${index}]`;
        checkNames(step.materials, `${path}.materials`, listed, 'unlistedMaterial');
        checkNames(step.resources, `${path}.resources`, resources, 'unlistedResource');
        checkIds(step.tips, `${path}.tips`, 'activities.tips.title', id => references.tips.some(tip => tip.slug === id));
        checkFile(step.visual.file, `${path}.visual.file`);
        if (step.resources.length > MAX_STEP_RESOURCES)
            problems.push(error('tooManyResources', { path: `${path}.resources`, value: String(MAX_STEP_RESOURCES) }));
        if (step.duration === null)
            problems.push(warning('noDuration', { path: `${path}.duration`, value: step.title }));
    });

    for (const material of fiche.materials) {
        if (!materialNamed(catalogue, material.name))
            problems.push(warning('newMaterial', { value: material.name }));
    }

    const used = new Set(fiche.steps.flatMap(step => step.resources.map(nameKey)));
    for (const resource of fiche.resources) {
        if (!used.has(nameKey(resource.name)))
            problems.push(warning('unattachedResource', { value: resource.name }));
    }

    for (const row of fiche.toConfirm)
        problems.push(warning('toConfirm', { value: row }));

    for (const label of unsetFields(fiche))
        problems.push(warning('unset', { label }));

    return problems;
}

/** The fields the template expects that the fiche leaves empty, as translation keys. */
function unsetFields(fiche: ActivityFiche): string[] {
    const { classification, imaginary, audience, supervision, place, pedagogy } = fiche;

    const checks: [boolean, string][] = [
        [!fiche.summary.trim(), 'activities.fields.summary'],
        [isBlankHtml(fiche.description), 'activities.authoring.description'],
        [!fiche.visual.brief.trim() && !fiche.visual.file, 'activities.fields.visualBrief'],
        [!classification.format, 'activities.fields.format'],
        [!classification.themes.length, 'activities.tagType.THEME'],
        [!imaginary.rule, 'activities.fields.imaginaryRule'],
        [audience.ageMin === null && audience.ageMax === null, 'activities.fields.age'],
        [audience.participantsMin === null && audience.participantsMax === null, 'activities.fields.participants'],
        [!audience.childrenPace, 'activities.fields.childrenPace'],
        [!supervision.hostEffort, 'activities.fields.hostEffort'],
        [supervision.hostsRequired === null, 'activities.fields.hosts'],
        [!place.indoor && !place.outdoor, 'activities.authoring.import.unset.indoorOutdoor'],
        [!place.seasons.length, 'activities.fields.seasons'],
        [!pedagogy.goals.length, 'activities.tagType.GOAL'],
        [Object.values(pedagogy.development).every(ids => !ids.length), 'activities.families.development'],
    ];

    return checks.filter(([unset]) => unset).map(([, label]) => label);
}

function tagFor(references: References, kind: ActivityTagType, slug: string): ActivityTagData | undefined {
    return references.tags.find(tag => tag.type === kind && tag.slug === slug);
}

// ── The activity it becomes ─────────────────────────────────────────────────────────────────

/** What a fiche's activity is built from, beyond the fiche. */
export interface DraftContext {
    references: References;
    catalogue: MaterialData[];
    /** The fiche's files, by their path in its folder. */
    files: Map<string, File>;
    newId: IdFactory;
    /** Who a new activity is written by. */
    author: string;
    /** The activity an earlier import of the fiche made, which this one replaces. */
    original: ActivityData | null;
}

/** The activity a fiche describes, and what its save writes along with it. */
export interface FicheDraft {
    /** With its material links, steps and workshops, each under the id to create it with. */
    activity: ActivityData;
    /** The names the catalogue does not have. */
    newMaterials: MaterialData[];
    /** The cover, when the fiche gives one. */
    visual?: File;
}

/**
 * The activity `fiche` describes. A fiche imported again keeps its activity's id, author, state
 * and cover when it gives none; everything under it is created again, so the save replaces it.
 * Identifiers the catalogues lack are left out: `ficheProblems` refuses such a fiche first.
 */
export function draftFromFiche(fiche: ActivityFiche, context: DraftContext): FicheDraft {
    const { references, catalogue, files, newId, author, original } = context;
    const id = original?.id ?? newId();

    const tags = (kind: ActivityTagType, slugs: string[]) =>
        slugs.map(slug => tagFor(references, kind, slug)).filter(isDefined);
    const bySlug = <T extends { slug?: string }>(items: T[], slugs: string[]) =>
        slugs.map(slug => items.find(item => item.slug === slug)).filter(isDefined);

    const newMaterials: MaterialData[] = [];
    const materials = fiche.materials.map(({ name, quantity }) => {
        let material = materialNamed(catalogue, name) ?? materialNamed(newMaterials, name);
        if (!material) {
            material = createCatalogueMaterial(newId(), name);
            newMaterials.push(material);
        }
        return createMaterialLink(newId(), id, material, quantity);
    });

    const development = Object.fromEntries(DEVELOPMENT_AXES.map(axis => [axis, []])) as unknown as Record<DevelopmentAxis, ActivityTagData[]>;
    for (const [axis, kind] of Object.entries(FICHE_AXES))
        development[kind] = tags(kind, fiche.pedagogy.development[axis as FicheAxis]);

    const steps = fiche.steps.map(step => stepFromFiche(step, fiche, { id: newId(), activity: id, materials, references, files, newId }));
    const workshops = fiche.workshops.map(workshop => ({
        ...createEmptyWorkshop(newId(), id, workshop.name),
        theme: workshop.theme,
        challenges: workshop.challenges,
        adults_required: workshop.adultsRequired ?? 0,
        materials: recalled(materials, workshop.materials),
    }) as ActivityWorkshopData);

    const activity: ActivityData = {
        ...createEmptyActivity(),
        ...(original && {
            created: original.created,
            updated: original.updated,
            collectionId: original.collectionId,
            collectionName: original.collectionName,
            state: original.state,
            visual: original.visual,
        }),
        id,
        user: original?.user ?? author,
        state: original?.state ?? ActivityState.DRAFT,
        sourceId: fiche.id,
        name: fiche.name,
        summary: fiche.summary,
        description: fiche.description,
        visualBrief: fiche.visual.brief,
        gatherDuration: fiche.gatherDuration ?? 0,
        classification: {
            format: fiche.classification.format,
            practices: fiche.classification.practices,
            themes: tags(ActivityTagType.THEME, fiche.classification.themes),
        },
        imaginary: {
            rule: fiche.imaginary.rule,
            universes: tags(ActivityTagType.IMAGINARY, fiche.imaginary.universes),
        },
        audience: {
            ageMin: fiche.audience.ageMin ?? 0,
            ageMax: fiche.audience.ageMax ?? 0,
            participantsMin: fiche.audience.participantsMin ?? 0,
            participantsMax: fiche.audience.participantsMax ?? 0,
            childrenPace: fiche.audience.childrenPace,
            ageVariants: fiche.audience.ageVariants,
        },
        supervision: {
            hostEffort: fiche.supervision.hostEffort,
            hostsRequired: fiche.supervision.hostsRequired ?? 0,
            crossSupervision: fiche.supervision.crossSupervision,
            notes: fiche.supervision.notes,
        },
        place: { ...fiche.place },
        safety: { instructions: bySlug(references.safetyInstructions, fiche.safety) },
        pedagogy: {
            goals: tags(ActivityTagType.GOAL, fiche.pedagogy.goals),
            idealFor: tags(ActivityTagType.IDEAL_FOR, fiche.pedagogy.idealFor),
            development,
        },
        materials,
        steps,
        workshops,
    };

    const visual = fiche.visual.file ? files.get(fiche.visual.file) : undefined;
    return { activity, newMaterials, ...(visual && { visual }) };
}

interface StepContext {
    id: string;
    activity: string;
    materials: ActivityMaterialData[];
    references: References;
    files: Map<string, File>;
    newId: IdFactory;
}

/**
 * A fiche's step. Its actions follow its own text as a numbered list; the collection refuses a
 * blank description, so the title stands in for one when there is neither.
 */
function stepFromFiche(step: FicheStep, fiche: ActivityFiche, context: StepContext): ActivityStepData {
    const { id, activity, materials, references, files, newId } = context;

    const actions = step.actions.length
        ? `<ol>${step.actions.map(action => `<li>${escapeHtml(action)}</li>`).join('')}</ol>`
        : '';
    const written = (isBlankHtml(step.description) ? '' : step.description) + actions;

    const resources = step.resources.flatMap(name => {
        const resource = fiche.resources.find(item => nameKey(item.name) === nameKey(name));
        const file = resource && files.get(resource.file);
        return resource && file ? [{ ...createResource(newId(), id, file, ''), name: resource.name }] : [];
    });

    const visualFile = step.visual.file ? files.get(step.visual.file) : undefined;

    return {
        ...createEmptyStep(id, activity),
        kind: step.kind,
        title: step.title,
        duration: step.duration ?? 0,
        description: written || `<p>${escapeHtml(step.title)}</p>`,
        advice: step.advice,
        visual_brief: step.visual.brief,
        ...(visualFile && { visualFile }),
        end_criteria: step.endCriteria,
        end_criteria_other: step.endCriteriaOther,
        materials: recalled(materials, step.materials),
        resources,
        tips: step.tips.map(slug => references.tips.find(tip => tip.slug === slug)).filter(isDefined),
    };
}

/** The activity's material links a step or workshop names, each once. */
function recalled(materials: ActivityMaterialData[], names: string[]): ActivityMaterialData[] {
    const wanted = new Set(names.map(nameKey));
    return materials.filter(material => wanted.has(nameKey(material.name)));
}

function isDefined<T>(value: T | undefined): value is T {
    return value !== undefined;
}

function escapeHtml(text: string): string {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
