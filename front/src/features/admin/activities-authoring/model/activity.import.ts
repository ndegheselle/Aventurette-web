import type { HTMLString } from "@/backend/schema.g";
import { distinctById, type IdFactory } from "@chapelure/core";
import {
    ActivityFormat,
    ActivityLocation,
    ActivityPractice,
    ActivitySeason,
    ChildrenPace,
    DEVELOPMENT_AXES,
    HostEffort,
    ImaginaryRule,
    type ActivityAudience,
    type ActivityData,
    type ActivityPlace,
    type ActivitySupervision,
    type ActivityTipData,
    type DevelopmentAxis,
    type SafetyInstructionData,
} from "@features/activities/model/activity";
import type { ActivityMaterialData, MaterialData } from "@features/activities/model/material";
import { StepKind, type ActivityResourceData, type ActivityStepData } from "@features/activities/model/step";
import { ActivityTagType, type ActivityTagData } from "@features/activities/model/tag";
import type { ActivityWorkshopData } from "@features/activities/model/workshop";
import { createEmptyActivity } from "@features/admin/activities-authoring/model/activity.edit";
import {
    createCatalogueMaterial,
    createMaterialLink,
    materialNamed,
} from "@features/admin/activities-authoring/model/material.edit";
import { createEmptyStep, isBlankHtml } from "@features/admin/activities-authoring/model/step.edit";
import { createEmptyWorkshop } from "@features/admin/activities-authoring/model/workshop.edit";

/**
 * An activity sheet brought in as JSON — what the `fiche-to-json` skill writes from the Confluence
 * template. It reads as `ActivityData` does, family by family, except that tags, safety
 * instructions, tips and materials are names: the file is written before anything exists to point
 * at.
 */

// ── The sheet ───────────────────────────────────────────────────────────────────────────────

/**
 * The one format read. The skill writes it into `version`. Version 1 named safety tags, and gave
 * each step a tip, a visual brief and end criteria.
 */
export const SHEET_VERSION = 2;

export interface ActivitySheet {
    name: string;
    description: HTMLString;
    visualBrief: string;
    classification: {
        format: ActivityData["classification"]["format"];
        practices: ActivityData["classification"]["practices"];
        themes: string[];
    };
    imaginary: {
        rule: ActivityData["imaginary"]["rule"];
        universes: string[];
    };
    audience: ActivityAudience;
    supervision: ActivitySupervision;
    place: ActivityPlace;
    safety: { instructions: string[] };
    pedagogy: {
        goals: string[];
        idealFor: string[];
        development: Record<DevelopmentAxis, string[]>;
    };
    tips: string[];
    materials: SheetMaterial[];
    workshops: SheetWorkshop[];
    steps: SheetStep[];
}

export interface SheetMaterial {
    name: string;
    quantity: string;
}

export interface SheetWorkshop {
    name: string;
    theme: string;
    challenges: HTMLString;
    adultsRequired: number;
    /** Names from the sheet's materials. */
    materials: string[];
}

export interface SheetStep {
    kind: StepKind;
    title: string;
    duration: number;
    description: HTMLString;
    actions: string[];
    /** Names from the sheet's materials. */
    materials: string[];
}

// ── Reading one ─────────────────────────────────────────────────────────────────────────────

/** What is wrong with a file, and where. `code` picks the message in the locales. */
export interface SheetProblem {
    /** Where in the file, as `steps[2].kind`. Empty for the file as a whole. */
    path: string;
    code: "json" | "version" | "required" | "object" | "text" | "number" | "boolean" | "list" | "choice";
    /** The value refused, for `choice` and `version`. */
    value?: string;
}

export type SheetReading =
    | { sheet: ActivitySheet; problems: [] }
    | { sheet: null; problems: SheetProblem[] };

type Fields = Record<string, unknown>;

/**
 * Read a file's text as a sheet. Every problem is collected rather than stopping at the first, so
 * the author fixes the file once. Anything missing or `null` is unset; only `name` is required.
 * Keys the format does not know are ignored.
 */
