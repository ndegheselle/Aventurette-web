import { usePocketBase } from "@common/database/pocketbase.ts";
import { type UsersResponse, Collections } from "@common/database/types.g.ts";

export type UserData = UsersResponse;

async function register(email: string, password: string, passwordConfirm: string): Promise<UserData | null> {
    const { pb } = usePocketBase();
    const collection = pb.collection(Collections.Users);

    const result = await collection.create<UserData>({email: email, password: password, passwordConfirm: passwordConfirm});
    // TODO : send email verification
    // collection.requestVerification(email);
    return result;
}

async function login(email: string, password: string): Promise<UserData | null> {
    const { pb } = usePocketBase();
    const collection = pb.collection(Collections.Users);

    const result = await collection.authWithPassword<UserData>(email, password);
    return result?.record;
}

async function refresh(): Promise<UserData | null> {
    const { pb } = usePocketBase();
    const collection = pb.collection(Collections.Users);
    
    const result = await collection.authRefresh<UserData>();
    return result?.record;
}

function logout() {
    const { pb } = usePocketBase();
    pb.authStore.clear();
}

export const users = {
    login,
    register,
    refresh,
    logout,
}