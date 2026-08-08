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

/** The catalogue and the cart are for signed-in customers only. */
const SHOP_PATHS = ['/account', '/shop', '/cart', '/product'];
const AUTH_ONLY = ['/signin'];

const startsWithAny = (pathname: string, paths: string[]) =>
    paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const isSignedIn = Boolean(getSessionCookie(request));

    if (!isSignedIn && startsWithAny(pathname, [...ADMIN_PATHS, ...SHOP_PATHS])) {
        const signInUrl = new URL('/signin', request.url);
        signInUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(signInUrl);
    }

    if (isSignedIn && startsWithAny(pathname, AUTH_ONLY)) {
        const callbackUrl = request.nextUrl.searchParams.get('callbackUrl');
        const target = callbackUrl?.startsWith('/') ? callbackUrl : '/';
        return NextResponse.redirect(new URL(target, request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/account/:path*',
        '/shop/:path*',
        '/cart/:path*',
        '/product/:path*',
        '/dashboard/:path*',
        '/products/:path*',
        '/orders/:path*',
        '/warehouses/:path*',
        '/inventories/:path*',
        '/delivery-persons/:path*',
        '/signin',
    ],
};
