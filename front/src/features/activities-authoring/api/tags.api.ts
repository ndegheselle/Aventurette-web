import { crud } from "@/backend";
import { Collections } from "@/backend/schema.g";
import { tagMapper } from "@features/activities/api/tag.mapper";
import type { ActivityTagData } from "@features/activities/model/tag";

const tags = crud(Collections.ActivitiesTags, tagMapper);

// Reference data: the editor offers every tag and writes none, so reading is all it gets.
export const tagsApi = {
    /** Every tag, of every kind, in one read: there are few enough, and the form shows them all. */
    getAll(): Promise<ActivityTagData[]> {
        return tags.getAll();
    },
};
