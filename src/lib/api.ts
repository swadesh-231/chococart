import type { ProfileFormValues } from '@/lib/validators/profileSchema';
import type {
    CheckoutSession,
    MyOrder,
    OrderData,
    Product,
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

export function getProducts() {
    return request<Product[]>('/api/products');
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
