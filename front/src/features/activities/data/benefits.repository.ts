import { cachedCrud } from "@/backend";
import { Collections } from "@/backend/schema.g";
import type { BenefitData } from "@features/activities/model/benefit";

// Small reference collection: fetched once, then served from memory.
export const benefitsRepository = cachedCrud<BenefitData>(Collections.Benefits);
