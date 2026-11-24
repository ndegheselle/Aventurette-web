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
    return [listReferencesTool(), saveActivityTool(context)];
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

function saveActivityTool(context: ToolContext): McpTool {
    const { $defs, $schema: _, title: __, ...sheet } = sheetSchema as Record<string, unknown>;

    return {
        name: 'save_activity',
        description: instructions,
        inputSchema: {
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
        },
        call: input => saveActivity(input, context),
    };
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

function refused(problems: SheetProblem[], context: ToolContext): ToolResult {
    const messages = problems.map(problem => context.translate(
        `activities.authoring.import.problems.${problem.code}`,
        { path: problem.path, value: problem.value ?? '' },
    ));
    return { isError: true, content: [{ type: 'text', text: `Nothing was saved. Fix these and call again:\n${messages.map(message => `- ${message}`).join('\n')}` }] };
}

function text(value: string): ToolResult {
    return { content: [{ type: 'text', text: value }] };
}
