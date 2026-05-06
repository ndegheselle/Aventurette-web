import { usePocketBaseCached, type CachedState } from "@chapelure/api/pocketbase.cached";
import { Collections, type BenefitsResponse } from "@shared/types.g.ts";

export type BenefitData = BenefitsResponse;

const state: CachedState<BenefitData> = {
    cache: [],
    isLoaded: false,
    loadPromise: null
}

export function useBenefits()
{
    return usePocketBaseCached<BenefitData>(state, Collections.Benefits);
}