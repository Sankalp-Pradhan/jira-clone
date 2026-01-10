import "server-only";

import {
    Client,
    Account,
    Databases,
    Storage,
    Users,
} from "node-appwrite";
import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/features/auth/constants";

export async function createSessionClient() {
    const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)

    const session = await cookies().get(AUTH_COOKIE);

    if (!session || !session.value) {
        throw new Error("Unauthorized");
    }

    client.setSession(session.value);

    return {
        get account() {
            return new Account(client);
        },
        get databases() {
            return new Databases(client);
        }


    };

}

export async function createAdminClient() {
    //----------------------------------------------------------------------------------------------------
    //debuggimg code    
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;
    const key = process.env.NEXT_APPWRITE_KEY;

    if (!endpoint || !project || !key) {
        console.error("CRITICAL: Missing Appwrite Environment Variables", {
            endpoint: !!endpoint,
            project: !!project,
            key: !!key
        });
    }
    //----------------------------------------------------------------------------------------------------
    const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
        .setKey(process.env.NEXT_APPWRITE_KEY!);

    return {
        get account() {
            return new Account(client);
        },
        get users() {
            return new Users(client);
        }
    };
}