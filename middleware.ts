// Mental Model
/*
const authPages = [...]
const protectedPages = [...]

if (loggedIn && authPage) redirect()
if (!loggedIn && protectedPage) redirect()
else allow
*/

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {

    //console.log("Middleware - req : " , req)

    const { pathname } = req.nextUrl
    const token =
        req.cookies.get("auth-token")?.value ||
        req.cookies.get("next-auth.session-token")?.value ||
        req.cookies.get("__Secure-next-auth.session-token")?.value ||
        req.cookies.get("authjs.session-token")?.value ||
        req.cookies.get("__Secure-authjs.session-token")?.value

    const isLoggedIn = !!token

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/ce21bb94-6c20-47fa-b647-98987a96bdc0', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            sessionId: 'debug-session',
            runId: 'pre-fix',
            hypothesisId: 'H1',
            location: 'middleware.ts:auth-check',
            message: 'Middleware auth check',
            data: {
                pathname,
                hasToken: !!token,
                cookieNames: req.cookies.getAll().map((c) => c.name),
            },
            timestamp: Date.now(),
        }),
    }).catch(() => {})
    // #endregion

    const authPages = ["/sign-in", "/sign-up", "/verify"]
    const protectedPages = ["/dashboard"]

    const isAuthPage = authPages.some((page) =>
        pathname.startsWith(page)
    )

    const isProtectedPage = protectedPages.some((page) =>
        pathname.startsWith(page)
    )

    // Logged-in users should not see auth pages
    if (isLoggedIn && isAuthPage) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // Non-logged-in users should not see protected pages
    if (!isLoggedIn && isProtectedPage) {
        return NextResponse.redirect(new URL("/sign-in", req.url))
    }

    // Allow request
    return NextResponse.next()
}

// Tell Next.js when to run middleware
export const config = {
    matcher: [
        "/sign-in",
        "/sign-up",
        "/verify/:path*",
        "/dashboard/:path*",
        "/",
    ],
}