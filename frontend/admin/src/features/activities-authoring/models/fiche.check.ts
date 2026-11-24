import { SUMMARY_MAX_LENGTH } from "@features/activities/models/activity";

/**
 * A fiche d'activité, checked as Markdown against the Confluence template before anything maps
 * it: the sections and rows it must have, its steps' durations against its totals, and its
 * resources. Read from a Markdown export, whose tables come out as aligned text: a row is found
 * by its label, not parsed.
 */

// ── What it finds ───────────────────────────────────────────────────────────────────────────

export const FicheFindingCode = {
    /** A section of the template is missing. `detail` is its title. */
    SECTION: "SECTION",
    /** A row of `## Informations` is missing. `detail` is its label. */
    ROW: "ROW",
    /** `## Résumé` is longer than an activity takes. `detail` is its length. */
    SUMMARY_LENGTH: "SUMMARY_LENGTH",
    /** `## Étapes` has no `### N. title`. */
    NO_STEPS: "NO_STEPS",
    /** A step gives no « Durée estimée » in minutes. */
    STEP_DURATION: "STEP_DURATION",
    /** The steps add up to another total than the row says. `detail`: "steps / row". */
    DURATION_TOTAL: "DURATION_TOTAL",
    /** A template placeholder left in. `detail` is the line. */
    PLACEHOLDER: "PLACEHOLDER",
    /** Something marked « à valider ». `detail` is the line. */
    TO_VALIDATE: "TO_VALIDATE",
    /** A resources section written as text rather than links to files. */
    RESOURCE_TEXT: "RESOURCE_TEXT",
    /** A resource linked to a web page. `detail` is the address. */
    RESOURCE_WEB_LINK: "RESOURCE_WEB_LINK",
} as const;
export type FicheFindingCode = typeof FicheFindingCode[keyof typeof FicheFindingCode];

export interface FicheFinding {
    code: FicheFindingCode;
    /** The section or the step it is in. Empty for the fiche as a whole. */
    where: string;
    detail: string;
}

/** A resource the fiche links to a file, for the caller to find on disk. */
export interface FicheLink {
    where: string;
    text: string;
    target: string;
}

export interface FicheCheck {
    findings: FicheFinding[];
    links: FicheLink[];
}

// ── The template ────────────────────────────────────────────────────────────────────────────

/** The sections every fiche has. `## Ateliers` and `## Ressources` are only there when needed. */
export const REQUIRED_SECTIONS = ["Résumé", "Description", "Informations", "Matériel", "Étapes"] as const;

/**
 * The rows of `## Informations`, by the start of their label: an export wraps a long label over
 * two lines, with the value's lines between its halves.
 */
export const REQUIRED_ROWS = [
    "Format",
    "Pratique",
    "Temps de jeu",
    "Lieu de pratique",
    "Thème",
    "Tags pédagogiques",
    "Idéal pour",
    "Rythme des enfants",
    "Mobilisation de l'animateur",
    "Âge",
    "Nombre d'animateurs requis",
    "Effectif recommandé",
    "Imaginaire",
    "Règle d'imaginaire",
    "Visuel principal",
    "Temps de préparation",
    "Sécurité",
    "Conditions de réalisation",
    "Configuration des ateliers",
    "Localisation détaillée",
    "Saison",
    "Développement physique",
    "Développement intellectuel",
    "Développement affectif",
    "Développement social",
    "Développement moral",
    "Développement spirituel",
    "Durées selon âge",
] as const;

// ── Checking one ────────────────────────────────────────────────────────────────────────────

interface Section {
    title: string;
    lines: string[];
}

/** One fiche's Markdown, from its title to its last step. */
export function checkFiche(markdown: string): FicheCheck {
    const findings: FicheFinding[] = [];
    const links: FicheLink[] = [];
    const sections = sectionsOf(markdown, 2);
    const section = (title: string) => sections.find(candidate => keyOf(candidate.title) === keyOf(title));

    for (const title of REQUIRED_SECTIONS) {
        if (!section(title)) findings.push({ code: FicheFindingCode.SECTION, where: "", detail: title });
    }

    const summary = section("Résumé");
    if (summary) {
        const length = plainText(summary.lines).length;
        if (length > SUMMARY_MAX_LENGTH)
            findings.push({ code: FicheFindingCode.SUMMARY_LENGTH, where: summary.title, detail: String(length) });
    }

    const informations = section("Informations");
    const rows = informations ? keyOf(informations.lines.join(" ")) : "";
    if (informations) {
        for (const label of REQUIRED_ROWS) {
            if (!rows.includes(keyOf(label)))
                findings.push({ code: FicheFindingCode.ROW, where: informations.title, detail: label });
        }
    }

    const steps = section("Étapes");
    if (steps) findings.push(...checkSteps(steps, rows));

    const resources = section("Ressources");
    if (resources) checkResources(resources, findings, links);
    for (const step of steps ? sectionsOf(steps.lines.join("\n"), 3) : []) {
        for (const own of sectionsOf(step.lines.join("\n"), 4)) {
            if (keyOf(own.title) === keyOf("Ressources"))
                checkResources({ title: step.title, lines: own.lines }, findings, links);
        }
    }

    const lines = markdown.split(/\r?\n/);
    lines.forEach((line, index) => {
        if (isPlaceholder(line))
            findings.push({ code: FicheFindingCode.PLACEHOLDER, where: "", detail: line.trim() });
        if (/\ba valider\b/.test(keyOf(line)))
            findings.push({ code: FicheFindingCode.TO_VALIDATE, where: "", detail: withRowStart(line, lines[index - 1]) });
    });

    return { findings, links };
}

