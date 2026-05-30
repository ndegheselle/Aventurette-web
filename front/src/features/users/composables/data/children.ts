import { usePocketBaseCrud } from "@chapelure/api/pocketbase.ts";
import type { InterestData } from "@features/users/composables/data/interests";
import { type ChildrenResponse, Collections } from "@shared/types.g.ts";

type ChildrenExpand = {
    interests?: InterestData[];
};

export type ChildrenData = ChildrenResponse<ChildrenExpand>;

export function useChildren()
{
    return usePocketBaseCrud<ChildrenData>(Collections.Children, ["interests"]);
}