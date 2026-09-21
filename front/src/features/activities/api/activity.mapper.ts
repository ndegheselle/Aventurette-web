import type { ActivitiesResponse } from "@/backend/schema.g";
import type { EntityMapper } from "@chapelure/core";
import { stepMapper, type ActivityStepPayload } from "@features/activities/api/step.mapper";
import type { ActivityData } from "@features/activities/model/activity";

/** An activity as the backend stores it, with what an expanded read carries alongside. */
export type ActivityPayload = ActivitiesResponse<{
    steps?: ActivityStepPayload[];
}>;

/**
 * Reads and writes an activity: steps arrive as records — their own mapper's work — and go back
 * as ids, because saving an activity persists its links and nothing under them.
 */
export const activityMapper: EntityMapper<ActivityPayload, ActivityData> = {
    relations: [
        "steps",
        ...stepMapper.relations.map(relation => `steps.${relation}`),
    ],
    toEntity: ({ expand, ...activity }, files) => ({
        ...activity,
        steps: (expand?.steps ?? []).map(step => stepMapper.toEntity(step, files)),
    }),
    toPayload: ({ steps, ...activity }) => ({
        ...activity,
        ...(steps && { steps: steps.map(step => step.id) }),
    }),
};
