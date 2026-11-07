import type { BaseEntity } from "../data/entity";

/**
 * The session seam. Implementations persist the session themselves (cookie, localStorage, …);
 * the app calls `refresh` on boot to find out whether one is still valid.
 */
export interface IAuthProvider<TUser extends BaseEntity> {
    /** Authenticate and start a session. Throws if the credentials are rejected. */
    login(email: string, password: string): Promise<TUser>;

    /**
     * Email a one-time code to `email`. Resolves to the id `loginWithOtp` needs alongside the code.
     * Resolves the same whether or not an account has that email, so nobody can probe which exist.
     */
    requestOtp(email: string): Promise<string>;

    /** Authenticate with a code `requestOtp` sent, and start a session. Throws if it is wrong or expired. */
    loginWithOtp(otpId: string, code: string): Promise<TUser>;

    /** Revive an existing session, or resolve to null when there is none. */
    refresh(): Promise<TUser | null>;

    /** Discard the local session. */
    logout(): void;
}
