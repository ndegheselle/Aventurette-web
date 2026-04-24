import { PocketbaseCrud } from "@chapelure/api/pocketbase.ts";
import type { InterestData } from "@features/users/data/interests";
import { type ChildrensResponse, Collections } from "@shared/types.g.ts";

type ChildrenExpand = {
    interests?: InterestData[];
};

export type ChildrenData = ChildrensResponse<ChildrenExpand>;

class ChildrensService extends PocketbaseCrud<ChildrenData> {
    constructor() {
        super(Collections.Childrens, ["name"], ["interests"]);
    }
}

export const childrens = new ChildrensService();