/**
 * Each step's duration, then the totals: the steps preparing the game add up to « Temps de
 * préparation », the others to « Temps de jeu », when the row gives a number.
 */
function checkSteps(steps: Section, rows: string): FicheFinding[] {
    const findings: FicheFinding[] = [];
    const titled = sectionsOf(steps.lines.join("\n"), 3);
    if (!titled.length) return [{ code: FicheFindingCode.NO_STEPS, where: steps.title, detail: "" }];

    let preparation = 0;
    let play = 0;
    for (const step of titled) {
        const duration = durationOf(step.lines);
        if (duration === null) {
            findings.push({ code: FicheFindingCode.STEP_DURATION, where: step.title, detail: "" });
            continue;
        }
        if (keyOf(step.title).replace(/^\d+\.\s*/, "").startsWith("preparer")) preparation += duration;
        else play += duration;
    }

    const totals: [string, number][] = [["Temps de préparation", preparation], ["Temps de jeu", play]];
    for (const [label, sum] of totals) {
        const stated = rows.match(new RegExp(`${keyOf(label)}[^0-9]*?(\\d+)\\s*min`))?.[1];
        if (stated !== undefined && Number(stated) !== sum)
            findings.push({ code: FicheFindingCode.DURATION_TOTAL, where: label, detail: `${sum} / ${stated}` });
    }

    return findings;
}

/** A resources section is links to files: text with no link is a flattened table. */
function checkResources(section: Section, findings: FicheFinding[], links: FicheLink[]) {
    const text = section.lines.join("\n");
    const found = [...text.matchAll(/\[([^\]]*)\]\(([^)\s]+)\)/g)];

    if (!found.length) {
        if (plainText(section.lines)) findings.push({ code: FicheFindingCode.RESOURCE_TEXT, where: section.title, detail: "" });
        return;
    }

    for (const [, label = "", target = ""] of found) {
        if (/^https?:\/\//i.test(target)) findings.push({ code: FicheFindingCode.RESOURCE_WEB_LINK, where: section.title, detail: target });
        else links.push({ where: section.title, text: label.trim(), target });
    }
}

// ── Reading Markdown ────────────────────────────────────────────────────────────────────────

/** The headings of one level and what follows each, up to the next heading of that level or above. */
function sectionsOf(markdown: string, level: number): Section[] {
    const sections: Section[] = [];
    let current: Section | null = null;

    for (const line of markdown.split(/\r?\n/)) {
        const heading = line.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/);
        const depth = heading?.[1]?.length ?? 0;
        if (heading && depth <= level) {
            current = depth === level ? { title: heading[2] ?? "", lines: [] } : null;
            if (current) sections.push(current);
            continue;
        }
        current?.lines.push(line);
    }

    return sections;
}

/** « Durée estimée » followed by a number, in minutes. */
function durationOf(lines: string[]): number | null {
    const match = keyOf(lines.join(" ")).match(/duree estimee[^0-9]*(\d+)/);
    return match?.[1] ? Number(match[1]) : null;
}

/** A line that is only a template's ellipsis, or one of its « Ex. … » examples. */
function isPlaceholder(line: string): boolean {
    const trimmed = line.trim().replace(/^[-*]\s+/, "");
    return /^[*_]*(…|\.\.\.)[*_]*$/.test(trimmed) || /^ex\.\s/i.test(trimmed);
}

/**
 * A line, with the one before it when it carries on from it: an export wraps a table row over
 * several lines, and « à 6 [à valider] » alone does not say which row it is.
 */
function withRowStart(line: string, previous = ""): string {
    const onlyTheMark = /^[\s*_\\[]*à valider/i.test(line);
    const continues = (onlyTheMark || /^\s*[^A-ZÀ-Ý#*\-|\s]/.test(line)) && previous.trim();
    return (continues ? `${previous} ${line}` : line).replace(/\s+/g, " ").trim();
}

/** What a reader sees of some lines: no markup, single spaces. */
function plainText(lines: string[]): string {
    return lines.join(" ").replace(/[*_`\\]/g, "").replace(/\s+/g, " ").trim();
}

/** A comparable form of some words: lower case, no accents, single spaces. */
function keyOf(words: string): string {
    return words
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[’`]/g, "'")
        .replace(/\s+/g, " ")
        .trim();
}