export function readActivitySheet(text: string): SheetReading {
    let json: unknown;
    try {
        json = JSON.parse(text);
    } catch {
        return { sheet: null, problems: [{ path: "", code: "json" }] };
    }

    const read = createReader();
    const root = read.object(json, "");

    const version = root.version;
    if (version !== undefined && version !== SHEET_VERSION)
        read.problems.push({ path: "version", code: "version", value: String(version) });

    const classification = read.object(root.classification, "classification");
    const imaginary = read.object(root.imaginary, "imaginary");
    const audience = read.object(root.audience, "audience");
    const supervision = read.object(root.supervision, "supervision");
    const place = read.object(root.place, "place");
    const safety = read.object(root.safety, "safety");
    const pedagogy = read.object(root.pedagogy, "pedagogy");
    const development = read.object(pedagogy.development, "pedagogy.development");

    const name = read.text(root.name, "name");
    if (!name.trim())
        read.problems.push({ path: "name", code: "required" });

    const sheet: ActivitySheet = {
        name: name.trim(),
        description: read.text(root.description, "description"),
        visualBrief: read.text(root.visualBrief, "visualBrief"),
        classification: {
            format: read.choice(classification.format, "classification.format", ActivityFormat),
            practices: read.choices(classification.practices, "classification.practices", ActivityPractice),
            themes: read.texts(classification.themes, "classification.themes"),
        },
        imaginary: {
            rule: read.choice(imaginary.rule, "imaginary.rule", ImaginaryRule),
            universes: read.texts(imaginary.universes, "imaginary.universes"),
        },
        audience: {
            ageMin: read.number(audience.ageMin, "audience.ageMin"),
            ageMax: read.number(audience.ageMax, "audience.ageMax"),
            participantsMin: read.number(audience.participantsMin, "audience.participantsMin"),
            participantsMax: read.number(audience.participantsMax, "audience.participantsMax"),
            childrenPace: read.choice(audience.childrenPace, "audience.childrenPace", ChildrenPace),
            ageVariants: read.text(audience.ageVariants, "audience.ageVariants"),
        },
        supervision: {
            hostEffort: read.choice(supervision.hostEffort, "supervision.hostEffort", HostEffort),
            hostsRequired: read.number(supervision.hostsRequired, "supervision.hostsRequired"),
            crossSupervision: read.flag(supervision.crossSupervision, "supervision.crossSupervision"),
            notes: read.text(supervision.notes, "supervision.notes"),
        },
        place: {
            indoor: read.flag(place.indoor, "place.indoor"),
            outdoor: read.flag(place.outdoor, "place.outdoor"),
            locations: read.choices(place.locations, "place.locations", ActivityLocation),
            conditions: read.text(place.conditions, "place.conditions"),
            seasons: read.choices(place.seasons, "place.seasons", ActivitySeason),
        },
        safety: {
            instructions: read.texts(safety.instructions, "safety.instructions"),
        },
        pedagogy: {
            goals: read.texts(pedagogy.goals, "pedagogy.goals"),
            idealFor: read.texts(pedagogy.idealFor, "pedagogy.idealFor"),
            development: Object.fromEntries(DEVELOPMENT_AXES.map(axis =>
                [axis, read.texts(development[axis], `pedagogy.development.${axis}`)],
            )) as Record<DevelopmentAxis, string[]>,
        },
        tips: read.texts(root.tips, "tips"),
        materials: read.list(root.materials, "materials", (value, path) => {
            const material = read.object(value, path);
            return {
                name: read.text(material.name, `${path}.name`).trim(),
                quantity: read.text(material.quantity, `${path}.quantity`),
            };
        }).filter(material => material.name),
        workshops: read.list(root.workshops, "workshops", (value, path) => {
            const workshop = read.object(value, path);
            const workshopName = read.text(workshop.name, `${path}.name`).trim();
            if (!workshopName)
                read.problems.push({ path: `${path}.name`, code: "required" });

            return {
                name: workshopName,
                theme: read.text(workshop.theme, `${path}.theme`),
                challenges: read.text(workshop.challenges, `${path}.challenges`),
                adultsRequired: read.number(workshop.adultsRequired, `${path}.adultsRequired`),
                materials: read.texts(workshop.materials, `${path}.materials`),
            };
        }),
        steps: read.list(root.steps, "steps", (value, path) => {
            const step = read.object(value, path);
            const title = read.text(step.title, `${path}.title`).trim();
            const description = read.text(step.description, `${path}.description`);
            // The collection requires a description, and a title can stand in for one.
            if (!title && !description.trim())
                read.problems.push({ path: `${path}.title`, code: "required" });

            return {
                // A step the file does not type is one the author wrote freely.
                kind: read.choice(step.kind, `${path}.kind`, StepKind) ?? StepKind.CUSTOM,
                title,
                duration: read.number(step.duration, `${path}.duration`),
                description,
                actions: read.texts(step.actions, `${path}.actions`),
                materials: read.texts(step.materials, `${path}.materials`),
            };
        }),
    };

    if (read.problems.length)
        return { sheet: null, problems: read.problems };

    return { sheet, problems: [] };
}

/**
 * Typed reads over untrusted JSON. Each one records what it refused and hands back the unset
 * value instead, so reading carries on past a problem.
 */
