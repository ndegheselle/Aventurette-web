import { PocketbaseCrud } from "@common/database/pocketbase.ts";
import { type ChildrensResponse, Collections } from "@common/database/types.g.ts";

export type ChildrenData = ChildrensResponse;

class ChildrensService extends PocketbaseCrud<ChildrenData> {
    constructor() {
        super(Collections.Childrens);
    }

    
}

export const childrens = new ChildrensService();