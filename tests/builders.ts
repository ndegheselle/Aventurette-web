/**
 * Domain object builders. Each fills a complete, valid record — system fields included — and
 * takes an override for the one or two fields the test is actually about:
 *
 *     anActivity({ name: 'Treasure hunt', state: ActivityState.PUBLISHED })
 */
import { UsersRoleOptions, UsersTypeOptions } from '@/backend/schema.g';
import { ActivityState, emptyDevelopment, type ActivityData } from '@features/activities/model/activity';
import type { ActivityPayload } from '@features/activities/api/activity.mapper';
import type { ActivityMaterialData, MaterialData } from '@features/activities/model/material';
import {
    StepKind,
    type ActivityResourceData,
    type ActivityStepData,
} from '@features/activities/model/step';
import type { ActivityWorkshopData } from '@features/activities/model/workshop';
import type { ActivityMaterialPayload, MaterialPayload } from '@features/activities/api/material.mapper';
import type {
    ActivityResourcePayload,
    ActivityStepPayload,
} from '@features/activities/api/step.mapper';
import type { ActivityTagPayload } from '@features/activities/api/tag.mapper';
import type { ActivityWorkshopPayload } from '@features/activities/api/workshop.mapper';
import { ActivityTagType, type ActivityTagData } from '@features/activities/model/tag';
import type { UserData } from '@features/auth/model/user';

let sequence = 0;
const nextId = (prefix: string) => `${prefix}${(++sequence).toString().padStart(12, '0')}`;

const SYSTEM = {
    created: '2024-01-01 00:00:00.000Z',
    updated: '2024-01-01 00:00:00.000Z',
    collectionId: 'fake-collection',
    collectionName: 'fake',
};

/** What an activity needs: its link to a catalogue material, the material's name folded in. */
export function aMaterial(overrides: Partial<ActivityMaterialData> = {}): ActivityMaterialData {
    return {
        ...SYSTEM,
        id: nextId('amt'),
        activity: nextId('act'),
        material: nextId('mat'),
        name: 'Rope',
        quantity: '',
        ...overrides,
    } as ActivityMaterialData;
}

/** A material of the catalogue, before any activity links it. */
export function aCatalogueMaterial(overrides: Partial<MaterialData> = {}): MaterialData {
    return { ...SYSTEM, id: nextId('mat'), name: 'Rope', ...overrides } as MaterialData;
}

export function aResource(overrides: Partial<ActivityResourceData> = {}): ActivityResourceData {
    return {
        ...SYSTEM,
        id: nextId('res'),
        name: 'Rules sheet',
        url: 'https://files.test/rules.pdf',
        step: nextId('stp'),
        ...overrides,
    } as ActivityResourceData;
}

export function aStep(overrides: Partial<ActivityStepData> = {}): ActivityStepData {
    return {
        ...SYSTEM,
        id: nextId('stp'),
        activity: nextId('act'),
        description: '<p>Line everyone up.</p>',
        title: '',
        kind: StepKind.CUSTOM,
        duration: 0,
        visual_brief: '',
        actions: [],
        tip: '',
        end_criteria: [],
        end_criteria_other: '',
        materials: [],
        resources: [],
        ...overrides,
    } as ActivityStepData;
}

export function aTag(overrides: Partial<ActivityTagData> = {}): ActivityTagData {
    return {
        ...SYSTEM,
        id: nextId('tag'),
        type: ActivityTagType.THEME,
        slug: 'art',
        name: 'art',
        description: '',
        ...overrides,
    } as ActivityTagData;
}

export function aWorkshop(overrides: Partial<ActivityWorkshopData> = {}): ActivityWorkshopData {
    return {
        ...SYSTEM,
        id: nextId('wks'),
        activity: nextId('act'),
        name: 'Knots',
        theme: '',
        challenges: '',
        adults_required: 1,
        materials: [],
        ...overrides,
    } as ActivityWorkshopData;
}

/** An activity with every family present and empty; override a family whole. */
export function anActivity(overrides: Partial<ActivityData> = {}): ActivityData {
    return {
        ...SYSTEM,
        id: nextId('act'),
        name: 'Treasure hunt',
        description: '<p>Hide, then seek.</p>',
        state: ActivityState.DRAFT,
        user: nextId('usr'),
        visual: '',
        visualBrief: '',
        classification: { format: '', practices: [], themes: [] },
        imaginary: { rule: '', universes: [] },
        audience: { ageMin: 0, ageMax: 0, participantsMin: 0, participantsMax: 0, childrenPace: '', ageVariants: '' },
        supervision: { hostEffort: '', hostsRequired: 0, crossSupervision: false, notes: '' },
        place: { indoor: false, outdoor: false, locations: [], conditions: '', seasons: [] },
        safety: { tags: [] },
        pedagogy: {
            goals: [],
            idealFor: [],
            development: emptyDevelopment(),
        },
        steps: [],
        materials: [],
        workshops: [],
        ...overrides,
    } as ActivityData;
}

