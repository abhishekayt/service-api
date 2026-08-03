import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (pathname.startsWith("/admin")) {
        const token = request.cookies.get("admin_token")?.value;

        if (pathname === "/admin/login" && token) {
            const url = request.nextUrl.clone();
            url.pathname = "/admin/dashboard";
            return NextResponse.redirect(url);
        }

        if (pathname === "/admin/login") {
            return NextResponse.next();
        }

        if (!token) {
            const url = request.nextUrl.clone();
            url.pathname = "/admin/login";
            return NextResponse.redirect(url);
        }

        return NextResponse.next();
    }

    if (pathname.startsWith("/user")) {
        const token = request.cookies.get("user_token")?.value;

        if ((pathname === "/user/login" || pathname === "/user/register") && token) {
            const url = request.nextUrl.clone();
            url.pathname = "/user/dashboard";
            return NextResponse.redirect(url);
        }

        if (pathname === "/user/login" || pathname === "/user/register") {
            return NextResponse.next();
        }

        if (!token) {
            const url = request.nextUrl.clone();
            url.pathname = "/user/login";
            return NextResponse.redirect(url);
        }

        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/user/:path*"]
};
