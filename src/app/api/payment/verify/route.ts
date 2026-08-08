import crypto from 'node:crypto';
import { and, eq, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db/db';
import { orders } from '@/db/schema/schema';
import { requireUser } from '@/lib/auth/session';
import { ordersMatching } from '@/lib/orders/group';
import { razorpayKeySecret, resolveOrderReference, type OrderReference } from '@/lib/razorpay';

const verifySchema = z.object({
    razorpay_order_id: z.string().min(1),
    razorpay_payment_id: z.string().min(1),
    razorpay_signature: z.string().min(1),
});

function isSignatureValid(orderId: string, paymentId: string, signature: string): boolean {
    const secret = razorpayKeySecret();
    if (!secret) throw new Error('RAZORPAY_KEY_SECRET must be set in .env');

    const expected = crypto
        .createHmac('sha256', secret)
        .update(`${orderId}|${paymentId}`)
        .digest();
    const received = Buffer.from(signature, 'hex');

    return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}

export async function POST(request: Request) {
    const appUser = await requireUser();
    if (appUser instanceof Response) return appUser;

    const parsed = verifySchema.safeParse(await request.json().catch(() => null));

    if (!parsed.success) {
        return Response.json({ message: 'Invalid payment payload' }, { status: 400 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;

    if (!isSignatureValid(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
        return Response.json({ message: 'Payment verification failed' }, { status: 400 });
    }

    // The order is read back from Razorpay rather than taken from the request,
    // so a signed payment cannot be applied to somebody else's order.
    let reference: OrderReference | null;
    try {
        reference = await resolveOrderReference(razorpay_order_id);
    } catch (err) {
        console.error('POST /api/payment/verify (fetch order)', err);
        return Response.json({ message: 'Could not confirm the payment' }, { status: 502 });
    }

    if (!reference) {
        return Response.json({ message: 'Unknown order' }, { status: 404 });
    }

    try {
        // Scoped to the signed-in user, so every row in the group must be
        // theirs, and to holds that are still live. `paid` is allowed through so
        // a webhook that got here first doesn't make this look like a failure.
        //
        // Deliberately not swept first: expiry governs whether a payment may be
        // *started*, and a shopper who tapped Pay with seconds to spare should
        // not be punished for the bank taking a moment to answer.
        const updated = await db
            .update(orders)
            .set({ status: 'paid', updatedAt: new Date(), reservedUntil: null })
            .where(
                and(
                    ordersMatching(reference),
                    eq(orders.userId, appUser.id),
                    inArray(orders.status, ['reserved', 'paid'])
                )
            )
            .returning({ id: orders.id });

        if (!updated.length) {
            const [existing] = await db
                .select({ status: orders.status })
                .from(orders)
                .where(and(ordersMatching(reference), eq(orders.userId, appUser.id)))
                .limit(1);

            if (!existing) {
                return Response.json({ message: 'Unknown order' }, { status: 404 });
            }

            // The order exists but is past paying for, which means money may
            // have been taken for stock already given away. Loud on purpose.
            console.error(
                `POST /api/payment/verify: payment ${razorpay_payment_id} landed on an order ` +
                    `already marked "${existing.status}" — a refund is owed`
            );

            return Response.json(
                {
                    message:
                        'The hold on this order ran out before the payment landed. Anything charged will be refunded.',
                },
                { status: 409 }
            );
        }

        return Response.json({
            message: 'OK',
            orderId: updated[0].id,
            orderIds: updated.map((row) => row.id),
        });
    } catch (err) {
        console.error('POST /api/payment/verify (update)', err);
        return Response.json({ message: 'Could not confirm the payment' }, { status: 500 });
    }
}
