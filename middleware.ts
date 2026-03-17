import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ownerRoutes = ['/dashboard', '/buildings', '/tenants', '/billing', '/reports', '/settings', '/complaints'];
const tenantRoutes = ['/home', '/room', '/lease', '/bills', '/profile'];
const authRoutes = ['/login', '/register', '/forgot-password'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const sessionCookie = request.cookies.get('session')?.value;

    // Allow API routes, static files, and root
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

    // If no session, redirect auth routes handled by client
    // Protected routes need session - redirect to login
    if ((isOwnerRoute || isTenantRoute) && !sessionCookie) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // If on auth page and has session, redirect based on role (handled by client)
    if (isAuthRoute && sessionCookie) {
        // Check role from a cookie set during login (simplified)
        const userRole = request.cookies.get('user_role')?.value;
        if (userRole === 'tenant') {
            return NextResponse.redirect(new URL('/home', request.url));
        }
        if (userRole === 'owner') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
