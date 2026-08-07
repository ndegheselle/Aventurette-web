import { UsersTypeOptions, type UsersResponse } from "@/backend/schema.g";
import type { ChildrenData } from "@features/users/model/child";

export { UsersTypeOptions as UserProfilType };

type UserExpand = {
    childrens?: ChildrenData[];
};

export type UserData = UsersResponse<UserExpand>;
