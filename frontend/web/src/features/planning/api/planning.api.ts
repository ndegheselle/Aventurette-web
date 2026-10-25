import { crud } from '@/backend';
import { Collections } from '@/backend/schema.g';
import { createFilter, createGroup, createSearchFilter, FilterOperator, SortDirection } from '@chapelure/core';
import { activitiesApi } from '@features/activities/api/activities.api';
import type { ActivityData } from '@features/activities/models/activity';
import { plannedActivityMapper, toBackendDate } from '@features/planning/api/plannedActivity.mapper';
import type { PlannedActivityData } from '@features/planning/models/planning';

// The collection's rules keep each user to their own plans.
const planned = crud(Collections.UserPlannedActivities, plannedActivityMapper);

/** More than any one screen of the calendar holds: six weeks of a month view. */
const MAX_PLANS_IN_RANGE = 200;

/** What the sheet planning an activity lists: enough to pick from, short enough to scan. */
const MAX_ACTIVITIES_FOUND = 8;

export const planningApi = {
    /** The user's plans starting in `[from, to)`, earliest first. */
    async between(user: string, from: Date, to: Date): Promise<PlannedActivityData[]> {
        const inRange = createGroup<PlannedActivityData>({
            filters: [
                createFilter<PlannedActivityData>({ key: 'user', value: user, operator: FilterOperator.Equals }),
                createFilter<PlannedActivityData>({ key: 'start', value: toBackendDate(from), operator: FilterOperator.GreaterOrEquals }),
                createFilter<PlannedActivityData>({ key: 'start', value: toBackendDate(to), operator: FilterOperator.LessThan }),
            ],
        });
        const found = await planned.filter(inRange, {
            page: 1,
            perPage: MAX_PLANS_IN_RANGE,
            sortBy: 'start',
            sortDirection: SortDirection.ASC,
        });
        return found.items;
    },

    /** The activities whose name holds `text`, by name, to pick the one to plan. */
    async activitiesNamed(text: string): Promise<ActivityData[]> {
        const found = await activitiesApi.filter(createSearchFilter<ActivityData>(text, ['name']), {
            page: 1,
            perPage: MAX_ACTIVITIES_FOUND,
            sortBy: 'name',
            sortDirection: SortDirection.ASC,
        });
        return found.items;
    },

    create: (plan: PlannedActivityData) => planned.create(plan),
    remove: (id: string) => planned.remove(id),
};
