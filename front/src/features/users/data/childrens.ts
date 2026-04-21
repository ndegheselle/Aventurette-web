import { PocketbaseCrud } from "@chapelure/api/pocketbase.ts";
import { type ChildrensResponse, Collections } from "@common/types.g.ts";
import type { InterestData } from "@features/users/data/interests";

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