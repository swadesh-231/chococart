import { and, inArray } from 'drizzle-orm';
import { validateWebhookSignature } from 'razorpay/dist/utils/razorpay-utils';
import { db } from '@/db/db';
import { orders } from '@/db/schema/schema';
import { orderIdsFor, ordersMatching, releaseOrders } from '@/lib/orders/group';
import { resolveOrderReference } from '@/lib/razorpay';

type RazorpayWebhookEvent = {
    event: string;
    payload?: {
        payment?: {
            entity?: {
                order_id?: string;
            };
        };
    };
};

export async function POST(request: Request) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret) {
        console.error('RAZORPAY_WEBHOOK_SECRET is not set');
        return Response.json({ message: 'Webhook not configured' }, { status: 500 });
    }

    const signature = request.headers.get('x-razorpay-signature');
    // Must be the raw body — re-serialising the parsed JSON breaks the HMAC.
    const rawBody = await request.text();

    if (!signature || !validateWebhookSignature(rawBody, signature, secret)) {
        return Response.json({ message: 'Invalid signature' }, { status: 400 });
    }

    let event: RazorpayWebhookEvent;
    try {
        event = JSON.parse(rawBody);
    } catch {
        return Response.json({ message: 'Invalid payload' }, { status: 400 });
    }

    const razorpayOrderId = event.payload?.payment?.entity?.order_id;

    if (!razorpayOrderId) {
        // Not a payment event we care about; ack so Razorpay stops retrying.
        return Response.json({ message: 'Ignored' });
    }

    try {
        const reference = await resolveOrderReference(razorpayOrderId);

        if (!reference) {
            return Response.json({ message: 'Ignored' });
        }

        if (event.event === 'payment.captured' || event.event === 'order.paid') {
            // Same rule as /api/payment/verify: only a live hold (or an order
            // already marked paid, for idempotency) converts to a sale.
            const updated = await db
                .update(orders)
                .set({ status: 'paid', updatedAt: new Date(), reservedUntil: null })
                .where(
                    and(ordersMatching(reference), inArray(orders.status, ['reserved', 'paid']))
                )
                .returning({ id: orders.id });

            if (!updated.length) {
                console.error(
                    `POST /api/payment/webhook: ${event.event} for a released order — a refund is owed`
                );
            }
        } else if (event.event === 'payment.failed') {
            await releaseOrders(await orderIdsFor(reference), 'failed');
        }

        return Response.json({ message: 'OK' });
    } catch (err) {
        // Return 500 so Razorpay retries the delivery.
        console.error('POST /api/payment/webhook', err);
        return Response.json({ message: 'Failed to process the webhook' }, { status: 500 });
    }
}
