import { batch } from "@/backend";
import { Collections } from "@/backend/schema.g";
import { createFilter, createGroup, FilterLogical, FilterOperator, type FilterGroup } from "@chapelure/core";
import { activitiesApi } from "@features/activities/api/activities.api";
import type { ActivityPayload } from "@features/activities/api/activity.mapper";
import { safetyInstructionMapper } from "@features/activities/api/safety.mapper";
import { tagMapper } from "@features/activities/api/tag.mapper";
import { tipMapper } from "@features/activities/api/tip.mapper";
import type { ActivityData } from "@features/activities/models/activity";
import type { GlossaryChanges, GlossaryPlan } from "@features/activities-authoring/models/glossary.import";

// What an import reads and writes besides the activities themselves, which go through `saveApi`
// one batch each, as the editor's do.
export const importApi = {
    /** The activities earlier imports made of these fiches, whole. */
    async bySourceIds(ids: string[]): Promise<ActivityData[]> {
        if (!ids.length) return [];

        const group = createGroup<ActivityPayload>({
            combine: FilterLogical.Or,
            filters: ids.map(id => createFilter<ActivityPayload>({
                key: 'source_id',
                value: id,
                operator: FilterOperator.Equals,
                combine: FilterLogical.Or,
            })),
        });
        const page = await activitiesApi.filter(group as unknown as FilterGroup<ActivityData>, { page: 1, perPage: ids.length });
        return page.items;
    },

    /** Write a glossary's entries, as one batch. */
    async saveGlossary(plan: GlossaryPlan): Promise<void> {
        const pending = batch();
        const write = <T extends { id: string }>(collection: { create(data: T): void; update(id: string, data: T): void }, { create, update }: GlossaryChanges<T>) => {
            create.forEach(entry => collection.create(entry));
            update.forEach(entry => collection.update(entry.id, entry));
        };

        write(pending.collection(Collections.CatalogTags, tagMapper), plan.tags);
        write(pending.collection(Collections.CatalogTips, tipMapper), plan.tips);
        write(pending.collection(Collections.CatalogSafetyInstructions, safetyInstructionMapper), plan.safety);

        await pending.send();
    },
};
