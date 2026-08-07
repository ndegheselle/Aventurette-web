import { crud } from "@/backend";
import { Collections } from "@/backend/schema.g";
import { CHILD_RELATIONS, type ChildrenData } from "@features/users/model/child";

export const childrenRepository = crud<ChildrenData>(Collections.Children, CHILD_RELATIONS);
