import { ValidationError } from '@chapelure/core';
import type { SafetyInstructionData } from '@features/activities/models/activity';
import type { ActivityTipData } from '@features/activities/models/step';
import type { ActivityTagData } from '@features/activities/models/tag';
import { safetyInstructionsApi } from '@features/catalogue-authoring/api/safety.api';
import { tagsApi } from '@features/catalogue-authoring/api/tags.api';
import { tipsApi } from '@features/catalogue-authoring/api/tips.api';
import { slugify } from '@features/catalogue-authoring/models/catalogue.edit';
import { materialCatalogueApi } from '@features/activities-authoring/api/materials.api';
import { referencesApi } from '@features/activities-authoring/api/references.api';
import { saveApi } from '@features/activities-authoring/api/save.api';
import { activityWrites } from '@features/activities-authoring/models/activity.edit';
import {
    activityFromSheet,
    draftFromSheet,
    materialsOfSheet,
    readActivitySheet,
    resourcesOfSheet,
    unsetFields,
    type SheetProblem,
    type SheetReferences,
    type SheetResourceFile,
    type SheetResourcePath,
    type SheetStepFiles,
    type UnknownReference,
} from '@features/activities-authoring/models/activity.import';
import { checkFiche, FicheFindingCode, type FicheFinding } from '@features/activities-authoring/models/fiche.check';
import { materialNamed } from '@features/activities-authoring/models/material.edit';
import { createResource } from '@features/activities-authoring/models/step.edit';
import sheetSchema from '@features/activities-authoring/mcp/activity-sheet.schema.json';
import instructions from '@features/activities-authoring/mcp/instructions.md?raw';

/**
 * The authoring tools the MCP server offers: what the import modal did, driven by an assistant
 * that reads the fiche itself. They hold the screen's orchestration, as a composable would; the
 * rules stay in `models/`.
 */

/**
 * What a tool answers: text for the assistant, flagged when nothing was done. A type rather than
 * an interface, so it fits the SDK's open-ended result.
 */
export type ToolResult = {
    content: { type: 'text'; text: string }[];
    isError?: boolean;
};

export interface McpTool {
    name: string;
    description: string;
    inputSchema: Record<string, unknown>;
    call(input: Record<string, unknown>): Promise<ToolResult>;
}

/** What the tools need from the process running them. */
export interface ToolContext {
    /** The signed-in admin, recorded as the activity's author. */
    authorId: string;
    /** A file on the author's disk, by absolute path. */
    readFile(path: string): Promise<File>;
    /** A message of the app's catalogue, in French. */
    translate(key: string, params?: Record<string, string>): string;
    /** Where the editor opens an activity. */
    editorUrl(id: string): string;
}

export function activityTools(context: ToolContext): McpTool[] {
    return [checkFicheTool(context), listReferencesTool(), previewActivityTool(context), saveActivityTool(context)];
}

function checkFicheTool(context: ToolContext): McpTool {
    return {
        name: 'check_fiche',
        description: 'Check one fiche d\'activité, as Markdown, against the Confluence template before mapping it: the '
            + 'sections and Informations rows it must have, the steps\' durations against the totals, placeholders and '
            + '« à valider » marks left in, and its resources (links to files that exist, not text). Call it first; '
            + 'when it finds something missing, tell the user before going on.',
        inputSchema: {
            type: 'object',
            additionalProperties: false,
            required: ['markdown'],
            properties: {
                markdown: { type: 'string', description: 'One fiche, from its title to its last step. Split a file holding several.' },
                folder: { type: 'string', description: 'Absolute path of the fiche\'s folder, to find the files its relative links point at.' },
            },
        },
        call: input => checkFicheInput(input, context),
    };
}

/** What each finding tells the assistant. */
const FINDING_MESSAGES: Record<FicheFindingCode, (finding: FicheFinding) => string> = {
    SECTION: ({ detail }) => `Missing section: ## ${detail}`,
    ROW: ({ detail }) => `Missing Informations row: ${detail}`,
    SUMMARY_LENGTH: ({ detail }) => `## Résumé is ${detail} characters; an activity takes 300 at most`,
    NO_STEPS: () => '## Étapes has no « ### N. title » step',
    STEP_DURATION: ({ where }) => `No « Durée estimée » in minutes: ${where}`,
    DURATION_TOTAL: ({ where, detail }) => `${where}: the steps add up to ${detail.replace(' / ', ' min, the row says ')} min`,
    PLACEHOLDER: ({ detail }) => `Template placeholder left in: ${detail}`,
    TO_VALIDATE: ({ detail }) => `Marked « à valider »: ${detail}`,
    RESOURCE_TEXT: ({ where }) => `Resources written as text, not links to files (${where}): export each and link it`,
    RESOURCE_WEB_LINK: ({ where, detail }) => `Resource linked to a web page, not a file (${where}): ${detail}`,
};

