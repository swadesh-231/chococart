import { eq } from 'drizzle-orm';
import { db } from '@/db/db';
import { orders } from '@/db/schema/schema';
import { requireAdmin } from '@/lib/auth/session';
import { orderStatusSchema } from '@/lib/validators/orderStatusSchema';

export async function PATCH(request: Request) {
    const admin = await requireAdmin();
    if (admin instanceof Response) return admin;

    const parsed = orderStatusSchema.safeParse(await request.json().catch(() => null));

    if (!parsed.success) {
        return Response.json({ message: parsed.error.issues[0].message }, { status: 400 });
    }

    try {
        const updated = await db
            .update(orders)
            .set({ status: parsed.data.status, updatedAt: new Date() })
            .where(eq(orders.id, parsed.data.orderId))
            .returning({ id: orders.id });

        if (!updated.length) {
            return Response.json({ message: 'Order not found' }, { status: 404 });
        }

        return Response.json({ message: parsed.data.status }, { status: 200 });
    } catch (err) {
        console.error('PATCH /api/orders/status', err);
        return Response.json({ message: 'Failed to update the order' }, { status: 500 });
    }
}
