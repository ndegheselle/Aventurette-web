import { crud } from "@/backend";
import { Collections } from "@/backend/schema.g";
import type { ActivityResourceData } from "@features/activities/model/step";
import { resourceMapper, stepMapper } from "@features/activities/api/step.mapper";

// Saving an activity stores its step ids and nothing else, so a step is written through here
// first — and so are its resources, which are records of their own too.
export const stepsApi = crud(Collections.ActivitiesSteps, stepMapper);

const resources = crud(Collections.StepsResources, resourceMapper);

export const resourcesApi = {
    /**
     * Store a picked file as the resource record a step points at. `file` goes up as the upload;
     * what comes back carries the url to read it from.
     */
    async upload(file: File, step: string): Promise<ActivityResourceData> {
        return await resources.create({ name: file.name, file, step } as ActivityResourceData);
    },
};
