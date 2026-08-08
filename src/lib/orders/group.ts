import { eq, inArray, type SQL } from 'drizzle-orm';
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
 * every row in the order as failed. Safe to call more than once.
 */
export async function releaseOrders(orderIds: number[]) {
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
            .set({ status: 'failed', updatedAt: new Date() })
            .where(inArray(orders.id, orderIds));
    });
}
