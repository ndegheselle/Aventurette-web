import type { ChildrenResponse } from "@/backend/schema.g";
import type { InterestData } from "@features/users/model/interest";

type ChildrenExpand = {
    interests?: InterestData[];
};

export type ChildrenData = ChildrenResponse<ChildrenExpand>;

export const CHILD_RELATIONS = ["interests"];
