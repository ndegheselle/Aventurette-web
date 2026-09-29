import { activitiesApi as activities } from "@features/activities/api/activities.api";
import type { ActivityData } from "@features/activities/model/activity";

export const visualsApi = {
    /**
     * Store a picked file as the activity's cover visual. The cast is what the column costs: it
     * reads as the stored file's name and writes as the upload.
     */
    async upload(activity: string, file: File): Promise<ActivityData> {
        return await activities.update(activity, { visual: file } as unknown as Partial<ActivityData>);
    },
};
