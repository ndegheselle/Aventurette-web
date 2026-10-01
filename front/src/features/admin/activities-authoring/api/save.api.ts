import { batch, newId } from "@/backend";
import { Collections } from "@/backend/schema.g";
import { BatchError, ValidationError, type BaseEntity, type IBatchCollection, type IDataBatch } from "@chapelure/core";
import { activityMapper } from "@features/activities/api/activity.mapper";
import { activityMaterialMapper, materialMapper } from "@features/activities/api/material.mapper";
import { resourceMapper, stepMapper } from "@features/activities/api/step.mapper";
import { workshopMapper } from "@features/activities/api/workshop.mapper";
import type { ActivityData } from "@features/activities/model/activity";
import {
    saveErrors,
    type ActivityRecords,
    type ActivityWrite,
} from "@features/admin/activities-authoring/model/activity.edit";

/** Each record a save writes, as the collection it is written to. */
function collectionsOf(pending: IDataBatch): Record<keyof ActivityRecords, IBatchCollection<BaseEntity>> {
    return {
        catalogue: pending.collection(Collections.CatalogMaterials, materialMapper),
        activity: pending.collection(Collections.Activities, activityMapper),
        material: pending.collection(Collections.ActivitiesMaterials, activityMaterialMapper),
        step: pending.collection(Collections.ActivitiesSteps, stepMapper),
        resource: pending.collection(Collections.StepsResources, resourceMapper),
        workshop: pending.collection(Collections.ActivitiesWorkshops, workshopMapper),
    } as Record<keyof ActivityRecords, IBatchCollection<BaseEntity>>;
}

/**
 * What an update sends. The cast on a cover is what the column costs: it reads as the stored
 * file's name and writes as the upload.
 */
function updateOf(write: Extract<ActivityWrite, { kind: 'update' }>): Partial<BaseEntity> {
    if (write.record !== 'activity' || !write.visual) return write.data;

    const withCover: Partial<ActivityData> = { ...write.data, visual: write.visual as unknown as ActivityData['visual'] };
    return withCover;
}

// The activity and everything under it, written together: the editor and the import both end
// in one call to `send`, and nothing is written before it.
export const saveApi = {
    /** The id a record will be created under, chosen before the save so the rest can point at it. */
    newId,

    /**
     * Send a save's writes, in order, as one batch: they all land, or none does. A refusal comes
     * back as a ValidationError, its fields where `saveErrors` puts them.
     */
    async send(writes: ActivityWrite[]): Promise<void> {
        const pending = batch();
        const collections = collectionsOf(pending);

        for (const write of writes) {
            const collection = collections[write.record];
            if (write.kind === 'create') collection.create(write.data);
            if (write.kind === 'update') collection.update(write.id, updateOf(write));
            if (write.kind === 'remove') collection.remove(write.id);
        }

        try {
            await pending.send();
        } catch (error) {
            if (!(error instanceof BatchError)) throw error;
            throw new ValidationError(saveErrors(writes[error.index], error.fields), error.message);
        }
    },
};
