import { desc, eq } from 'drizzle-orm';
import { db } from '@/db/db';
import { deliveryPersons, warehouses } from '@/db/schema/schema';
import { requireAdmin } from '@/lib/auth/session';
import { deliveryPersonSchema } from '@/lib/validators/deliveryPersonSchema';

export async function POST(request: Request) {
    const admin = await requireAdmin();
    if (admin instanceof Response) return admin;

    const parsed = deliveryPersonSchema.safeParse(await request.json().catch(() => null));

    if (!parsed.success) {
        return Response.json({ message: parsed.error.issues[0].message }, { status: 400 });
    }

    try {
        await db.insert(deliveryPersons).values(parsed.data);
        return Response.json({ message: 'OK' }, { status: 201 });
    } catch (err) {
        console.error('POST /api/delivary-persion', err);
        return Response.json(
            { message: 'Failed to store the delivery person into the database' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const allDeliveryPersons = await db
            .select({
                id: deliveryPersons.id,
                name: deliveryPersons.name,
                phone: deliveryPersons.phone,
                warehouse: warehouses.name,
            })
            .from(deliveryPersons)
            .leftJoin(warehouses, eq(deliveryPersons.warehouseId, warehouses.id))
            .orderBy(desc(deliveryPersons.id));

        return Response.json(allDeliveryPersons);
    } catch (err) {
        console.error('GET /api/delivary-persion', err);
        return Response.json({ message: 'Failed to fetch delivery persons' }, { status: 500 });
    }
}
