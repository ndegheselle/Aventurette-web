import { UsersTypeOptions, type UsersResponse } from "@/backend/schema.g";

export { UsersTypeOptions as UserProfilType };

// No Expanded wrapper: the auth provider never asks for relations, so `childrens` is ids.
export type UserData = UsersResponse;
