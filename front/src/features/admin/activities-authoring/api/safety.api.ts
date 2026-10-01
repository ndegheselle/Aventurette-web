import { crud } from "@/backend";
import { Collections } from "@/backend/schema.g";
import { safetyInstructionMapper } from "@features/activities/api/safety.mapper";
import type { SafetyInstructionData } from "@features/activities/model/activity";

const instructions = crud(Collections.SafetyInstructions, safetyInstructionMapper);

// Reference data, as tags are: the editor offers every instruction and writes none.
export const safetyInstructionsApi = {
    getAll(): Promise<SafetyInstructionData[]> {
        return instructions.getAll();
    },
};
