import {
    createFilter,
    createGroup,
    FilterOperator,
    removeEmptyFilters,
    type BaseEntity,
    type FieldErrors,
    type FilterGroup,
} from "@chapelure/core";
import { ActivityState, emptyDevelopment, type ActivityData } from "@features/activities/model/activity";
import type { ActivityMaterialData, MaterialData } from "@features/activities/model/material";
import type { ActivityResourceData, ActivityStepData } from "@features/activities/model/step";
import type { ActivityWorkshopData } from "@features/activities/model/workshop";

/**
 * The activity seen from its author's side: the blank one a new activity starts from, what the
 * form binds through, which activities the list shows, the one transition the editor offers, and
 * the writes a save comes down to.
 */

// ── The blank activity ──────────────────────────────────────────────────────────────────────

/**
 * A blank activity: what a new one starts from, and what the edit form binds to until the real
 * record arrives. Every family is there, empty, so the form can bind into any of them.
 */
export function createEmptyActivity(): ActivityData {
    // Typed as what the author fills in, so every family is checked; the record fills in the rest.
    const blank: Omit<ActivityData, 'id' | 'created' | 'updated' | 'collectionId' | 'collectionName' | 'user' | 'visual'> = {
        name: "",
        description: "",
        state: ActivityState.DRAFT,
        visualBrief: "",
        classification: { format: null, practices: [], themes: [] },
        imaginary: { rule: null, universes: [] },
        audience: {
            ageMin: 0,
            ageMax: 0,
            participantsMin: 0,
            participantsMax: 0,
            childrenPace: null,
            ageVariants: "",
        },
        supervision: { hostEffort: null, hostsRequired: 0, crossSupervision: false, notes: "" },
        place: { indoor: false, outdoor: false, locations: [], conditions: "", seasons: [] },
        safety: { instructions: [] },
        pedagogy: {
            goals: [],
            idealFor: [],
            development: emptyDevelopment(),
        },
        steps: [],
        materials: [],
        workshops: [],
        tips: [],
    };

    return blank as ActivityData;
}

// ── The form ────────────────────────────────────────────────────────────────────────────────

/** How far the age slider goes. An end left at its edge is unset: no limit on that side. */
export const AGE_BOUNDS = { floor: 0, ceiling: 18 };

/** How far the participants slider goes. */
export const PARTICIPANTS_BOUNDS = { floor: 1, ceiling: 30 };

// ── The authoring list ──────────────────────────────────────────────────────────────────────

/** A state to narrow the authoring list to, or `null` for every one of them. */
export type ActivityStateFilter = ActivityData['state'] | null;

/** The tabs above the authoring list, in display order. `label` is a translation key. */
export const authoredStateTabs: { label: string, value: ActivityStateFilter }[] = [
    { label: 'activities.authoring.states.all', value: null },
    { label: 'activities.authoring.states.DRAFT', value: ActivityState.DRAFT },
    { label: 'activities.authoring.states.PUBLISHED', value: ActivityState.PUBLISHED },
];

/**
 * What the authoring list asks for, narrowed to one state when a tab other than "all" is picked.
 * `null` drops the filter entirely, so the "all" tab and a chosen one take the same path.
 *
 * Not scoped to the signed-in author: for now everybody may edit every activity.
 */
export function buildAuthoredFilters(state: ActivityStateFilter): FilterGroup<ActivityData> {
    const byState = createFilter<ActivityData>({ key: 'state', value: state, operator: FilterOperator.Equals });
    const group = createGroup<ActivityData>({ filters: [byState] });
    return removeEmptyFilters(group);
}

// ── The state button ────────────────────────────────────────────────────────────────────────

/** Where the state button sends an activity, and what to call the button. */
export interface StateTransition {
    to: ActivityData['state'];
    label: string;
}

/**
 * The move the state button makes, and the label for it — both together, so a button never reads
 * "Publish" over a click that writes `DRAFT`.
 *
 * Anything not already published offers the forward move, rather than matching `DRAFT` exactly:
 * a state the enum grows later should still be publishable.
 */
export function stateTransition(state: ActivityData['state']): StateTransition {
    return state === ActivityState.PUBLISHED
        ? { to: ActivityState.DRAFT, label: 'activities.authoring.unpublish' }
        : { to: ActivityState.PUBLISHED, label: 'activities.authoring.publish' };
}

// ── Its lists ───────────────────────────────────────────────────────────────────────────────

/** The list with `item` in it: in place of the one sharing its id, or added at the end. */
export function putById<T extends BaseEntity>(items: T[], item: T): T[] {
    return items.some(current => current.id === item.id)
        ? items.map(current => current.id === item.id ? item : current)
        : [...items, item];
}

// ── Saving ──────────────────────────────────────────────────────────────────────────────────

/** The records an activity is made of, by the name a write gives them. */
export interface ActivityRecords {
    /** A name added to the catalogue while editing. */
    catalogue: MaterialData;
    activity: ActivityData;
    material: ActivityMaterialData;
    step: ActivityStepData;
    resource: ActivityResourceData;
    workshop: ActivityWorkshopData;
}

type RecordName = keyof ActivityRecords;

type Write<K extends RecordName> =
    | { record: K; kind: 'create'; data: ActivityRecords[K] }
    | { record: K; kind: 'update'; id: string; data: Partial<ActivityRecords[K]> }
    | { record: K; kind: 'remove'; id: string };