/** Findings that leave the import short of something, as opposed to ones to check. */
const MISSING: FicheFindingCode[] = [
    FicheFindingCode.SECTION, FicheFindingCode.ROW, FicheFindingCode.NO_STEPS, FicheFindingCode.STEP_DURATION,
    FicheFindingCode.RESOURCE_TEXT,
];

async function checkFicheInput(input: Record<string, unknown>, context: ToolContext): Promise<ToolResult> {
    const markdown = typeof input.markdown === 'string' ? input.markdown : '';
    const folder = typeof input.folder === 'string' ? input.folder : '';
    const { findings, links } = checkFiche(markdown);

    const unreadable: string[] = [];
    for (const link of links) {
        const path = isAbsolutePath(link.target) || !folder ? link.target : `${folder.replace(/[\\/]+$/, '')}/${link.target}`;
        if (!(await canRead(decodeURI(path), context))) unreadable.push(`${link.text || link.target} (${link.where}): ${path}`);
    }

    const missing = findings.filter(finding => MISSING.includes(finding.code));
    const toCheck = findings.filter(finding => !MISSING.includes(finding.code));
    const message = (finding: FicheFinding) => FINDING_MESSAGES[finding.code](finding);

    const lines = [
        missing.length || unreadable.length ? 'The fiche is incomplete.' : 'The fiche has everything the template asks for.',
        section('Missing', missing.map(message)),
        section('Linked files that cannot be read', unreadable),
        section('To check', toCheck.map(message)),
        section('Resources found', links.map(link => `${link.text || link.target} (${link.where})`)),
    ];
    return text(lines.filter(Boolean).join('\n\n'));
}

function isAbsolutePath(path: string): boolean {
    return /^([a-z]:[\\/]|[\\/])/i.test(path);
}

function listReferencesTool(): McpTool {
    return {
        name: 'list_references',
        description: 'The tags (by kind), safety instructions, tips and catalogue materials that already exist, by name. '
            + 'Read it before `save_activity`, so the sheet names them as the app does.',
        inputSchema: { type: 'object', properties: {} },
        async call() {
            const [known, materials] = await Promise.all([referencesApi.getAll(), materialCatalogueApi.getAll()]);
            const tags: Record<string, string[]> = {};
            for (const tag of known.tags) (tags[tag.type] ??= []).push(tag.name);

            return text(JSON.stringify({
                tags,
                safetyInstructions: known.safetyInstructions.map(instruction => instruction.name),
                tips: known.tips.map(tip => tip.name),
                materials: materials.map(material => material.name),
            }, null, 2));
        },
    };
}

function previewActivityTool(context: ToolContext): McpTool {
    return {
        name: 'preview_activity',
        description: 'A dry run of `save_activity`: the same input, and nothing is written. It answers what the save would '
            + 'link to the catalogues, what it would create there, which linked files it cannot read, and what would stay '
            + 'empty. Call it before `save_activity`, fix what it reports, then save.',
        inputSchema: saveInputSchema(),
        call: input => previewActivity(input, context),
    };
}

function saveActivityTool(context: ToolContext): McpTool {
    return {
        name: 'save_activity',
        description: instructions,
        inputSchema: saveInputSchema(),
        call: input => saveActivity(input, context),
    };
}

