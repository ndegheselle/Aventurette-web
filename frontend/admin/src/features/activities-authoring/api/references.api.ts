import { crud } from "@/backend";
import { Collections } from "@/backend/schema.g";
import { safetyInstructionMapper } from "@features/activities/api/safety.mapper";
import { tagMapper } from "@features/activities/api/tag.mapper";
import { tipMapper } from "@features/activities/api/tip.mapper";
import type { SafetyInstructionData } from "@features/activities/models/activity";
import type { ActivityTipData } from "@features/activities/models/step";
import type { ActivityTagData } from "@features/activities/models/tag";

/** What the catalogues hold, for the editor's pickers. */
export interface References {
    tags: ActivityTagData[];
    safetyInstructions: SafetyInstructionData[];
    tips: ActivityTipData[];
}

const tags = crud(Collections.CatalogTags, tagMapper);
const safetyInstructions = crud(Collections.CatalogSafetyInstructions, safetyInstructionMapper);
const tips = crud(Collections.CatalogTips, tipMapper);

// Reference data: the editor links tags, safety instructions and tips. The import's glossary
// writes them on the server; editing one by hand is the `catalogue-authoring` feature's.
export const referencesApi = {
    /** Every tag, of every kind, every safety instruction and every tip: there are few enough. */
    async getAll(): Promise<References> {
        const [knownTags, knownInstructions, knownTips] = await Promise.all([
            tags.getAll(),
            safetyInstructions.getAll(),
            tips.getAll(),
        ]);
        return { tags: knownTags, safetyInstructions: knownInstructions, tips: knownTips };
    },
};