/** One write of a save. A save is a list of them, sent in order as one batch. */
export type ActivityWrite =
    | Write<'catalogue'>
    | Write<'material'>
    | Write<'step'>
    | Write<'resource'>
    | Write<'workshop'>
    | (Write<'activity'> & { visual?: File });

/**
 * Every write that turns `original` into `edited`, in the one order the backend takes them —
 * each write may only point at records that exist by then:
 *
 * - A new activity is created bare first: everything else points at it, and it cannot list
 *   records that do not exist yet.
 * - A new step is created without its files, since they point at it, and lists them once they
 *   are created.
 * - The activity's own update comes last but for the deletes: its lists name every record above.
 * - A record it no longer lists is deleted only after that update. `activities.steps` cascades:
 *   PocketBase deletes the record *holding* the relation once a deleted id leaves it with none,
 *   so deleting a step still listed — the last one — would take the activity with it.
 *
 * A record is new when `original` does not hold it, gone when `edited` does not, and updated only
 * when it changed. A file is new when it carries the picked `file`, which a read never does.
 *
 * @param original the activity as it was read, or null for one never saved
 * @param edited the activity as the form holds it, each new record under the id to create it with
 * @param newMaterials names added to the catalogue while editing: the ones a link still uses are
 *                     created, the rest were picked and then taken off again
 * @param visual a cover to store with the activity
 */
export function activityWrites(
    original: ActivityData | null,
    edited: ActivityData,
    newMaterials: MaterialData[] = [],
    visual?: File,
): ActivityWrite[] {
    const bare = { ...edited, steps: [], materials: [], workshops: [] };
    const before = original ?? bare;

    const linked = new Set(edited.materials.map(link => link.material));
    const newSteps = added(before.steps, edited.steps);
    const pickedFiles = edited.steps.flatMap(step => step.resources.filter(resource => resource.file));

    return [
        ...newMaterials.filter(material => linked.has(material.id)).map(creating('catalogue')),
        ...(original ? [] : [creating('activity')(bare)]),
        ...added(before.materials, edited.materials).map(creating('material')),
        ...changed(before.materials, edited.materials).map(updating('material')),
        ...newSteps.map(step => creating('step')({ ...step, resources: [] })),
        ...pickedFiles.map(creating('resource')),
        ...newSteps.filter(step => step.resources.length)
            .map(step => updating('step')({ id: step.id, resources: step.resources })),
        ...changed(before.steps, edited.steps).map(updating('step')),
        ...added(before.workshops, edited.workshops).map(creating('workshop')),
        ...changed(before.workshops, edited.workshops).map(updating('workshop')),
        { record: 'activity', kind: 'update', id: edited.id, data: edited, ...(visual && { visual }) },
        ...dropped(before.steps, edited.steps).map(removing('step')),
        ...dropped(before.workshops, edited.workshops).map(removing('workshop')),
        ...dropped(before.materials, edited.materials).map(removing('material')),
    ];
}

function creating<K extends RecordName>(record: K) {
    return (data: ActivityRecords[K]) => ({ record, kind: 'create', data }) as ActivityWrite;
}

function updating<K extends RecordName>(record: K) {
    return (data: Partial<ActivityRecords[K]> & BaseEntity) => ({ record, kind: 'update', id: data.id, data }) as ActivityWrite;
}

function removing<K extends RecordName>(record: K) {
    return (id: string) => ({ record, kind: 'remove', id }) as ActivityWrite;
}

/** What `after` holds that `before` did not. */
function added<T extends BaseEntity>(before: T[], after: T[]): T[] {
    const ids = new Set(before.map(item => item.id));
    return after.filter(item => !ids.has(item.id));
}

/**
 * What `after` changed of what `before` held. Compared as JSON: the edited record is a copy of the
 * one read, so its keys come in the same order — and a false positive costs a write, not a loss.
 */
function changed<T extends BaseEntity>(before: T[], after: T[]): T[] {
    const read = new Map(before.map(item => [item.id, JSON.stringify(item)]));
    return after.filter(item => read.has(item.id) && read.get(item.id) !== JSON.stringify(item));
}

/** The ids `before` held that `after` does not. */
function dropped<T extends BaseEntity>(before: T[], after: T[]): string[] {
    const ids = new Set(after.map(item => item.id));
    return before.filter(item => !ids.has(item.id)).map(item => item.id);
}

/** The list a record shows under on the form. */
const LIST_OF: Record<Exclude<RecordName, 'activity'>, 'materials' | 'steps' | 'workshops'> = {
    catalogue: 'materials',
    material: 'materials',
    step: 'steps',
    resource: 'steps',
    workshop: 'workshops',
};

/**
 * Where a refused save shows its errors. The activity's own go to its fields. Any other record's
 * go under the list holding it, with the first of its codes: the form has no field for a step's
 * title, but it can say which list to look in.
 *
 * @param write the write the backend refused — undefined when it named none
 * @param fields that write's own field errors
 */
export function saveErrors(write: ActivityWrite | undefined, fields: FieldErrors): FieldErrors {
    if (!write || write.record === 'activity') return fields;

    const [first] = Object.values(fields);
    return { [LIST_OF[write.record]]: first ?? {} };
}
