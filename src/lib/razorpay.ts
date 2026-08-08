import Razorpay from 'razorpay';

export const RAZORPAY_CURRENCY = 'INR';

let client: Razorpay | null = null;

/**
 * Server-side only. Both the canonical names and the ones this project's .env
 * already uses are accepted, so a working key never has to be renamed.
 */
export function razorpayKeyId(): string | undefined {
    return (
        process.env.RAZORPAY_KEY_ID ||
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
        process.env.NEXT_JS_RAZERPAY_TEST_KEY
    );
}

export function razorpayKeySecret(): string | undefined {
    return process.env.RAZORPAY_KEY_SECRET || process.env.NEXT_JS_RAZERPAY_SECREAT_KEY;
}

/**
 * Lazily constructed so a missing key does not blow up at import time (which
 * would break `next build`); it fails on first real use instead.
 */
export function getRazorpay(): Razorpay {
    if (client) return client;

    const keyId = razorpayKeyId();
    const keySecret = razorpayKeySecret();

    if (!keyId || !keySecret) {
        throw new Error(
            'Razorpay keys are missing — set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env'
        );
    }

    client = new Razorpay({ key_id: keyId, key_secret: keySecret });
    return client;
}

/** Razorpay works in currency subunits — ₹295 is 29500 paise. */
export function toPaise(rupees: number): number {
    return Math.round(rupees * 100);
}

/** The note key used to map a Razorpay order back to a row in `orders`. */
export const APP_ORDER_NOTE_KEY = 'appOrderId';
/** The note key used to map a Razorpay order back to a whole cart checkout. */
export const APP_ORDER_GROUP_NOTE_KEY = 'appOrderGroupId';

/**
 * A payment covers either one cart (a group of `orders` rows) or, for payments
 * started before carts existed, a single row.
 */
export type OrderReference = { groupId: string } | { orderId: number };

/**
 * Resolves a Razorpay order id to the orders it was created for. Read back from
 * Razorpay rather than trusted from the request body, so a signed payment
 * cannot be replayed against somebody else's order.
 */
export async function resolveOrderReference(
    razorpayOrderId: string
): Promise<OrderReference | null> {
    const order = await getRazorpay().orders.fetch(razorpayOrderId);

    const groupId = order.notes?.[APP_ORDER_GROUP_NOTE_KEY];
    if (typeof groupId === 'string' && groupId.length > 0) return { groupId };

    const orderId = Number(order.notes?.[APP_ORDER_NOTE_KEY]);
    return Number.isInteger(orderId) && orderId > 0 ? { orderId } : null;
}
