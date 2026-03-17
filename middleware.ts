import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ownerRoutes = ['/dashboard', '/buildings', '/tenants', '/billing', '/reports', '/settings', '/complaints'];
const tenantRoutes = ['/home', '/room', '/lease', '/bills', '/profile'];
const authRoutes = ['/login', '/register', '/forgot-password'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const sessionCookie = request.cookies.get('session')?.value;

    // Allow API routes and static files
    if (
        pathname.startsWith('/api') ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon') ||
        pathname === '/'
    ) {
        return NextResponse.next();
    }

    // Allow invite pages (unauthenticated access needed)
    if (pathname.startsWith('/invite')) {
        return NextResponse.next();
    }

    const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
    const isOwnerRoute = ownerRoutes.some((route) => pathname.startsWith(route));
    const isTenantRoute = tenantRoutes.some((route) => pathname.startsWith(route));

    // If on auth page and has session, redirect to dashboard
    if (isAuthRoute && sessionCookie) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // If on protected route without session, redirect to login
    if ((isOwnerRoute || isTenantRoute) && !sessionCookie) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
