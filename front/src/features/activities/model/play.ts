import type { HTMLString } from "@/backend/schema.g";
import type { ActivityData } from "@features/activities/model/activity";
import type { ActivityMaterialData } from "@features/activities/model/material";
import { StepKind, type ActivityResourceData, type ActivityStepData } from "@features/activities/model/step";

// ── The steps of a run ──────────────────────────────────────────────────────────────────────

/**
 * The steps the template has the app produce rather than the author write. They exist only
 * while an activity is being run: nothing in the data stands for them.
 */
export const GeneratedStepKind = {
    GATHER_MATERIAL: 'GATHER_MATERIAL',
    GATHER_CHILDREN: 'GATHER_CHILDREN',
} as const;
export type GeneratedStepKind = typeof GeneratedStepKind[keyof typeof GeneratedStepKind];

/**
 * One step as the run screen shows it, whether the author wrote it or the app generated it.
 * A generated step has no `title`: its kind is what it reads as.
 */
export interface PlayStep {
    /** Unique within the run: the authored step's id, or the generated step's kind. */
    key: string;
    kind: StepKind | GeneratedStepKind;
    title: string;
    description: HTMLString;
    /** Estimated, in minutes. 0 is not estimated. */
    duration: number;
    actions: string[];
    materials: ActivityMaterialData[];
    resources: ActivityResourceData[];
}

/** Whether the app produced the step, rather than the author writing it. */
export function isGenerated(step: Pick<PlayStep, 'kind'>): boolean {
    return Object.values<string>(GeneratedStepKind).includes(step.kind);
}

/** A material as an action to tick while gathering it: its name, then how much of it. */
function materialAction(material: Pick<ActivityMaterialData, 'name' | 'quantity'>): string {
    return material.quantity ? `${material.name} — ${material.quantity}` : material.name;
}

function generatedStep(kind: GeneratedStepKind, actions: string[] = []): PlayStep {
    return {
        key: kind,
        kind,
        title: '',
        description: '',
        duration: 0,
        actions,
        materials: [],
        resources: [],
    };
}

function authoredStep(step: ActivityStepData): PlayStep {
    return {
        key: step.id,
        kind: step.kind,
        title: step.title,
        description: step.description,
        duration: step.duration || 0,
        actions: step.actions,
        materials: step.materials,
        resources: step.resources,
    };
}

/**
 * Every step of a run, in the order the animator goes through them. Gathering the material
 * comes first, before anything is set up, and only when there is material to gather. Gathering
 * the children comes once the game is ready: before the first step that is not preparing it,
 * and not at all when every step is.
 */
export function playStepsOf(activity: Pick<ActivityData, 'steps' | 'materials'> | null | undefined): PlayStep[] {
    if (!activity) return [];

    const steps = activity.steps.map(authoredStep);

    // Spliced before anything is put in front: the index counts the authored steps only.
    const firstWithChildren = activity.steps.findIndex(step => step.kind !== StepKind.PREPARE);
    if (firstWithChildren !== -1)
        steps.splice(firstWithChildren, 0, generatedStep(GeneratedStepKind.GATHER_CHILDREN));

    if (activity.materials.length) {
        const gathering = activity.materials.map(materialAction);
        steps.unshift(generatedStep(GeneratedStepKind.GATHER_MATERIAL, gathering));
    }

    return steps;
}

// ── Ticking actions ─────────────────────────────────────────────────────────────────────────

/** What identifies one action of one step, so the ticks of a run fit in one set. */
export function actionKey(step: Pick<PlayStep, 'key'>, actionIndex: number): string {
    return `${step.key}:${actionIndex}`;
}
