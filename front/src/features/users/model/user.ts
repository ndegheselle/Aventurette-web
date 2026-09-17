import { UsersTypeOptions, type UsersResponse } from "@/backend/schema.g";
import type { Entity } from "@chapelure/core";

export { UsersTypeOptions as UserProfilType };

// No mapper: the session comes back from the auth port, which expands nothing and stores no
// file, so `childrens` holds ids and there is nothing to translate.
export type UserData = Entity<UsersResponse>;
