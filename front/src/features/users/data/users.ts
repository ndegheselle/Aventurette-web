import { AuthService } from "@chapelure/auth/data/auth.ts";
import { type UsersResponse, UsersTypeOptions } from "@common/types.g.ts";
import type { ChildrenData } from "@features/users/data/childrens";

export { UsersTypeOptions as UserProfilType };

type UserExpand = {
    childrens?: ChildrenData[];
};

export type UserData = UsersResponse<UserExpand>;

class UsersService extends AuthService<UserData> {
}

export const users = new UsersService();