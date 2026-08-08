import { desc, eq } from 'drizzle-orm';
import { db } from '@/db/db';
import { inventories, products, warehouses } from '@/db/schema/schema';
import { requireAdmin } from '@/lib/auth/session';
import { isUniqueViolation } from '@/lib/db-errors';
import { inventorySchema } from '@/lib/validators/inventorySchema';

export async function POST(request: Request) {
    const admin = await requireAdmin();
    if (admin instanceof Response) return admin;

    const parsed = inventorySchema.safeParse(await request.json().catch(() => null));

    if (!parsed.success) {
        return Response.json({ message: parsed.error.issues[0].message }, { status: 400 });
    }

    try {
        await db.insert(inventories).values(parsed.data);
        return Response.json({ message: 'OK' }, { status: 201 });
    } catch (err) {
        // The only unique constraint on this table is the SKU.
        if (isUniqueViolation(err)) {
            return Response.json({ message: 'This SKU already exists' }, { status: 409 });
        }
        console.error('POST /api/inventories', err);
        return Response.json(
            { message: 'Failed to store the inventory into the database' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const allInventories = await db
            .select({
                id: inventories.id,
                sku: inventories.sku,
                warehouse: warehouses.name,
                product: products.name,
            })
            .from(inventories)
            .leftJoin(warehouses, eq(inventories.warehouseId, warehouses.id))
            .leftJoin(products, eq(inventories.productId, products.id))
            .orderBy(desc(inventories.id));

        return Response.json(allInventories);
    } catch (err) {
        console.error('GET /api/inventories', err);
        return Response.json({ message: 'Failed to fetch inventories' }, { status: 500 });
    }
}
