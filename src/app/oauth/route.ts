// src/app/oauth/route.ts
import { AUTH_COOKIE } from "@/features/auth/constants";
import { createAdminClient } from "@/lib/appwrite";
import { cookies } from "next/headers";
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    const userId = request.nextUrl.searchParams.get("userId");
    const secret = request.nextUrl.searchParams.get("secret");

    // const origin = process.env.NEXT_PUBLIC_APP;

    if (!userId || !secret) {
        return NextResponse.redirect(
            `${request.nextUrl.origin}/sign-up?error=missing_oauth_params`
        );
    }

    try {
        const { account } = await createAdminClient();
        const session = await account.createSession(userId, secret);

        // cookies() is async in Next.js 15+
        const cookieStore = await cookies();
        cookieStore.set(AUTH_COOKIE, session.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });

        return NextResponse.redirect(`${request.nextUrl.origin}/`);
    } catch (error) {
        console.error("OAuth session creation error:", error);
        return NextResponse.redirect(
            `${request.nextUrl.origin}/sign-up?error=oauth_session_failed`
        );
    }
}