import type { ActivitiesResponse, BenefitsResponse } from "@/backend/schema.g";
import type { EntityMapper } from "@chapelure/core";
import { stepMapper, type ActivityStepPayload } from "@features/activities/api/step.mapper";
import type { ActivityData, BenefitData } from "@features/activities/model/activity";

export type BenefitPayload = BenefitsResponse;

export const benefitMapper: EntityMapper<BenefitPayload, BenefitData> = {
    relations: [],
    toEntity: ({ expand: _expand, ...benefit }) => benefit,
    toPayload: (benefit) => benefit,
};

/** An activity as the backend stores it, with what an expanded read carries alongside. */
export type ActivityPayload = ActivitiesResponse<{
    benefits?: BenefitPayload[];
    steps?: ActivityStepPayload[];
}>;

/**
 * Reads and writes an activity: benefits and steps arrive as records — their own mappers' work —
 * and go back as ids, because saving an activity persists its links and nothing under them.
 */
export const activityMapper: EntityMapper<ActivityPayload, ActivityData> = {
    relations: ["benefits", "steps", ...stepMapper.relations.map(relation => `steps.${relation}`)],
    toEntity: ({ expand, ...activity }, files) => ({
        ...activity,
        benefits: (expand?.benefits ?? []).map(benefit => benefitMapper.toEntity(benefit, files)),
        steps: (expand?.steps ?? []).map(step => stepMapper.toEntity(step, files)),
    }),
    toPayload: ({ benefits, steps, ...activity }) => ({
        ...activity,
        ...(benefits && { benefits: benefits.map(benefit => benefit.id) }),
        ...(steps && { steps: steps.map(step => step.id) }),
    }),
};
