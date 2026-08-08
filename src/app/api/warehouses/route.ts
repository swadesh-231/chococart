import { desc } from 'drizzle-orm';
import { db } from '@/db/db';
import { warehouses } from '@/db/schema/schema';
import { requireAdmin } from '@/lib/auth/session';
import { warehouseSchema } from '@/lib/validators/warehouseSchema';

export async function POST(request: Request) {
    const admin = await requireAdmin();
    if (admin instanceof Response) return admin;

    const parsed = warehouseSchema.safeParse(await request.json().catch(() => null));

    if (!parsed.success) {
        return Response.json({ message: parsed.error.issues[0].message }, { status: 400 });
    }

    try {
        await db.insert(warehouses).values(parsed.data);
        return Response.json({ message: 'OK' }, { status: 201 });
    } catch (err) {
        console.error('POST /api/warehouses', err);
        return Response.json({ message: 'Failed to store the warehouse' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const allWarehouses = await db.select().from(warehouses).orderBy(desc(warehouses.id));
        return Response.json(allWarehouses);
    } catch (err) {
        console.error('GET /api/warehouses', err);
        return Response.json({ message: 'Failed to fetch all warehouses' }, { status: 500 });
    }
}