export function aUser(overrides: Partial<UserData> = {}): UserData {
    return {
        ...SYSTEM,
        id: nextId('usr'),
        email: 'parent@example.com',
        emailVisibility: false,
        verified: true,
        type: UsersTypeOptions.PERSONNAL,
        role: UsersRoleOptions.USER,
        ...overrides,
    } as UserData;
}

/** A file the user has just picked, before anything has stored it. */
export function aPickedFile(name = 'photo.png', type = 'image/png'): File {
    return new File(['fake-bytes'], name, { type });
}

/**
 * Backend payloads — a record as a read answers with it, relation fields holding ids and the
 * related records sitting under `expand`. Only a mapper's spec has a reason to build one;
 * everything above it works on entities.
 */

/** An activity's link to a catalogue material, the material expanded under it and named `name`. */
export function aMaterialPayload(
    { name = 'Rope', ...overrides }: Partial<ActivityMaterialPayload> & { name?: string } = {},
): ActivityMaterialPayload {
    const material = aCatalogueMaterialPayload({ name });
    return {
        ...SYSTEM,
        id: nextId('amt'),
        activity: nextId('act'),
        material: material.id,
        quantity: '',
        expand: { material },
        ...overrides,
    } as ActivityMaterialPayload;
}

export function aCatalogueMaterialPayload(overrides: Partial<MaterialPayload> = {}): MaterialPayload {
    return { ...SYSTEM, id: nextId('mat'), name: 'Rope', ...overrides } as MaterialPayload;
}

export function aResourcePayload(overrides: Partial<ActivityResourcePayload> = {}): ActivityResourcePayload {
    return {
        ...SYSTEM,
        id: nextId('res'),
        name: 'Rules sheet',
        file: 'rules.pdf',
        step: nextId('stp'),
        ...overrides,
    } as ActivityResourcePayload;
}

export function aStepPayload(overrides: Partial<ActivityStepPayload> = {}): ActivityStepPayload {
    return {
        ...SYSTEM,
        id: nextId('stp'),
        activity: nextId('act'),
        description: '<p>Line everyone up.</p>',
        title: '',
        kind: StepKind.CUSTOM,
        duration: 0,
        visual_brief: '',
        actions: [],
        tip: '',
        end_criteria: [],
        end_criteria_other: '',
        materials: [],
        resources: [],
        ...overrides,
    } as ActivityStepPayload;
}

export function aTagPayload(overrides: Partial<ActivityTagPayload> = {}): ActivityTagPayload {
    return {
        ...SYSTEM,
        id: nextId('tag'),
        type: ActivityTagType.THEME,
        slug: 'art',
        name: 'art',
        description: '',
        ...overrides,
    } as ActivityTagPayload;
}

export function aWorkshopPayload(overrides: Partial<ActivityWorkshopPayload> = {}): ActivityWorkshopPayload {
    return {
        ...SYSTEM,
        id: nextId('wks'),
        activity: nextId('act'),
        name: 'Knots',
        theme: '',
        challenges: '',
        adults_required: 1,
        materials: [],
        ...overrides,
    } as ActivityWorkshopPayload;
}

export function anActivityPayload(overrides: Partial<ActivityPayload> = {}): ActivityPayload {
    return {
        ...SYSTEM,
        id: nextId('act'),
        name: 'Treasure hunt',
        description: '<p>Hide, then seek.</p>',
        state: ActivityState.DRAFT,
        user: nextId('usr'),
        visual: '',
        visual_brief: '',
        format: '',
        practices: [],
        imaginary_rule: '',
        age_min: 0,
        age_max: 0,
        participants_min: 0,
        participants_max: 0,
        children_pace: '',
        age_variants: '',
        host_effort: '',
        recommended_hosts_numbers: 0,
        cross_supervision: false,
        supervision_notes: '',
        indoor: false,
        outdoor: false,
        locations: [],
        conditions: '',
        seasons: [],
        steps: [],
        materials: [],
        workshops: [],
        theme_tags: [],
        imaginary_tags: [],
        safety_tags: [],
        goal_tags: [],
        ideal_for_tags: [],
        development_tags: [],
        ...overrides,
    } as ActivityPayload;
}
