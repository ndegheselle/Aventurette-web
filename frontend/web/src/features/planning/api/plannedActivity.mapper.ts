import type { UserPlannedActivitiesResponse } from '@/backend/schema.g';
import type { EntityMapper } from '@chapelure/core';
import { activityMapper, type ActivityPayload } from '@features/activities/api/activity.mapper';
import type { PlannedActivityData } from '@features/planning/models/planning';

/** A plan as the backend stores it, with its activity expanded. */
export type PlannedActivityPayload = UserPlannedActivitiesResponse<{ activity?: ActivityPayload }>;

/**
 * A date as PocketBase stores it: UTC, with a space between the day and the time. A filter
 * compares the stored text, so a bound written with ISO's `T` would sort wrong.
 */
export function toBackendDate(date: Date): string {
    return date.toISOString().replace('T', ' ');
}

function fromBackendDate(stored: string): Date {
    return new Date(stored.replace(' ', 'T'));
}

/** Reads a plan with its activity whole, so the calendar can tell how long it lasts. */
export const plannedActivityMapper: EntityMapper<PlannedActivityPayload, PlannedActivityData> = {
    relations: [
        'activity',
        ...activityMapper.relations.map(relation => `activity.${relation}`),
    ],
    toEntity: (planned, files) => {
        const activity = planned.expand?.activity;
        return {
            id: planned.id,
            user: planned.user,
            activity: activity ? activityMapper.toEntity(activity, files) : null,
            start: fromBackendDate(planned.start),
        };
    },
    toPayload: ({ user, activity, start }) => ({
        ...(user && { user }),
        ...(activity && { activity: activity.id }),
        ...(start && { start: toBackendDate(start) }),
    }),
};
