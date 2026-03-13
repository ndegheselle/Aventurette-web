import { usePocketBase } from "@common/database/pocketbase.ts";
import { type CompaniesResponse, type UsersResponse, Collections } from "@common/database/types.g.ts";

type UserExpand = {
    company: CompaniesResponse;
};

export type UserData = UsersResponse<UserExpand>;

async function login(email: string, password: string): Promise<UserData | null> {
    const { pb } = usePocketBase();
    const collection = pb.collection(Collections.Users);

    const result = await collection.authWithPassword<UserData>(email, password, { expand: "company" });
    return result?.record;
}

async function refresh(): Promise<UserData | null> {
    const { pb } = usePocketBase();
    const collection = pb.collection(Collections.Users);
    
    const result = await collection.authRefresh<UserData>({ expand: "company" });
    return result?.record;
}

function logout() {
    const { pb } = usePocketBase();
    pb.authStore.clear();
}

export const users = {
    login,
    refresh,
    logout,
}