import type { BaseEntity } from "../data/entity";

/**
 * Authentication seam. Everything session-related that a backend has to do lives behind this,
 * so the UI never touches an SDK's auth store or token handling.
 *
 * Implementations are expected to persist the session themselves (cookie, localStorage, …);
 * `refresh` is what the app calls on boot to find out whether one is still valid.
 */
export interface IAuthProvider<TUser extends BaseEntity> {
    /** Authenticate and start a session. Throws if the credentials are rejected. */
    login(email: string, password: string): Promise<TUser>;

    /**
     * Create an account, start a session, and trigger whatever verification flow
     * the backend has (typically a confirmation email).
     */
    register(email: string, password: string, passwordConfirm: string): Promise<TUser>;

    /** Revive an existing session, or resolve to null when there is none. */
    refresh(): Promise<TUser | null>;

    /** Discard the local session. */
    logout(): void;

    /** Patch the authenticated user's own record. */
    update(id: string, data: Partial<TUser>): Promise<TUser>;
}