/** What `save_activity` and its dry run take: the sheet, and the files it links. */
function saveInputSchema(): Record<string, unknown> {
    const { $defs, $schema: _, title: __, ...sheet } = sheetSchema as Record<string, unknown>;

    return {
        type: 'object',
        additionalProperties: false,
        required: ['sheet'],
        properties: {
            sheet,
            visual: {
                type: 'string',
                description: 'Absolute path to the cover image (Informations row « Visuel principal »), when the fiche comes with one.',
            },
            resources: {
                type: 'array',
                description: 'The files the fiche links as resources, under `## Ressources` or a step\'s `#### Ressources`: '
                    + 'each by absolute path (resolve a relative link against the fiche\'s folder) and by the position of '
                    + 'the step that uses it in `sheet.steps`, from 0.',
                items: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['step', 'path'],
                    properties: {
                        step: { type: 'integer', minimum: 0 },
                        path: { type: 'string' },
                        name: {
                            type: 'string',
                            description: 'What the fiche calls the resource, such as the link\'s text or its row in the resources table. Omitted: the file\'s name.',
                        },
                    },
                },
            },
        },
        // `sheet`'s references point at the root, so its definitions are lifted there.
        $defs,
    };
}

async function previewActivity(input: Record<string, unknown>, context: ToolContext): Promise<ToolResult> {
    const reading = readActivitySheet(JSON.stringify(input.sheet ?? null));
    if (!reading.sheet) return refused(reading.problems, context, 'The sheet would be refused. Fix these:');

    const sheet = reading.sheet;
    const resources = resourcesOfSheet(sheet, (input.resources ?? []) as SheetResourcePath[]);
    if (!resources.files) return refused(resources.problems, context, 'The sheet would be refused. Fix these:');

    const paths = [
        ...(typeof input.visual === 'string' && input.visual ? [input.visual] : []),
        ...resources.files.flat().map(file => file.path),
    ];
    const unreadable = (await Promise.all(paths.map(async path => (await canRead(path, context)) ? null : path)))
        .filter((path): path is string => path !== null);

    const [known, catalogue] = await Promise.all([referencesApi.getAll(), materialCatalogueApi.getAll()]);
    const { activity, stepTips, unknown } = activityFromSheet(sheet, known);
    const { classification, imaginary, pedagogy, safety } = activity;
    const tag = (tag: ActivityTagData) => `${tag.name} (${context.translate(`activities.tagType.${tag.type}`)})`;
    const linkedTags = [
        ...classification.themes, ...imaginary.universes, ...pedagogy.goals, ...pedagogy.idealFor,
        ...Object.values(pedagogy.development).flat(),
    ];

    const lines = [
        unreadable.length ? 'Not ready: some linked files cannot be read.' : 'Ready to save.',
        section('Files that cannot be read', unreadable),
        section('Would link these tags', linkedTags.map(tag)),
        section('Would link these safety instructions', safety.instructions.map(instruction => instruction.name)),
        section('Would link these tips', sheet.steps.flatMap((step, index) =>
            (stepTips[index] ?? []).map(tip => `${tip.name} (${step.title})`))),
        section('Would create', unknown.map(reference => `${reference.name} (${context.translate(reference.label)})`)),
        section('Would add these materials to the catalogue', materialsOfSheet(sheet)
            .filter(material => !materialNamed(catalogue, material.name))
            .map(material => material.name)),
        section('Would attach these resources', resources.files.flatMap((files, index) =>
            files.map(file => `${file.name || basenameOf(file.path)} → ${sheet.steps[index]?.title ?? index}`))),
        section('Would stay empty', unsetFields(activity, sheet.steps).map(field => {
            const label = context.translate(field.label);
            return field.steps ? `${label} (${field.steps.join(', ')})` : label;
        })),
    ];
    return text(lines.filter(Boolean).join('\n\n'));
}

async function canRead(path: string, context: ToolContext): Promise<boolean> {
    try {
        await context.readFile(path);
        return true;
    } catch {
        return false;
    }
}

function basenameOf(path: string): string {
    return path.split(/[\\/]/).pop() ?? path;
}

