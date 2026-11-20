import { crud } from "@/backend";
import { Collections } from "@/backend/schema.g";
import type { FilterGroup, PaginationOptions } from "@chapelure/core";
import { activityMapper, catalogueFilterOf } from "@features/activities/api/activity.mapper";
import type { ActivityData } from "@features/activities/models/activity";
import type { CatalogueFilters } from "@features/activities/models/catalogueFilters";

export const activitiesApi = crud(Collections.Activities, activityMapper);

export const catalogueApi = {
    /**
     * One page of the catalogue, searched and filtered. The filter's keys are columns, not the
     * entity's family paths, which the port's types cannot say: hence the cast.
     */
    page: (filters: CatalogueFilters, search: string, options: PaginationOptions) =>
        activitiesApi.filter(catalogueFilterOf(filters, search) as unknown as FilterGroup<ActivityData>, options),
};
