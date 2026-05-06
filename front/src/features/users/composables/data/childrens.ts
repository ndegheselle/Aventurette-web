import { usePocketBaseCrud } from "@chapelure/api/pocketbase.ts";
import type { InterestData } from "@features/users/composables/data/interests";
import { type ChildrensResponse, Collections } from "@shared/types.g.ts";

type ChildrenExpand = {
    interests?: InterestData[];
};

export type ChildrenData = ChildrensResponse<ChildrenExpand>;

export function useChildrens()
{
    return usePocketBaseCrud<ChildrenData>(Collections.Childrens, ["interests"]);
}