import { UsersTypeOptions, type UsersResponse } from "@/backend/schema.g";

export { UsersTypeOptions as UserProfilType };

// No Expanded wrapper: the auth provider asks for no relations, so `childrens` holds ids.
export type UserData = UsersResponse;
