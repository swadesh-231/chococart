import { and, desc, eq, ne } from 'drizzle-orm';
import { db } from '@/db/db';
import { orders, products } from '@/db/schema/schema';
import { requireUser } from '@/lib/auth/session';
import { sweepReservations } from '@/lib/orders/group';

export async function GET() {
    const appUser = await requireUser();
    if (appUser instanceof Response) return appUser;

    // Sweep before reading, so a hold that lapsed while the shopper was away has
    // already given its stock back and dropped out of the list below.
    await sweepReservations().catch((err) =>
        console.error('GET /api/orders/history (sweep)', err)
    );

    try {
        const myOrders = await db
            .select({
                id: orders.id,
                productId: orders.productId,
                product: products.name,
                type: orders.type,
                price: orders.price,
                qty: orders.qty,
                image: products.image,
                productDescription: products.description,
                status: orders.status,
                address: orders.address,
                groupId: orders.groupId,
                reservedUntil: orders.reservedUntil,
                createdAt: orders.createdAt,
            })
            .from(orders)
            .leftJoin(products, eq(orders.productId, products.id))
            // An expired hold is not an order — nothing was paid and the
            // chocolate is back on the shelf — so it clears itself out of the
            // history rather than sitting there as a dead row.
            .where(and(eq(orders.userId, appUser.id), ne(orders.status, 'expired')))
            .orderBy(desc(orders.id));

        return Response.json(myOrders);
    } catch (err) {
        console.error('GET /api/orders/history', err);
        return Response.json({ message: 'Failed to get my orders' }, { status: 500 });
    }
}
