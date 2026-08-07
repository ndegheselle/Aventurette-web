import { useAuth } from "@features/auth/composables/useAuth";
import type { UserData } from "@features/users/model/user";

/** The authenticated session, typed as this app's user record. */
export function useUsers() {
    return useAuth<UserData>();
}
