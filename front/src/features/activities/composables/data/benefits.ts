import { cachedCrud } from "@/backend";
import { Collections, type BenefitsResponse } from "@/backend/schema.g";

export type BenefitData = BenefitsResponse;

// Module scope on purpose: one cache shared by every caller.
const repository = cachedCrud<BenefitData>(Collections.Benefits);

export function useBenefits()
{
    return repository;
}
