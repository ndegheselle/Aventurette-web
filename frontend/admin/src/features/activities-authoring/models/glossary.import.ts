import type { HTMLString } from "@/backend/schema.g";
import type { IdFactory } from "@chapelure/core";
import type { SafetyInstructionData } from "@features/activities/models/activity";
import type { ActivityTipData } from "@features/activities/models/step";
import type { ActivityTagData, ActivityTagType } from "@features/activities/models/tag";

/**
 * The vocabulary fiches refer to, and the `glossary.json` an import may bring to change it. An
 * entry is known by its identifier — a tag's within its kind — which is its `slug` here.
 */

/** What the catalogues hold: a fiche's identifiers are looked up in them. */
export interface References {
    tags: ActivityTagData[];
    safetyInstructions: SafetyInstructionData[];
    tips: ActivityTipData[];
}

// ── The file ────────────────────────────────────────────────────────────────────────────────

/** `glossary.json`, as `docs/user/import/glossary.schema.json` describes it. */
export interface GlossaryFile {
    schema: 'aventurette.glossary.v1';
    tags: { kind: ActivityTagType; id: string; name: string }[];
    tips: GlossaryEntry[];
    safety: GlossaryEntry[];
}

export interface GlossaryEntry {
    id: string;
    name: string;
    description: HTMLString;
}

// ── What it changes ─────────────────────────────────────────────────────────────────────────

/** The writes a glossary comes down to, per catalogue. */
export interface GlossaryChanges<T> {
    /** New entries, each under the id it is created with. */
    create: T[];
    /** Known entries whose name or description the glossary changes. */
    update: T[];
}

export interface GlossaryPlan {
    tags: GlossaryChanges<ActivityTagData>;
    tips: GlossaryChanges<ActivityTipData>;
    safety: GlossaryChanges<SafetyInstructionData>;
    /** Identifiers the file gives twice, as `kind:id` for a tag. */
    duplicates: string[];
}

/** The plan of a zip with no glossary. */
export const NO_GLOSSARY: GlossaryPlan = {
    tags: { create: [], update: [] },
    tips: { create: [], update: [] },
    safety: { create: [], update: [] },
    duplicates: [],
};

/**
 * What applying `file` to the catalogues writes. An entry is found by its identifier: a known one
 * takes the file's name and description when they differ, an unknown one is created. An entry the
 * file leaves out is kept: fiches already imported may still point at it.
 */
export function planGlossary(file: GlossaryFile, known: References, newId: IdFactory): GlossaryPlan {
    const duplicates: string[] = [];
    const seen = new Set<string>();
    const firstTime = (key: string) => {
        if (seen.has(key)) {
            duplicates.push(key);
            return false;
        }
        seen.add(key);
        return true;
    };

    const tags = changes(
        file.tags.filter(entry => firstTime(`${entry.kind}:${entry.id}`)),
        entry => known.tags.find(tag => tag.type === entry.kind && tag.slug === entry.id),
        (tag, entry) => tag.name !== entry.name,
        entry => ({ id: newId(), type: entry.kind, slug: entry.id, name: entry.name }) as ActivityTagData,
        (tag, entry) => ({ ...tag, name: entry.name }),
    );

    const described = <T extends { slug?: string; name: string; description?: HTMLString }>(
        entries: GlossaryEntry[],
        catalogue: T[],
        kind: string,
    ) => changes(
        entries.filter(entry => firstTime(`${kind}:${entry.id}`)),
        entry => catalogue.find(item => item.slug === entry.id),
        (item, entry) => item.name !== entry.name || (item.description ?? '') !== entry.description,
        entry => ({ id: newId(), slug: entry.id, name: entry.name, description: entry.description }) as unknown as T,
        (item, entry) => ({ ...item, name: entry.name, description: entry.description }),
    );

    return {
        tags,
        tips: described(file.tips, known.tips, 'tip'),
        safety: described(file.safety, known.safetyInstructions, 'safety'),
        duplicates,
    };
}

function changes<E, T>(
    entries: E[],
    find: (entry: E) => T | undefined,
    differs: (item: T, entry: E) => boolean,
    create: (entry: E) => T,
    update: (item: T, entry: E) => T,
): GlossaryChanges<T> {
    const plan: GlossaryChanges<T> = { create: [], update: [] };

    for (const entry of entries) {
        const item = find(entry);
        if (!item) plan.create.push(create(entry));
        else if (differs(item, entry)) plan.update.push(update(item, entry));
    }

    return plan;
}

/** The catalogues once `plan` is written: what a fiche of the same zip is checked against. */
export function referencesAfter(known: References, plan: GlossaryPlan): References {
    const merged = <T extends { id: string }>(items: T[], { create, update }: GlossaryChanges<T>) =>
        [...items.map(item => update.find(changed => changed.id === item.id) ?? item), ...create];

    return {
        tags: merged(known.tags, plan.tags),
        tips: merged(known.tips, plan.tips),
        safetyInstructions: merged(known.safetyInstructions, plan.safety),
    };
}

/** How many entries a plan creates, and how many it changes. */
export function glossaryCounts(plan: GlossaryPlan): { created: number; updated: number } {
    const catalogues = [plan.tags, plan.tips, plan.safety];
    return {
        created: catalogues.reduce((sum, { create }) => sum + create.length, 0),
        updated: catalogues.reduce((sum, { update }) => sum + update.length, 0),
    };
}
