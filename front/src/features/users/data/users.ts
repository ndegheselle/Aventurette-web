import { PocketbaseCrud, usePocketBase } from "@common/database/pocketbase.ts";
import { type UsersResponse, Collections } from "@common/database/types.g.ts";

export type UserData = UsersResponse;

class UsersService extends PocketbaseCrud<UserData> {

    constructor() {
        super(Collections.Users);
    }

    async register(email: string, password: string, passwordConfirm: string): Promise<UserData | null> {
        const result = await this.collection.create<UserData>({ email: email, password: password, passwordConfirm: passwordConfirm });
        // TODO : send email verification
        // collection.requestVerification(email);
        return result;
    }

    async login(email: string, password: string): Promise<UserData | null> {

        const result = await this.collection.authWithPassword<UserData>(email, password);
        return result?.record;
    }

    async refresh(): Promise<UserData | null> {

        const result = await this.collection.authRefresh<UserData>();
        return result?.record;
    }

    logout() {
        const { pb } = usePocketBase();
        pb.authStore.clear();
    }
}

export const users = new UsersService();