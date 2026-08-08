import { desc } from 'drizzle-orm';
import { db } from '@/db/db';
import { products } from '@/db/schema/schema';
import { requireAdmin } from '@/lib/auth/session';
import { productApiSchema } from '@/lib/validators/productSchema';

export async function POST(request: Request) {
    const admin = await requireAdmin();
    if (admin instanceof Response) return admin;

    const parsed = productApiSchema.safeParse(await request.json().catch(() => null));

    if (!parsed.success) {
        return Response.json({ message: parsed.error.issues[0].message }, { status: 400 });
    }

    try {
        await db.insert(products).values(parsed.data);
        return Response.json({ message: 'OK' }, { status: 201 });
    } catch (err) {
        console.error('POST /api/products', err);
        return Response.json(
            { message: 'Failed to store product into the database' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const allProducts = await db.select().from(products).orderBy(desc(products.id));
        return Response.json(allProducts);
    } catch (err) {
        console.error('GET /api/products', err);
        return Response.json({ message: 'Failed to fetch products' }, { status: 500 });
    }
}