async function saveActivity(input: Record<string, unknown>, context: ToolContext): Promise<ToolResult> {
    const reading = readActivitySheet(JSON.stringify(input.sheet ?? null));
    if (!reading.sheet) return refused(reading.problems, context);

    const sheet = reading.sheet;
    const resources = resourcesOfSheet(sheet, (input.resources ?? []) as SheetResourcePath[]);
    if (!resources.files) return refused(resources.problems, context);

    // Read every file before writing anything: a wrong path must not leave half a save behind.
    const visual = typeof input.visual === 'string' && input.visual ? await context.readFile(input.visual) : undefined;
    const stepFiles = await Promise.all(resources.files.map(files => filesOfStep(files, context)));

    const known = await referencesApi.getAll();
    const created = await createReferences(activityFromSheet(sheet, known).unknown);
    const preview = activityFromSheet(sheet, withCreated(known, created));

    const activity = { ...preview.activity, id: saveApi.newId(), user: context.authorId };
    const catalogue = await materialCatalogueApi.getAll();
    const draft = draftFromSheet(sheet, activity, catalogue, saveApi.newId, stepFiles, preview.stepTips);

    try {
        await saveApi.send(activityWrites(null, draft.activity, draft.newMaterials, visual));
    } catch (error) {
        if (!(error instanceof ValidationError)) throw error;
        return { isError: true, content: [{ type: 'text', text: `Nothing was saved: ${error.message}\n${JSON.stringify(error.fields, null, 2)}` }] };
    }

    return text(saveReport(context, {
        url: context.editorUrl(activity.id),
        created,
        unset: unsetFields(preview.activity, sheet.steps).map(field => {
            const label = context.translate(field.label);
            return field.steps ? `${label} (${field.steps.join(', ')})` : label;
        }),
        newMaterials: draft.newMaterials.map(material => material.name),
    }));
}

async function filesOfStep(given: SheetResourceFile[], context: ToolContext): Promise<SheetStepFiles> {
    const id = saveApi.newId();
    const files = await Promise.all(given.map(({ path }) => context.readFile(path)));
    // No preview to show: the stored file's own url replaces this one on the next read.
    const resources = files.map((file, index) => {
        const resource = createResource(saveApi.newId(), id, file, '');
        return { ...resource, name: given[index]?.name || resource.name };
    });
    return { id, resources };
}

interface CreatedReferences {
    tags: ActivityTagData[];
    safetyInstructions: SafetyInstructionData[];
    tips: ActivityTipData[];
}

/**
 * Add the tags, safety instructions and tips the sheet names to their catalogues, one by one.
 * Outside the activity's batch: an entry outliving a failed save is matched by name on the next
 * one.
 */
async function createReferences(missing: UnknownReference[]): Promise<CreatedReferences> {
    const created: CreatedReferences = { tags: [], safetyInstructions: [], tips: [] };

    for (const { kind, name, description } of missing) {
        if (kind === 'SAFETY') {
            const instruction = { name, slug: slugify(name), description } as SafetyInstructionData;
            created.safetyInstructions.push(await safetyInstructionsApi.create(instruction));
        } else if (kind === 'TIP') {
            created.tips.push(await tipsApi.create({ name, description } as ActivityTipData));
        } else {
            created.tags.push(await tagsApi.create({ type: kind, name, slug: slugify(name) } as ActivityTagData));
        }
    }

    return created;
}

function withCreated(known: SheetReferences, created: CreatedReferences): SheetReferences {
    return {
        tags: [...known.tags, ...created.tags],
        safetyInstructions: [...known.safetyInstructions, ...created.safetyInstructions],
        tips: [...known.tips, ...created.tips],
    };
}

interface SaveSummary {
    url: string;
    created: CreatedReferences;
    unset: string[];
    newMaterials: string[];
}

function saveReport(context: ToolContext, summary: SaveSummary): string {
    const lines = [
        `Saved as a draft: ${summary.url}`,
        section('Tags created', summary.created.tags.map(tag => `${tag.name} (${context.translate(`activities.tagType.${tag.type}`)})`)),
        section('Safety instructions created', summary.created.safetyInstructions.map(instruction => instruction.name)),
        section('Tips created', summary.created.tips.map(tip => tip.name)),
        section('Materials added to the catalogue', summary.newMaterials),
        section('Still empty, to fill in the editor', summary.unset),
    ];
    return lines.filter(Boolean).join('\n\n');
}

function section(title: string, items: string[]): string {
    return items.length ? `${title}:\n${items.map(item => `- ${item}`).join('\n')}` : '';
}

function refused(problems: SheetProblem[], context: ToolContext, lead = 'Nothing was saved. Fix these and call again:'): ToolResult {
    const messages = problems.map(problem => context.translate(
        `activities.authoring.import.problems.${problem.code}`,
        { path: problem.path, value: problem.value ?? '' },
    ));
    return { isError: true, content: [{ type: 'text', text: `${lead}\n${messages.map(message => `- ${message}`).join('\n')}` }] };
}

function text(value: string): ToolResult {
    return { content: [{ type: 'text', text: value }] };
}
