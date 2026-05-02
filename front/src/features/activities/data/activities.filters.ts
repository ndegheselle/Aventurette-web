import { type FilterGroup, createFilter, createGroup } from "@chapelure/api/filters";
import { type ActivityData } from "@features/activities/data/activities";

export function createSearchFilter(search: string): FilterGroup<ActivityData> {
    return createGroup({
        filters: [
            createFilter({
                key: 'name',
                value: search,
            }),
            createFilter({
                key: 'summary',
                value: search,
            }),
            createFilter({
                key: 'description',
                value: search,
            }),
        ]
    });
}