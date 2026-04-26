import { PocketbaseCrud } from "@chapelure/api/pocketbase.ts";
import { type BenefitsResponse, Collections } from "@shared/types.g.ts";

export type BenefitData = BenefitsResponse;

class BenefitsService extends PocketbaseCrud<BenefitData> {
    constructor() {
        super(Collections.Activities, ["name"]);
    }
}

export const benefits = new BenefitsService();