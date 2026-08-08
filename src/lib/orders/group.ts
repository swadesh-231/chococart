import { and, eq, inArray, lt, type SQL } from 'drizzle-orm';
import { db } from '@/db/db';
import { deliveryPersons, inventories, orders } from '@/db/schema/schema';
import type { OrderReference } from '@/lib/razorpay';

/**
 * A `where` clause selecting every `orders` row a payment covers — the whole
 * group for a cart checkout, or the single row for a pre-cart payment.
 */
export function ordersMatching(reference: OrderReference): SQL {
    return 'groupId' in reference
        ? eq(orders.groupId, reference.groupId)
        : eq(orders.id, reference.orderId);
}

/** The `orders.id`s a payment covers. Empty when the reference is unknown. */
export async function orderIdsFor(reference: OrderReference): Promise<number[]> {
    const rows = await db
        .select({ id: orders.id })
        .from(orders)
        .where(ordersMatching(reference));

    return rows.map((row) => row.id);
}

/**
 * Undoes a reservation: hands the stock and the delivery person back, and marks
 * every row in the order as finished with. Safe to call more than once.
 *
 * `status` separates the two ways a reservation ends — `failed` when the bank
 * refused the payment, `expired` when the five-minute hold simply ran out.
 * Clearing `reservedUntil` is what stops the sweep from picking the rows up
 * again on its next pass.
 */
export async function releaseOrders(orderIds: number[], status: 'failed' | 'expired' = 'failed') {
    if (!orderIds.length) return;

    await db.transaction(async (tx) => {
        await tx
            .update(inventories)
            .set({ orderId: null })
            .where(inArray(inventories.orderId, orderIds));
        await tx
            .update(deliveryPersons)
            .set({ orderId: null })
            .where(inArray(deliveryPersons.orderId, orderIds));
        await tx
            .update(orders)
            .set({ status, updatedAt: new Date(), reservedUntil: null })
            .where(inArray(orders.id, orderIds));
    });
}

/**
 * Hands back the stock behind every hold whose window has closed.
 *
 * There is no scheduler in this project, so this is swept lazily by the
 * handlers that care: placing an order (where freed stock is worth the most),
 * reading order history, and resuming a payment. Expiry is therefore
 * eventually-consistent — a lapsed hold is released the next time anyone
 * touches the system, not on the exact second — so nothing treats
 * `status === 'reserved'` alone as permission to pay; the deadline is checked
 * as well.
 *
 * Rows with a null `reservedUntil` are left alone: a SQL comparison against
 * NULL never matches, so orders from before the column existed, and rows
 * already paid or released, can't be swept up by accident.
 */
export async function expireStaleReservations(): Promise<number> {
    const stale = await db
        .select({ id: orders.id })
        .from(orders)
        .where(and(eq(orders.status, 'reserved'), lt(orders.reservedUntil, new Date())));

    if (!stale.length) return 0;

    await releaseOrders(
        stale.map((row) => row.id),
        'expired'
    );

    return stale.length;
}

/**
 * How long an expired row is kept after its hold lapsed.
 *
 * The shopper stops seeing it immediately — `GET /api/orders/history` filters
 * expired rows out — so this delay is not about the customer. It is about a
 * payment that lands late: someone can still have Razorpay open when the window
 * closes, and `POST /api/payment/verify` needs to find the row to recognise the
 * order as already released and report that a refund is owed. Delete it on the
 * second and that late payment becomes an unexplained "Unknown order" with the
 * money already taken.
 */
export const PURGE_AFTER_MINUTES = 30;

/**
 * Deletes the rows behind holds that lapsed long enough ago to be settled.
 *
 * Only `expired` orders qualify. A `failed` one is left alone on purpose:
 * Razorpay allows another attempt on the same order after a declined payment,
 * so that row still has to be resolvable when the retry succeeds.
 *
 * Stock and riders were already handed back by `releaseOrders`; the updates
 * below are belt-and-braces for a row released by some other path, and cost
 * nothing when there is nothing to clear.
 */
export async function purgeExpiredOrders(): Promise<number> {
    const cutoff = new Date(Date.now() - PURGE_AFTER_MINUTES * 60 * 1000);

    const doomed = await db
        .select({ id: orders.id })
        .from(orders)
        .where(and(eq(orders.status, 'expired'), lt(orders.updatedAt, cutoff)));

    if (!doomed.length) return 0;

    const ids = doomed.map((row) => row.id);

    await db.transaction(async (tx) => {
        await tx.update(inventories).set({ orderId: null }).where(inArray(inventories.orderId, ids));
        await tx
            .update(deliveryPersons)
            .set({ orderId: null })
            .where(inArray(deliveryPersons.orderId, ids));
        await tx.delete(orders).where(inArray(orders.id, ids));
    });

    return ids.length;
}

/**
 * The whole lazy housekeeping pass: release what has lapsed, then delete what
 * lapsed long enough ago. Handlers call this rather than the two separately, so
 * a new call site cannot pick up half the behaviour.
 */
export async function sweepReservations(): Promise<{ expired: number; purged: number }> {
    const expired = await expireStaleReservations();
    const purged = await purgeExpiredOrders();
    return { expired, purged };
}
