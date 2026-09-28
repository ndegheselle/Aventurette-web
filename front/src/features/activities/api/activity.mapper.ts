import type { ActivitiesResponse } from "@/backend/schema.g";
import type { EntityMapper } from "@chapelure/core";
import { stepMapper, type ActivityStepPayload } from "@features/activities/api/step.mapper";
import { tagMapper, type ActivityTagPayload } from "@features/activities/api/tag.mapper";
import type { ActivityData } from "@features/activities/model/activity";

/** An activity as the backend stores it, with what an expanded read carries alongside. */
export type ActivityPayload = ActivitiesResponse<{
    steps?: ActivityStepPayload[];
    tags?: ActivityTagPayload[];
}>;

/**
 * Reads and writes an activity: steps and tags arrive as records — their own mappers' work — and
 * go back as ids, because saving an activity persists its links and nothing under them.
 */
export const activityMapper: EntityMapper<ActivityPayload, ActivityData> = {
    relations: [
        "steps",
        ...stepMapper.relations.map(relation => `steps.${relation}`),
        "tags",
    ],
    toEntity: ({ expand, ...activity }, files) => ({
        ...activity,
        steps: (expand?.steps ?? []).map(step => stepMapper.toEntity(step, files)),
        tags: (expand?.tags ?? []).map(tag => tagMapper.toEntity(tag, files)),
    }),
    toPayload: ({ steps, tags, ...activity }) => ({
        ...activity,
        ...(steps && { steps: steps.map(step => step.id) }),
        ...(tags && { tags: tags.map(tag => tag.id) }),
    }),
};
