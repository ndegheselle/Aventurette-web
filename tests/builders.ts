/**
 * Domain object builders.
 *
 * Records come from PocketBase carrying system fields no test cares about, so every builder
 * fills a complete, valid record and takes an override for the one or two fields the test is
 * actually about. A test then reads as what it is about:
 *
 *     anActivity({ name: 'Treasure hunt', ageMin: 6, ageMax: 10 })
 */
import { UsersTypeOptions } from '@/backend/schema.g';
import {
    ActivityEnvironment,
    type ActivityData,
    type ActivityResourceData,
    type ActivityStepData,
} from '@features/activities/model/activity';
import type { BenefitData } from '@features/activities/model/benefit';
import type { ActivityMaterialData } from '@features/activities/model/material';
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
    return { ...SYSTEM, id: nextId('mat'), name: 'Rope', ...overrides } as ActivityMaterialData;
}

export function aResource(overrides: Partial<ActivityResourceData> = {}): ActivityResourceData {
    return {
        ...SYSTEM,
        id: nextId('res'),
        name: 'Rules sheet',
        file: 'rules.pdf',
        ...overrides,
    } as ActivityResourceData;
}

export function aStep(overrides: Partial<ActivityStepData> = {}): ActivityStepData {
    return {
        ...SYSTEM,
        id: nextId('stp'),
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

/** An upload the user has just picked: it has no record yet, so it carries the File itself. */
export function aPickedFile(name = 'photo.png', type = 'image/png'): File {
    return new File(['fake-bytes'], name, { type });
}
