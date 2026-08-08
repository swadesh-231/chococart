import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '@/db/db';
import { orders } from '@/db/schema/schema';
import { requireUser } from '@/lib/auth/session';
import { sweepReservations } from '@/lib/orders/group';
import { millisRemaining } from '@/lib/orders/reservation';
import {
    APP_ORDER_GROUP_NOTE_KEY,
    APP_ORDER_NOTE_KEY,
    RAZORPAY_CURRENCY,
    getRazorpay,
    razorpayKeyId,
    toPaise,
} from '@/lib/razorpay';

const resumeSchema = z.object({
    groupId: z.string().min(1, 'Which order should we take payment for?'),
});

/**
 * Reopens payment on an order that was placed but never paid for — the shopper
 * dismissed the Razorpay window, or the payment failed.
 *
 * A fresh Razorpay order is created each time rather than the original being
 * reused: attempts against a Razorpay order that already saw a failure cannot
 * be retried, and the notes carry the same `groupId`, so verification and the
 * webhook still resolve back to exactly these rows.
 */
export async function POST(request: Request) {
    const appUser = await requireUser();
    if (appUser instanceof Response) return appUser;

    const parsed = resumeSchema.safeParse(await request.json().catch(() => null));

    if (!parsed.success) {
        return Response.json({ message: parsed.error.issues[0].message }, { status: 400 });
    }

    const { groupId } = parsed.data;

    // Settle any lapsed holds before reading, so an order whose window closed
    // reads as `expired` here rather than looking payable for another moment.
    await sweepReservations().catch((err) =>
        console.error('POST /api/payment/resume (sweep)', err)
    );

    // Scoped to the signed-in user, so one shopper can never reopen another's.
    const lines = await db
        .select({
            id: orders.id,
            price: orders.price,
            status: orders.status,
            reservedUntil: orders.reservedUntil,
        })
        .from(orders)
        .where(and(eq(orders.groupId, groupId), eq(orders.userId, appUser.id)));

    if (!lines.length) {
        return Response.json({ message: 'We could not find that order' }, { status: 404 });
    }

    if (lines.some((line) => line.status === 'paid')) {
        return Response.json({ message: 'This order is already paid for' }, { status: 409 });
    }

    if (lines.some((line) => line.status !== 'reserved')) {
        return Response.json(
            { message: 'This order is no longer held — please order again' },
            { status: 409 }
        );
    }

    // A group is only held as long as its shortest-lived line.
    const deadline = lines.reduce<Date | null>((soonest, line) => {
        if (!line.reservedUntil) return soonest;
        const at = new Date(line.reservedUntil);
        return !soonest || at < soonest ? at : soonest;
    }, null);

    if (!deadline || millisRemaining(deadline) <= 0) {
        return Response.json(
            { message: 'The five-minute hold on this order has run out' },
            { status: 409 }
        );
    }

    const total = lines.reduce((sum, line) => sum + line.price, 0);
    const orderIds = lines.map((line) => line.id);

    try {
        const razorpayOrder = await getRazorpay().orders.create({
            amount: toPaise(total),
            currency: RAZORPAY_CURRENCY,
            receipt: `group_${groupId.slice(0, 30)}`,
            notes: {
                [APP_ORDER_GROUP_NOTE_KEY]: groupId,
                [APP_ORDER_NOTE_KEY]: String(orderIds[0]),
                userId: String(appUser.id),
            },
        });

        return Response.json({
            groupId,
            orderId: orderIds[0],
            orderIds,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            keyId: razorpayKeyId(),
            expiresAt: deadline.toISOString(),
            customer: {
                name: `${appUser.fname} ${appUser.lname}`.trim(),
                email: appUser.email,
            },
        });
    } catch (err) {
        console.error('POST /api/payment/resume (razorpay)', err);
        // The hold is left alone — the shopper still has the rest of the window
        // to try again, and the sweep will clean up if they don't.
        return Response.json({ message: 'Failed to restart the payment' }, { status: 502 });
    }
}
