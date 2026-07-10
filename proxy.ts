import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";

const PUBLIC_PAGES = ["/login", "/signup"];

export async function proxy(req: NextRequest) {
    const token = req.cookies.get("token")?.value;
    const payload = token ? await verifyToken(token) : null;

    if (req.nextUrl.pathname.startsWith("/api/")) {
        if (!payload) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const requestHeaders = new Headers(req.headers);
        requestHeaders.set("x-user-id", payload.userId);

        return NextResponse.next({
            request: { headers: requestHeaders },
        });
    }

    const isPublicPage = PUBLIC_PAGES.some((p) => req.nextUrl.pathname.startsWith(p));
    if (!isPublicPage && !payload) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/api/chat/:path*",
        "/api/conversations/:path*",
        "/api/auth/me",
        "/api/auth/logout",
        "/",
        "/chat",
    ],
};