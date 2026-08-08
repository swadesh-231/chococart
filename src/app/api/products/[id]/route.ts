import { eq } from 'drizzle-orm';
import { db } from '@/db/db';
import { products } from '@/db/schema/schema';

export async function GET(request: Request, ctx: RouteContext<'/api/products/[id]'>) {
    const { id } = await ctx.params;
    const productId = Number(id);

    if (!Number.isInteger(productId) || productId <= 0) {
        return Response.json({ message: 'Invalid product id.' }, { status: 400 });
    }

    try {
        const product = await db
            .select()
            .from(products)
            .where(eq(products.id, productId))
            .limit(1);

        if (!product.length) {
            return Response.json({ message: 'Product not found.' }, { status: 404 });
        }

        return Response.json(product[0]);
    } catch (err) {
        console.error('GET /api/products/[id]', err);
        return Response.json({ message: 'Failed to fetch a product' }, { status: 500 });
    }
}
