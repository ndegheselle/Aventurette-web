import { crud } from "@/backend";
import { type InterestsResponse, Collections } from "@/backend/schema.g";

export type InterestData = InterestsResponse;

export function useInterests()
{
    return crud<InterestData>(Collections.Interests);
}
