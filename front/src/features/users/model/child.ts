import type { ChildrensResponse } from "@/backend/schema.g";
import type { Expanded } from "@chapelure/core";
import type { InterestData } from "@features/users/model/interest";

export type ChildrenData = Expanded<ChildrensResponse, {
    interests: InterestData[];
}>;

export const CHILD_RELATIONS = ["interests"];
