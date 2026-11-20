import { crud } from '@/backend';
import { Collections } from '@/backend/schema.g';
import { createFilter, createGroup, FilterOperator, SortDirection } from '@chapelure/core';
import { plannedActivityMapper, toBackendDate } from '@features/planning/api/plannedActivity.mapper';
import type { PlannedActivityData } from '@features/planning/models/planning';

// The collection's rules keep each user to their own plans.
const planned = crud(Collections.UserPlannedActivities, plannedActivityMapper);

/** More than any one screen of the calendar holds: six weeks of a month view. */
const MAX_PLANS_IN_RANGE = 200;

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

    /** Null when the plan is gone, or is not the user's. */
    getById: (id: string) => planned.getById(id),
    create: (plan: PlannedActivityData) => planned.create(plan),
    /** Moves a plan, or changes its activity. */
    update: (id: string, changes: Partial<Pick<PlannedActivityData, 'start' | 'activity'>>) => planned.update(id, changes),
    remove: (id: string) => planned.remove(id),
};