function createReader() {
    const problems: SheetProblem[] = [];

    const isUnset = (value: unknown) => value === undefined || value === null;

    function object(value: unknown, path: string): Fields {
        if (isUnset(value)) return {};
        if (typeof value === "object" && !Array.isArray(value)) return value as Fields;

        problems.push({ path, code: "object" });
        return {};
    }

    function text(value: unknown, path: string): string {
        if (isUnset(value)) return "";
        if (typeof value === "string") return value;

        problems.push({ path, code: "text" });
        return "";
    }

    function number(value: unknown, path: string): number {
        if (isUnset(value)) return 0;
        if (typeof value === "number" && Number.isFinite(value) && value >= 0) return value;

        problems.push({ path, code: "number" });
        return 0;
    }

    function flag(value: unknown, path: string): boolean {
        if (isUnset(value)) return false;
        if (typeof value === "boolean") return value;

        problems.push({ path, code: "boolean" });
        return false;
    }

    function list<T>(value: unknown, path: string, item: (value: unknown, path: string) => T): T[] {
        if (isUnset(value)) return [];
        if (Array.isArray(value)) return value.map((entry, index) => item(entry, `${path}[${index}]`));

        problems.push({ path, code: "list" });
        return [];
    }

    /** One of an enum's values, or `null` for none — which a file may also write as `""`. */
    function choice<T extends string>(value: unknown, path: string, options: Record<string, T>): T | null {
        if (isUnset(value) || value === "") return null;
        if (Object.values<string>(options).includes(value as string)) return value as T;

        problems.push({ path, code: "choice", value: String(value) });
        return null;
    }

    function choices<T extends string>(value: unknown, path: string, options: Record<string, T>): T[] {
        const picked = list(value, path, (entry, entryPath) => choice(entry, entryPath, options));
        return [...new Set(picked.filter((entry): entry is T => entry !== null))];
    }

    /** Names, trimmed; a blank one is dropped rather than refused. */
    function texts(value: unknown, path: string): string[] {
        const names = list(value, path, (entry, entryPath) => text(entry, entryPath).trim());
        return names.filter(Boolean);
    }

    return { problems, object, text, number, flag, list, choice, choices, texts };
}

// ── Turning it into records ─────────────────────────────────────────────────────────────────

/** The reference data a sheet's names are matched against. */
export interface SheetReferences {
    tags: ActivityTagData[];
    safetyInstructions: SafetyInstructionData[];
    tips: ActivityTipData[];
}

/** Which catalogue a name is looked up in: a kind of tag, the safety instructions or the tips. */
export type ReferenceKind = ActivityTagType | 'SAFETY' | 'TIP';

/** A name the sheet gives that nothing of its kind answers to. */
export interface UnknownReference {
    kind: ReferenceKind;
    /** What kind of thing it should have been, as a translation key. */
    label: string;
    name: string;
}

/**
 * What the author linked in place of names that matched nothing: the id of one of the same kind,
 * by `referenceKey`. A name with no pick is left off.
 */
export type ReferencePicks = Record<string, string>;

/** The key a pick is held under. Two spellings of one name, in one kind, share it. */
export function referenceKey(reference: Pick<UnknownReference, 'kind' | 'name'>): string {
    return `${reference.kind}:${key(reference.name)}`;
}

/** What a name of that kind may be linked to instead, by name. */
export function referenceCandidates(known: SheetReferences, kind: ReferenceKind): { id: string; name: string }[] {
    const candidates = kind === 'SAFETY' ? known.safetyInstructions
        : kind === 'TIP' ? known.tips
        : known.tags.filter(tag => tag.type === kind);

    return [...candidates].sort((a, b) => a.name.localeCompare(b.name));
}

export interface SheetActivity {
    /** The activity, its references resolved. Its materials, steps and workshops are `draftFromSheet`'s. */
    activity: ActivityData;
    /** What the sheet named that does not exist, each once — picked or not, so a pick can change. */
    unknown: UnknownReference[];
}

/**
 * The activity a sheet describes. Tags, safety instructions and tips are reference data, so a name
 * matches an existing one of the same kind by name or slug, whatever the case. One that matches
 * nothing is reported, and links what the author picked for it, or nothing: it is never created.
 */
