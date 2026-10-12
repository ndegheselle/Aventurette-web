import { crud } from "@/backend";
import { Collections } from "@/backend/schema.g";
import { safetyInstructionMapper } from "@features/activities/api/safety.mapper";

// The safety instructions every activity picks from. The backend refuses a slug it already has,
// and unlinks a deleted instruction from every activity listing it.
export const safetyInstructionsApi = crud(Collections.CatalogSafetyInstructions, safetyInstructionMapper);
