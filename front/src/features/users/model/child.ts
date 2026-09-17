import type { ChildrensResponse } from "@/backend/schema.g";
import type { Entity } from "@chapelure/core";
import type { InterestData } from "@features/users/model/interest";

export type ChildrenData = Entity<ChildrensResponse, {
    interests: InterestData[];
}>;
