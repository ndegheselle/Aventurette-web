import { crud } from "@/backend";
import { type ChildrenResponse, Collections } from "@/backend/schema.g";
import type { InterestData } from "@features/users/composables/data/interests";

type ChildrenExpand = {
    interests?: InterestData[];
};

export type ChildrenData = ChildrenResponse<ChildrenExpand>;

export function useChildren()
{
    return crud<ChildrenData>(Collections.Children, ["interests"]);
}
