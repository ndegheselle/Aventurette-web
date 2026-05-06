import { useAuth } from "@chapelure/auth/composables/useAuth";
import type { ChildrenData } from "@features/users/composables/data/childrens";
import { type UsersResponse, UsersTypeOptions } from "@shared/types.g.ts";

export { UsersTypeOptions as UserProfilType };

type UserExpand = {
    childrens?: ChildrenData[];
};

export type UserData = UsersResponse<UserExpand>;

export function useUsers() {
    return useAuth<UserData>();
}