import { crud, fileUrls } from "@/backend";
import { Collections } from "@/backend/schema.g";
import type { ActivityResourceData } from "@features/activities/model/activity";

const resources = crud<ActivityResourceData>(Collections.StepsResources);

export const resourcesApi = {
    /**
     * Store a picked file as the resource record a step points at.
     *
     * `step` is required by the collection: a resource belongs to the step it was uploaded
     * for. The cast is what a create costs — the collection is the one that fills in the id,
     * and `file` goes up as the upload where the stored record holds its name.
     */
    async upload(file: File, step: string): Promise<ActivityResourceData> {
        return await resources.create({ name: file.name, file, step } as unknown as ActivityResourceData);
    },

    /** Url of the file stored for a resource. */
    getFileUrl(resource: ActivityResourceData): string {
        return fileUrls.getUrl(resource, resource.file);
    },
};
