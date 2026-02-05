import { betterFetch } from "@better-fetch/fetch";
import type { Session } from "better-auth/types";
import { NextResponse, type NextRequest } from "next/server";

export default async function middleware(request: NextRequest) {
    // Only run for /admin routes
    if (!request.nextUrl.pathname.startsWith("/admin")) {
        return NextResponse.next();
    }

    // Get session from better-auth
    const { data: session } = await betterFetch<Session>(
        "/api/auth/get-session",
        {
            baseURL: request.nextUrl.origin,
            headers: {
                cookie: request.headers.get("cookie") || "",
            },
        },
    );

    // No session - redirect to sign in
    if (!session) {
        const signInUrl = new URL("/auth/sign-in", request.url);
        signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
        return NextResponse.redirect(signInUrl);
    }

    // Check if user is admin
    if (session.user.role !== "ADMIN") {
        // Redirect non-admin users to dashboard with error
        const dashboardUrl = new URL("/dashboard", request.url);
        return NextResponse.redirect(dashboardUrl);
    }

    // User is admin, allow access
    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};
