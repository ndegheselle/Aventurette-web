import type { BaseEntity } from "../data/entity";

/**
 * The session seam. Implementations persist the session themselves (cookie, localStorage, …);
 * the app calls `refresh` on boot to find out whether one is still valid.
 */
export interface IAuthProvider<TUser extends BaseEntity> {
    /** Authenticate and start a session. Throws if the credentials are rejected. */
    login(email: string, password: string): Promise<TUser>;

    /** Create an account, start a session, and trigger the backend's verification flow. */
    register(email: string, password: string, passwordConfirm: string): Promise<TUser>;

    /** Revive an existing session, or resolve to null when there is none. */
    refresh(): Promise<TUser | null>;

    /** Discard the local session. */
    logout(): void;

    /** Patch the authenticated user's own record. */
    update(id: string, data: Partial<TUser>): Promise<TUser>;
}
