import { fileUrls } from "@/backend";
import type { ActivityResourceData } from "@features/activities/model/activity";

// A resource is created and deleted alongside its step, so there is no crud service here —
// only the file url the views need to preview an upload.
export const resourcesApi = {
    /** Url of the file stored for an already uploaded resource. */
    getFileUrl(resource: ActivityResourceData): string {
        return fileUrls.getUrl(resource, resource.file);
    },
};
