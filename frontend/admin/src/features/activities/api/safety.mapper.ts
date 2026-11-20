import type { CatalogSafetyInstructionsResponse } from "@/backend/schema.g";
import { plainMapper, type EntityMapper } from "@chapelure/core";
import type { SafetyInstructionData } from "@features/activities/models/activity";

/** A safety instruction as the backend stores it. */
export type SafetyInstructionPayload = CatalogSafetyInstructionsResponse;

export const safetyInstructionMapper: EntityMapper<SafetyInstructionPayload, SafetyInstructionData> = plainMapper<SafetyInstructionPayload>();
