import type { HTMLString } from "@/backend/schema.g";
import { distinctById } from "@chapelure/core";
import { createEmptyActivity } from "@features/activities-authoring/model/activity.edit";
import { createEmptyStep } from "@features/activities-authoring/model/step.edit";
import { createEmptyWorkshop } from "@features/activities-authoring/model/workshop.edit";
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
    type DevelopmentAxis,
} from "@features/activities/model/activity";
import type { ActivityMaterialData } from "@features/activities/model/material";
import { EndCriterion, StepKind, type ActivityStepData } from "@features/activities/model/step";
import { ActivityTagType, type ActivityTagData } from "@features/activities/model/tag";
import type { ActivityWorkshopData } from "@features/activities/model/workshop";

/**
 * An activity sheet brought in as JSON — what the `fiche-to-json` skill writes from the Confluence
 * template. It reads as `ActivityData` does, family by family, except that tags and materials are
 * names: the file is written before anything exists to point at.
 */

// ── The sheet ───────────────────────────────────────────────────────────────────────────────

/** The one format read so far. The skill writes it into `version`. */
export const SHEET_VERSION = 1;

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
    safety: { tags: string[] };
    pedagogy: {
        goals: string[];
        idealFor: string[];
        development: Record<DevelopmentAxis, string[]>;
    };
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
    visualBrief: string;
    actions: string[];
    tip: HTMLString;
    /** Names from the sheet's materials. */
    materials: string[];
    endCriteria: EndCriterion[];
    endCriteriaOther: string;
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
            tags: read.texts(safety.tags, "safety.tags"),
        },
        pedagogy: {
            goals: read.texts(pedagogy.goals, "pedagogy.goals"),
            idealFor: read.texts(pedagogy.idealFor, "pedagogy.idealFor"),
            development: Object.fromEntries(DEVELOPMENT_AXES.map(axis =>
                [axis, read.texts(development[axis], `pedagogy.development.${axis}`)],
            )) as Record<DevelopmentAxis, string[]>,
        },
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
                kind: read.choice(step.kind, `${path}.kind`, StepKind) || StepKind.CUSTOM,
                title,
                duration: read.number(step.duration, `${path}.duration`),
                description,
                visualBrief: read.text(step.visualBrief, `${path}.visualBrief`),
                actions: read.texts(step.actions, `${path}.actions`),
                tip: read.text(step.tip, `${path}.tip`),
                materials: read.texts(step.materials, `${path}.materials`),
                endCriteria: read.choices(step.endCriteria, `${path}.endCriteria`, EndCriterion),
                endCriteriaOther: read.text(step.endCriteriaOther, `${path}.endCriteriaOther`),
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

    /** One of an enum's values, or `''` — what the backend stores for none. */
    function choice<T extends string>(value: unknown, path: string, options: Record<string, T>): T | "" {
        if (isUnset(value) || value === "") return "";
        if (Object.values<string>(options).includes(value as string)) return value as T;

        problems.push({ path, code: "choice", value: String(value) });
        return "";
    }

    function choices<T extends string>(value: unknown, path: string, options: Record<string, T>): T[] {
        const picked = list(value, path, (entry, entryPath) => choice(entry, entryPath, options));
        return [...new Set(picked.filter((entry): entry is T => entry !== ""))];
    }

    /** Names, trimmed; a blank one is dropped rather than refused. */
    function texts(value: unknown, path: string): string[] {
        const names = list(value, path, (entry, entryPath) => text(entry, entryPath).trim());
        return names.filter(Boolean);
    }

    return { problems, object, text, number, flag, list, choice, choices, texts };
}

// ── Turning it into records ─────────────────────────────────────────────────────────────────

/** A tag the sheet names that no tag of its kind answers to. */
export interface UnknownTag {
    type: ActivityTagType;
    name: string;
}

export interface SheetActivity {
    /** The activity to write, its tags resolved. Steps, materials and workshops come after it. */
    activity: ActivityData;
    /** What the sheet named that is not a tag yet — left off, since tags are never written here. */
    unknownTags: UnknownTag[];
}

/**
 * The activity a sheet describes. Tags are reference data, so a name matches an existing tag of
 * the same kind by name or slug, whatever the case, and one that matches nothing is reported and
 * left off rather than created.
 */
export function activityFromSheet(sheet: ActivitySheet, known: ActivityTagData[]): SheetActivity {
    const unknownTags: UnknownTag[] = [];

    function tags(type: ActivityTagType, names: string[]): ActivityTagData[] {
        const ofType = known.filter(tag => tag.type === type);
        const found: ActivityTagData[] = [];

        for (const name of names) {
            const tag = ofType.find(candidate => key(candidate.name) === key(name) || key(candidate.slug) === key(name));
            if (tag) found.push(tag);
            else unknownTags.push({ type, name });
        }

        return distinctById(found);
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
        safety: { tags: tags(ActivityTagType.SECURITY, sheet.safety.tags) },
        pedagogy: {
            goals: tags(ActivityTagType.GOAL, sheet.pedagogy.goals),
            idealFor: tags(ActivityTagType.IDEAL_FOR, sheet.pedagogy.idealFor),
            development,
        },
    };

    return { activity, unknownTags };
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
export function materialsNamed(materials: ActivityMaterialData[], names: string[]): ActivityMaterialData[] {
    const wanted = names.map(key);
    const named = wanted.flatMap(name => materials.filter(material => key(material.name) === name));
    return distinctById(named);
}

/**
 * A sheet's step, ready to write under an activity whose materials already exist. Most steps of
 * the template are a title over actions, but the collection refuses a blank description: the
 * title stands in for one.
 */
export function stepFromSheet(step: SheetStep, activity: string, materials: ActivityMaterialData[]): ActivityStepData {
    const description = step.description.trim() ? step.description : `<p>${escapeHtml(step.title)}</p>`;

    return {
        ...createEmptyStep(activity),
        kind: step.kind,
        title: step.title,
        duration: step.duration,
        description,
        visual_brief: step.visualBrief,
        actions: step.actions,
        tip: step.tip,
        end_criteria: step.endCriteria,
        end_criteria_other: step.endCriteriaOther,
        materials: materialsNamed(materials, step.materials),
    };
}

/** A sheet's workshop, ready to write the same way. */
export function workshopFromSheet(
    workshop: SheetWorkshop,
    activity: string,
    materials: ActivityMaterialData[],
): ActivityWorkshopData {
    return {
        ...createEmptyWorkshop(activity, workshop.name),
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
