import { desc, eq } from 'drizzle-orm';
import { db } from '@/db/db';
import { orders, products } from '@/db/schema/schema';
import { requireUser } from '@/lib/auth/session';
import { expireStaleReservations } from '@/lib/orders/group';

export async function GET() {
    const appUser = await requireUser();
    if (appUser instanceof Response) return appUser;

    // Sweep before reading so a lapsed hold is shown as expired rather than as
    // an order the shopper could still pay for.
    await expireStaleReservations().catch((err) =>
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
            .where(eq(orders.userId, appUser.id))
            .orderBy(desc(orders.id));

        return Response.json(myOrders);
    } catch (err) {
        console.error('GET /api/orders/history', err);
        return Response.json({ message: 'Failed to get my orders' }, { status: 500 });
    }
}