export function activityFromSheet(sheet: ActivitySheet, known: SheetReferences, picks: ReferencePicks = {}): SheetActivity {
    const unknown: UnknownReference[] = [];

    function matching<T extends { id: string; name: string; slug?: string }>(kind: ReferenceKind, label: string, candidates: T[], names: string[]): T[] {
        const found: T[] = [];

        for (const name of names) {
            const match = candidates.find(candidate => key(candidate.name) === key(name) || key(candidate.slug) === key(name));
            if (match) {
                found.push(match);
                continue;
            }

            const reference = { kind, label, name };
            if (!unknown.some(other => referenceKey(other) === referenceKey(reference)))
                unknown.push(reference);

            const picked = candidates.find(candidate => candidate.id === picks[referenceKey(reference)]);
            if (picked) found.push(picked);
        }

        return distinctById(found);
    }

    function tags(type: ActivityTagType, names: string[]): ActivityTagData[] {
        return matching(type, `activities.tagType.${type}`, known.tags.filter(tag => tag.type === type), names);
    }

    const development = Object.fromEntries(DEVELOPMENT_AXES.map(axis =>
        [axis, tags(axis, sheet.pedagogy.development[axis])],
    )) as Record<DevelopmentAxis, ActivityTagData[]>;

    const activity: ActivityData = {
        ...createEmptyActivity(),
        name: sheet.name,
        description: sheet.description,
        visualBrief: sheet.visualBrief,
        classification: {
            format: sheet.classification.format,
            practices: sheet.classification.practices,
            themes: tags(ActivityTagType.THEME, sheet.classification.themes),
        },
        imaginary: {
            rule: sheet.imaginary.rule,
            universes: tags(ActivityTagType.IMAGINARY, sheet.imaginary.universes),
        },
        audience: { ...sheet.audience },
        supervision: { ...sheet.supervision },
        place: { ...sheet.place },
        safety: {
            instructions: matching('SAFETY', 'activities.fields.safetyInstructions', known.safetyInstructions, sheet.safety.instructions),
        },
        pedagogy: {
            goals: tags(ActivityTagType.GOAL, sheet.pedagogy.goals),
            idealFor: tags(ActivityTagType.IDEAL_FOR, sheet.pedagogy.idealFor),
            development,
        },
        tips: matching('TIP', 'activities.tips.title', known.tips, sheet.tips),
    };

    return { activity, unknown };
}

/** A field the import leaves empty, for the author to fill in the editor. */
export interface UnsetField {
    /** The field's label, as a translation key. */
    label: string;
    /** For a step field: the titles of the steps missing it. */
    steps?: string[];
}

/**
 * What the activity still lacks, in the editor's order. A field that only applies to some
 * activities is listed only for those: practices and supervision notes for a workshop, universes
 * when the imaginary is imposed.
 */
export function unsetFields(activity: ActivityData, steps: Pick<SheetStep, 'title' | 'duration'>[]): UnsetField[] {
    const { classification, imaginary, audience, supervision, place, safety, pedagogy } = activity;
    const isWorkshop = classification.format === ActivityFormat.WORKSHOP;
    const untimed = steps.filter(step => !step.duration).map(step => step.title);

    const checks: [boolean, string][] = [
        [!activity.visualBrief.trim(), 'activities.fields.visualBrief'],
        [isBlankHtml(activity.description), 'activities.authoring.description'],
        [!classification.format, 'activities.fields.format'],
        [!classification.themes.length, 'activities.tagType.THEME'],
        [isWorkshop && !classification.practices.length, 'activities.fields.practices'],
        [!imaginary.rule, 'activities.fields.imaginaryRule'],
        [imaginary.rule === ImaginaryRule.REQUIRED && !imaginary.universes.length, 'activities.tagType.IMAGINARY'],
        [!audience.ageMin && !audience.ageMax, 'activities.fields.age'],
        [!audience.participantsMin && !audience.participantsMax, 'activities.fields.participants'],
        [!audience.childrenPace, 'activities.fields.childrenPace'],
        [isBlankHtml(audience.ageVariants), 'activities.fields.ageVariants'],
        [!supervision.hostEffort, 'activities.fields.hostEffort'],
        [!supervision.hostsRequired, 'activities.fields.hosts'],
        [isWorkshop && isBlankHtml(supervision.notes), 'activities.fields.supervisionNotes'],
        [!place.indoor && !place.outdoor, 'activities.authoring.import.unset.indoorOutdoor'],
        [!place.seasons.length, 'activities.fields.seasons'],
        [!place.locations.length, 'activities.fields.locations'],
        [isBlankHtml(place.conditions), 'activities.fields.conditions'],
        [!safety.instructions.length, 'activities.fields.safetyInstructions'],
        [!pedagogy.goals.length, 'activities.tagType.GOAL'],
        [!pedagogy.idealFor.length, 'activities.tagType.IDEAL_FOR'],
        [DEVELOPMENT_AXES.every(axis => !pedagogy.development[axis].length), 'activities.families.development'],
        [!activity.tips.length, 'activities.tips.title'],
        [!steps.length, 'activities.steps.title'],
    ];

    return [
        ...checks.filter(([unset]) => unset).map(([, label]) => ({ label })),
        ...(untimed.length ? [{ label: 'activities.steps.fields.duration', steps: untimed }] : []),
    ];
}

