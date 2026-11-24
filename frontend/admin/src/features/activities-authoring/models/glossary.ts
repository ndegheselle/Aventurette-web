import type { HTMLString } from "@/backend/schema.g";
import { ActivityTagType } from "@features/activities/models/tag";
import {
    answersTo,
    type ReferenceKind,
    type SheetReferences,
} from "@features/activities-authoring/models/activity.import";
import { isBlankHtml } from "@features/activities-authoring/models/step.edit";
import { nameKey } from "@features/activities-authoring/models/material.edit";
import { aliasesOf, joinAliases } from "@features/catalogue-authoring/models/catalogue.edit";

/**
 * A glossary: the reference wording of the tags, safety instructions and tips, with the other
 * names each goes by. Loaded into the catalogues once, it lets every import link a fiche's
 * wording, the aliases included, rather than create a near duplicate.
 */

export interface GlossaryEntry {
    kind: ReferenceKind;
    name: string;
    aliases: string[];
    /** For a safety instruction or a tip. Ignored for a tag, which has none. */
    description: HTMLString;
}

/** A catalogue entry, whichever catalogue holds it. */
interface KnownEntry {
    id: string;
    name: string;
    slug?: string;
    aliases?: string;
    description?: HTMLString;
}

export interface GlossaryUpdate {
    kind: ReferenceKind;
    id: string;
    /** The entry's name in the catalogue, which the glossary does not rename. */
    name: string;
    aliases: string;
    /** Only when the entry had none. */
    description?: HTMLString;
}

/** An alias another entry of the same kind already answers to: left out, for the author to settle. */
export interface GlossaryConflict {
    kind: ReferenceKind;
    name: string;
    alias: string;
    /** The entry that answers to it. */
    other: string;
}

export interface GlossaryPlan {
    create: GlossaryEntry[];
    update: GlossaryUpdate[];
    /** Names already in the catalogue as the glossary has them. */
    unchanged: string[];
    conflicts: GlossaryConflict[];
}

/**
 * What loading a glossary writes. An entry is the catalogue's when its name or one of its aliases
 * is already there, in that kind: the glossary adds the aliases it lacks, and its name too when the
 * catalogue spells it otherwise, but renames nothing. A description fills an entry that has none.
 * The rest is created. An entry given twice is read as one.
 */
export function planGlossary(entries: GlossaryEntry[], known: SheetReferences): GlossaryPlan {
    const plan: GlossaryPlan = { create: [], update: [], unchanged: [], conflicts: [] };

    for (const entry of mergedEntries(entries)) {
        const candidates = candidatesOf(entry.kind, known);
        const existing = candidates.find(candidate => answersTo(candidate, entry.name))
            ?? candidates.find(candidate => entry.aliases.some(alias => answersTo(candidate, alias)));
        const others = candidates.filter(candidate => candidate !== existing);

        const wanted = existing ? [entry.name, ...entry.aliases] : entry.aliases;
        const aliases: string[] = [];
        for (const alias of wanted) {
            if (existing && answersTo(existing, alias)) continue;
            if (aliases.some(kept => nameKey(kept) === nameKey(alias))) continue;
            const other = others.find(candidate => answersTo(candidate, alias));
            if (other) plan.conflicts.push({ kind: entry.kind, name: entry.name, alias, other: other.name });
            else aliases.push(alias);
        }

        const description = entry.kind === "SAFETY" || entry.kind === "TIP" ? entry.description : "";

        if (!existing) {
            plan.create.push({ ...entry, aliases, description });
            continue;
        }

        const fillsDescription = !isBlankHtml(description) && isBlankHtml(existing.description);
        if (!aliases.length && !fillsDescription) {
            plan.unchanged.push(existing.name);
            continue;
        }

        plan.update.push({
            kind: entry.kind,
            id: existing.id,
            name: existing.name,
            aliases: joinAliases([...aliasesOf(existing), ...aliases]),
            ...(fillsDescription && { description }),
        });
    }

    return plan;
}

function candidatesOf(kind: ReferenceKind, known: SheetReferences): KnownEntry[] {
    if (kind === "SAFETY") return known.safetyInstructions;
    if (kind === "TIP") return known.tips;
    return known.tags.filter(tag => tag.type === kind);
}

/** Entries of one kind and one name, whatever the case, as one: their aliases together, the first description. */
function mergedEntries(entries: GlossaryEntry[]): GlossaryEntry[] {
    const byKey = new Map<string, GlossaryEntry>();

    for (const entry of entries) {
        const key = `${entry.kind}:${nameKey(entry.name)}`;
        const seen = byKey.get(key);
        if (!seen) {
            byKey.set(key, { ...entry, aliases: [...entry.aliases] });
            continue;
        }
        seen.aliases.push(...entry.aliases);
        if (isBlankHtml(seen.description)) seen.description = entry.description;
    }

    return [...byKey.values()];
}

/** The kinds a glossary entry may be: every kind of tag, then the two catalogues. */
export const GLOSSARY_KINDS: ReferenceKind[] = [...Object.values(ActivityTagType), "SAFETY", "TIP"];
