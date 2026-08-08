import { desc, eq } from 'drizzle-orm';
import { db } from '@/db/db';
import { orders, products } from '@/db/schema/schema';
import { requireUser } from '@/lib/auth/session';

export async function GET() {
    const appUser = await requireUser();
    if (appUser instanceof Response) return appUser;

    try {
        const myOrders = await db
            .select({
                id: orders.id,
                product: products.name,
                type: orders.type,
                price: orders.price,
                qty: orders.qty,
                image: products.image,
                productDescription: products.description,
                status: orders.status,
                address: orders.address,
                groupId: orders.groupId,
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
