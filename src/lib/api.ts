import type { CheckoutSession, MyOrder, OrderData, Product, VerifyPaymentData } from '@/types';

export class ApiError extends Error {
    readonly status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

async function request<T>(input: string, init?: RequestInit): Promise<T> {
    const response = await fetch(input, {
        ...init,
        headers: {
            ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
            ...init?.headers,
        },
    });

    const payload = await response.json().catch(() => null);

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

export function getMyOrders() {
    return request<MyOrder[]>('/api/orders/history');
}

export function placeOrder(data: OrderData) {
    return request<CheckoutSession>('/api/orders', {
        method: 'POST',
        body: JSON.stringify(data),
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