/**
 * Every material the activity needs: the sheet's list, then whatever a step or workshop recalls
 * that the list forgot — the template has the author repeat names, and a slip should not lose one.
 * Matched whatever the case; the first spelling seen is kept.
 */
export function materialsOfSheet(sheet: ActivitySheet): SheetMaterial[] {
    const recalled = [...sheet.steps, ...sheet.workshops]
        .flatMap(holder => holder.materials)
        .map(name => ({ name, quantity: "" }));

    const byKey = new Map<string, SheetMaterial>();
    for (const material of [...sheet.materials, ...recalled]) {
        if (!byKey.has(key(material.name)))
            byKey.set(key(material.name), material);
    }

    return [...byKey.values()];
}

/** The activity's own materials a step or workshop recalls by name, each once. */
function materialsNamed(materials: ActivityMaterialData[], names: string[]): ActivityMaterialData[] {
    const wanted = names.map(key);
    const named = wanted.flatMap(name => materials.filter(material => key(material.name) === name));
    return distinctById(named);
}

/** The activity a sheet describes, with everything under it, ready for one save. */
export interface SheetDraft {
    /** The activity with its material links, steps and workshops, each under the id to create it with. */
    activity: ActivityData;
    /** The names the sheet needs that the catalogue does not have. */
    newMaterials: MaterialData[];
}

/**
 * The files picked for a sheet's step, which a file cannot carry. They point at the step, so the
 * step's id is chosen with them.
 */
export interface SheetStepFiles {
    id: string;
    resources: ActivityResourceData[];
}

/**
 * Hang the sheet's materials, steps and workshops off its activity. Each material is the
 * catalogue's of that name, whatever the case, or a new one when the catalogue has none; steps and
 * workshops recall the links by name.
 *
 * @param activity the sheet's activity, with its id and author
 * @param catalogue every catalogue material
 * @param stepFiles the files picked for each step, by the step's position in the sheet
 */
export function draftFromSheet(
    sheet: ActivitySheet,
    activity: ActivityData,
    catalogue: MaterialData[],
    newId: IdFactory,
    stepFiles: SheetStepFiles[] = [],
): SheetDraft {
    const newMaterials: MaterialData[] = [];

    const materials = materialsOfSheet(sheet).map(({ name, quantity }) => {
        let material = materialNamed(catalogue, name) ?? materialNamed(newMaterials, name);
        if (!material) {
            material = createCatalogueMaterial(newId(), name);
            newMaterials.push(material);
        }
        return createMaterialLink(newId(), activity.id, material, quantity);
    });

    const steps = sheet.steps.map((step, index) => {
        const files = stepFiles[index];
        const created = stepFromSheet(step, files?.id ?? newId(), activity.id, materials);
        return { ...created, resources: files?.resources ?? [] };
    });
    const workshops = sheet.workshops.map(workshop => workshopFromSheet(workshop, newId(), activity.id, materials));

    return { activity: { ...activity, materials, steps, workshops }, newMaterials };
}

/**
 * A sheet's step, under an activity whose materials it recalls. Most steps of the template are a
 * title over actions, but the collection refuses a blank description: the title stands in for one.
 */
export function stepFromSheet(
    step: SheetStep,
    id: string,
    activity: string,
    materials: ActivityMaterialData[],
): ActivityStepData {
    const description = step.description.trim() ? step.description : `<p>${escapeHtml(step.title)}</p>`;

    return {
        ...createEmptyStep(id, activity),
        kind: step.kind,
        title: step.title,
        duration: step.duration,
        description,
        actions: step.actions,
        materials: materialsNamed(materials, step.materials),
    };
}

/** A sheet's workshop, the same way. */
function workshopFromSheet(
    workshop: SheetWorkshop,
    id: string,
    activity: string,
    materials: ActivityMaterialData[],
): ActivityWorkshopData {
    return {
        ...createEmptyWorkshop(id, activity, workshop.name),
        theme: workshop.theme,
        challenges: workshop.challenges,
        adults_required: workshop.adultsRequired,
        materials: materialsNamed(materials, workshop.materials),
    };
}

function escapeHtml(text: string): string {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Comparison key: two spellings of the same name share one. */
function key(name: string | undefined): string {
    return (name ?? "").trim().toLowerCase();
}
