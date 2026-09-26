import type { UsersResponse } from "@/backend/schema.g";
import type { Entity } from "@chapelure/core";

// No mapper: the session comes back from the auth port, which expands nothing and stores no
// file, so there is nothing to translate.
export type UserData = Entity<UsersResponse>;
