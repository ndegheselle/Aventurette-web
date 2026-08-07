import { type UsersResponse, UsersTypeOptions } from "@/backend/schema.g";
import { useAuth } from "@features/auth/composables/useAuth";
import type { ChildrenData } from "@features/users/composables/data/children";

export { UsersTypeOptions as UserProfilType };

type UserExpand = {
    childrens?: ChildrenData[];
};

export type UserData = UsersResponse<UserExpand>;

export function useUsers() {
    return useAuth<UserData>();
}
