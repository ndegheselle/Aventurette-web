import { type FilterGroup, FilterLogical, createFilter, createGroup } from "@chapelure/api/filters";
import { type ActivityData } from "@features/activities/data/activities";

export function createSearchFilter(search: string): FilterGroup<ActivityData> | null {
    if (!search)
        return null;

    return createGroup({
        filters: [
            createFilter({
                key: 'name',
                value: search,
                combine: FilterLogical.Or
            }),
            createFilter({
                key: 'summary',
                value: search,
                combine: FilterLogical.Or
            }),
            createFilter({
                key: 'description',
                value: search,
                combine: FilterLogical.Or
            }),
        ]
    });
}