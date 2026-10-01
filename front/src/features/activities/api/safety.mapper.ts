import type { SafetyInstructionsResponse } from "@/backend/schema.g";
import type { EntityMapper } from "@chapelure/core";
import { omit } from "@chapelure/core";
import type { SafetyInstructionData } from "@features/activities/model/activity";

/** A safety instruction as the backend stores it. */
export type SafetyInstructionPayload = SafetyInstructionsResponse;

export const safetyInstructionMapper: EntityMapper<SafetyInstructionPayload, SafetyInstructionData> = {
    relations: [],
    toEntity: (instruction) => omit(instruction, "expand"),
    toPayload: (instruction) => instruction,
};
