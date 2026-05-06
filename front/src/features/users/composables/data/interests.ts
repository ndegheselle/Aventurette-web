import { usePocketBaseCrud } from "@chapelure/api/pocketbase.ts";
import { type InterestsResponse, Collections } from "@shared/types.g.ts";

export type InterestData = InterestsResponse;

export function useInterests()
{
    return usePocketBaseCrud<InterestData>(Collections.Interests);
}