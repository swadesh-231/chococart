import type { ProfileFormValues } from '@/lib/validators/profileSchema';
import type {
    CheckoutSession,
    MyOrder,
    OrderData,
    Product,
    ProductPage,
    ProductQuery,
    Profile,
    VerifyPaymentData,
} from '@/types';

export class ApiError extends Error {
    readonly status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

/**
 * The proxy only checks that a session cookie exists, so an expired or revoked
 * one still reaches the page — and then every query here comes back 401. Drop
 * the dead cookie (otherwise /signin bounces straight back) and send the
 * visitor to sign in, keeping where they were.
 */
async function handleSignedOut() {
    if (typeof window === 'undefined' || redirectingToSignIn) return;
    redirectingToSignIn = true;

    const { authClient } = await import('@/lib/auth/auth-client');
    await authClient.signOut().catch(() => undefined);

    const { pathname, search } = window.location;
    const callbackUrl = pathname === '/signin' ? '/' : `${pathname}${search}`;
    window.location.replace(`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
}

/** Guards against a page full of queries each firing its own redirect. */
let redirectingToSignIn = false;

async function request<T>(input: string, init?: RequestInit): Promise<T> {
    const response = await fetch(input, {
        ...init,
        headers: {
            // Only JSON bodies are declared. A FormData body has to keep the
            // multipart boundary the browser generates for it.
            ...(typeof init?.body === 'string' ? { 'Content-Type': 'application/json' } : {}),
            ...init?.headers,
        },
    });

    const payload = await response.json().catch(() => null);

    if (response.status === 401) {
        void handleSignedOut();
    }

    if (!response.ok) {
        const message =
            payload && typeof payload === 'object' && 'message' in payload
                ? String(payload.message)
                : 'Something went wrong';
        throw new ApiError(message, response.status);
    }

    return payload as T;
}

/** Serialises a `ProductQuery` into the endpoint's params, omitting anything
 *  left at its default so the URL (and the query key) stays readable. */
export function productSearchParams(query: ProductQuery = {}): URLSearchParams {
    const params = new URLSearchParams();

    if (query.q?.trim()) params.set('q', query.q.trim());
    if (query.category && query.category !== 'all') params.set('category', query.category);
    if (query.notes?.length) params.set('notes', query.notes.join(','));
    if (query.minCocoa !== undefined) params.set('minCocoa', String(query.minCocoa));
    if (query.maxCocoa !== undefined) params.set('maxCocoa', String(query.maxCocoa));
    if (query.vegan) params.set('vegan', '1');
    if (query.glutenFree) params.set('glutenFree', '1');
    if (query.sort) params.set('sort', query.sort);
    if (query.limit !== undefined) params.set('limit', String(query.limit));
    if (query.offset) params.set('offset', String(query.offset));

    return params;
}

/** One page of the catalogue. Filtering, sorting and paging all happen in
 *  Postgres, so the browser never has to hold the whole catalogue. */
export function getProducts(query: ProductQuery = {}) {
    return request<ProductPage>(`/api/products?${productSearchParams(query)}`);
}

export function getSingleProduct(id: string) {
    return request<Product>(`/api/products/${id}`);
}

export function getProfile() {
    return request<Profile>('/api/account/profile');
}

export function updateProfile(data: ProfileFormValues) {
    return request<Profile>('/api/account/profile', {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
}

/** Stores the picture on ImageKit and hands back its hosted URL. */
export function uploadAvatar(file: File) {
    const body = new FormData();
    body.append('file', file);

    return request<{ url: string }>('/api/account/avatar', { method: 'POST', body });
}

export function getMyOrders() {
    return request<MyOrder[]>('/api/orders/history');
}

export function placeOrder(data: OrderData) {
    return request<CheckoutSession>('/api/orders', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

/** Reopens Razorpay for an order that was placed but never paid for. */
export function resumePayment(groupId: string) {
    return request<CheckoutSession>('/api/payment/resume', {
        method: 'POST',
        body: JSON.stringify({ groupId }),
    });
}

export function verifyPayment(data: VerifyPaymentData) {
    return request<{ message: string; orderId: number; orderIds: number[] }>(
        '/api/payment/verify',
        {
            method: 'POST',
            body: JSON.stringify(data),
        }
    );
}
