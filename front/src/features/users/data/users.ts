import { PocketbaseCrud, usePocketBase } from "@api/pocketbase.ts";
import { type UsersResponse, Collections, UsersTypeOptions } from "@api/types.g.ts";
import type { ChildrenData } from "@features/users/data/childrens";

export { UsersTypeOptions as UserProfilType };

type UserExpand = {
    childrens?: ChildrenData[];
};

export type UserData = UsersResponse<UserExpand>;

class UsersService extends PocketbaseCrud<UserData> {

    constructor() {
        super(Collections.Users);
    }

    async register(email: string, password: string, passwordConfirm: string): Promise<UserData | null> {
        await this.collection.create<UserData>({ email: email, password: password, passwordConfirm: passwordConfirm });
        // TODO : send email verification
        // collection.requestVerification(email);
        const result = await this.collection.authWithPassword<UserData>(email, password);
        return result?.record;
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