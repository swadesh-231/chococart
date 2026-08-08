import type { VerifyPaymentData } from '@/types';

const CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

export interface RazorpayCheckoutOptions {
    key: string;
    amount: number | string;
    currency: string;
    name: string;
    description?: string;
    order_id: string;
    handler: (response: VerifyPaymentData) => void;
    prefill?: { name?: string; email?: string; contact?: string };
    notes?: Record<string, string>;
    theme?: { color?: string };
    modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
    open: () => void;
    on: (event: string, handler: (response: unknown) => void) => void;
}

declare global {
    interface Window {
        Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayInstance;
    }
}

let loader: Promise<void> | null = null;

/** Injects Razorpay's Checkout script once and resolves when it is ready. */
export function loadRazorpayCheckout(): Promise<void> {
    if (typeof window === 'undefined') {
        return Promise.reject(new Error('Razorpay Checkout can only load in the browser'));
    }
    if (window.Razorpay) return Promise.resolve();
    if (loader) return loader;

    loader = new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = CHECKOUT_SRC;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => {
            loader = null;
            script.remove();
            reject(new Error('Could not load Razorpay Checkout'));
        };
        document.body.appendChild(script);
    });

    return loader;
}

export async function openRazorpayCheckout(options: RazorpayCheckoutOptions) {
    await loadRazorpayCheckout();

    if (!window.Razorpay) {
        throw new Error('Could not load Razorpay Checkout');
    }

    const checkout = new window.Razorpay(options);
    checkout.open();
    return checkout;
}
