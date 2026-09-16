/**
 * Domain object builders. Each fills a complete, valid record — system fields included — and
 * takes an override for the one or two fields the test is actually about:
 *
 *     anActivity({ name: 'Treasure hunt', ageMin: 6, ageMax: 10 })
 */
import { UsersTypeOptions } from '@/backend/schema.g';
import {
    ActivityEnvironment,
    ActivityState,
    type ActivityData,
    type ActivityPayload,
    type BenefitData,
    type BenefitPayload,
} from '@features/activities/model/activity';
import type {
    ActivityMaterialData,
    ActivityMaterialPayload,
    ActivityResourceData,
    ActivityResourcePayload,
    ActivityStepData,
    ActivityStepPayload,
} from '@features/activities/model/step';
import type { ChildrenData } from '@features/users/model/child';
import type { InterestData } from '@features/users/model/interest';
import type { UserData } from '@features/users/model/user';

let sequence = 0;
const nextId = (prefix: string) => `${prefix}${(++sequence).toString().padStart(12, '0')}`;

const SYSTEM = {
    created: '2024-01-01 00:00:00.000Z',
    updated: '2024-01-01 00:00:00.000Z',
    collectionId: 'fake-collection',
    collectionName: 'fake',
};

export function aBenefit(overrides: Partial<BenefitData> = {}): BenefitData {
    return { ...SYSTEM, id: nextId('bnf'), name: 'Coordination', ...overrides } as BenefitData;
}

export function aMaterial(overrides: Partial<ActivityMaterialData> = {}): ActivityMaterialData {
    return {
        ...SYSTEM,
        id: nextId('mat'),
        name: 'Rope',
        step: nextId('stp'),
        ...overrides,
    } as ActivityMaterialData;
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
        materials: [],
        resources: [],
        ...overrides,
    } as ActivityStepData;
}

export function anActivity(overrides: Partial<ActivityData> = {}): ActivityData {
    return {
        ...SYSTEM,
        id: nextId('act'),
        name: 'Treasure hunt',
        description: '<p>Hide, then seek.</p>',
        environment: ActivityEnvironment.OUTDOOR,
        state: ActivityState.DRAFT,
        ageMin: 6,
        ageMax: 10,
        durationMinutes: 45,
        user: nextId('usr'),
        benefits: [],
        steps: [],
        ...overrides,
    } as ActivityData;
}

export function anInterest(overrides: Partial<InterestData> = {}): InterestData {
    return { ...SYSTEM, id: nextId('int'), name: 'Dinosaurs', ...overrides } as InterestData;
}

export function aChild(overrides: Partial<ChildrenData> = {}): ChildrenData {
    return {
        ...SYSTEM,
        id: nextId('chd'),
        name: 'Camille',
        age: 7,
        user: nextId('usr'),
        interests: [],
        ...overrides,
    } as ChildrenData;
}

export function aUser(overrides: Partial<UserData> = {}): UserData {
    return {
        ...SYSTEM,
        id: nextId('usr'),
        email: 'parent@example.com',
        emailVisibility: false,
        verified: true,
        type: UsersTypeOptions.PERSONNAL,
        childrens: [],
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

export function aMaterialPayload(overrides: Partial<ActivityMaterialPayload> = {}): ActivityMaterialPayload {
    return { ...SYSTEM, id: nextId('mat'), name: 'Rope', step: nextId('stp'), ...overrides } as ActivityMaterialPayload;
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
        materials: [],
        resources: [],
        ...overrides,
    } as ActivityStepPayload;
}

export function aBenefitPayload(overrides: Partial<BenefitPayload> = {}): BenefitPayload {
    return { ...SYSTEM, id: nextId('bnf'), name: 'Coordination', ...overrides } as BenefitPayload;
}

export function anActivityPayload(overrides: Partial<ActivityPayload> = {}): ActivityPayload {
    return {
        ...SYSTEM,
        id: nextId('act'),
        name: 'Treasure hunt',
        description: '<p>Hide, then seek.</p>',
        environment: ActivityEnvironment.OUTDOOR,
        state: ActivityState.DRAFT,
        user: nextId('usr'),
        benefits: [],
        steps: [],
        ...overrides,
    } as ActivityPayload;
}
