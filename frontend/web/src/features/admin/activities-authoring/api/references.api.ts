import { crud } from "@/backend";
import { Collections } from "@/backend/schema.g";
import { safetyInstructionMapper } from "@features/activities/api/safety.mapper";
import { tagMapper } from "@features/activities/api/tag.mapper";
import { tipMapper } from "@features/activities/api/tip.mapper";
import type { SheetReferences } from "@features/admin/activities-authoring/model/activity.import";

const tags = crud(Collections.CatalogTags, tagMapper);
const safetyInstructions = crud(Collections.CatalogSafetyInstructions, safetyInstructionMapper);
const tips = crud(Collections.CatalogTips, tipMapper);

// Reference data: the editor and the import link tags, safety instructions and tips, and write
// none. Adding or changing one is the `catalogue-authoring` feature's.
export const referencesApi = {
    /** Every tag, of every kind, every safety instruction and every tip: there are few enough. */
    async getAll(): Promise<SheetReferences> {
        const [knownTags, knownInstructions, knownTips] = await Promise.all([
            tags.getAll(),
            safetyInstructions.getAll(),
            tips.getAll(),
        ]);
        return { tags: knownTags, safetyInstructions: knownInstructions, tips: knownTips };
    },
};
