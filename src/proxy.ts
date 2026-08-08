import { getSessionCookie } from 'better-auth/cookies';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_PATHS = [
    '/dashboard',
    '/products',
    '/orders',
    '/warehouses',
    '/inventories',
    '/delivery-persons',
];

const SHOP_PATHS = ['/account', '/shop', '/cart', '/product'];

const startsWithAny = (pathname: string, paths: string[]) =>
    paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

/**
 * An optimistic gate: it only asks whether a session cookie exists, which is
 * all that can be checked without a database round trip on every request. The
 * pages and API routes behind it still verify the session for real.
 *
 * `/signin` is deliberately not handled here — bouncing people away on the
 * strength of a cookie alone locks anyone holding an expired one out of the
 * only page that could fix it. That check lives on the page, where the session
 * can actually be read.
 */
export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const isSignedIn = Boolean(getSessionCookie(request));

    if (!isSignedIn && startsWithAny(pathname, [...ADMIN_PATHS, ...SHOP_PATHS])) {
        const signInUrl = new URL('/signin', request.url);
        signInUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/account',
        '/account/:path*',
        '/shop',
        '/shop/:path*',
        '/cart',
        '/cart/:path*',
        '/product',
        '/product/:path*',
        '/dashboard',
        '/dashboard/:path*',
        '/products',
        '/products/:path*',
        '/orders',
        '/orders/:path*',
        '/warehouses',
        '/warehouses/:path*',
        '/inventories',
        '/inventories/:path*',
        '/delivery-persons',
        '/delivery-persons/:path*',
    ],
};
