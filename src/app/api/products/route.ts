import { and, asc, count, desc, eq, gte, ilike, lte, or, sql, type SQL } from 'drizzle-orm';
import { db } from '@/db/db';
import { products } from '@/db/schema/schema';
import { requireAdmin } from '@/lib/auth/session';
import { COCOA_RANGE, isFlavourNote, isProductCategory } from '@/lib/categories';
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

const SORTS = {
    featured: desc(products.id),
    'price-asc': asc(products.price),
    'price-desc': desc(products.price),
    name: asc(products.name),
    'cocoa-desc': desc(products.cocoaPercent),
} as const;

const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 200;

/**
 * The shop's catalogue endpoint: filtered, sorted and paged.
 *
 * Offset paging rather than a cursor — the sort is user-chosen (including by
 * price, which is not unique), and a cursor would have to encode a tiebreak for
 * every sort to stay stable. At a hundred chocolates the offset scan costs
 * nothing, and it lets the client jump straight to a page.
 */
export async function GET(request: Request) {
    const url = new URL(request.url);
    const params = url.searchParams;

    const limit = Math.min(
        Math.max(Number(params.get('limit')) || DEFAULT_LIMIT, 1),
        MAX_LIMIT
    );
    const offset = Math.max(Number(params.get('offset')) || 0, 0);

    const filters: SQL[] = [];

    const category = params.get('category');
    if (category && category !== 'all' && isProductCategory(category)) {
        filters.push(eq(products.category, category));
    }

    // Any-of, not all-of: ticking Fruity and Nutty widens the shelf.
    const notes = (params.get('notes') ?? '')
        .split(',')
        .map((note) => note.trim())
        .filter(isFlavourNote);

    if (notes.length) {
        filters.push(
            sql`${products.flavourNotes} && ARRAY[${sql.join(
                notes.map((note) => sql`${note}`),
                sql`, `
            )}]::text[]`
        );
    }

    // Only applied once the shopper actually narrows the range. Doing it always
    // would quietly drop every gift box, which has no cocoa percentage at all.
    const minCocoa = Number(params.get('minCocoa'));
    const maxCocoa = Number(params.get('maxCocoa'));

    if (Number.isFinite(minCocoa) && minCocoa > COCOA_RANGE.min) {
        filters.push(gte(products.cocoaPercent, minCocoa));
    }
    if (Number.isFinite(maxCocoa) && maxCocoa > 0 && maxCocoa < COCOA_RANGE.max) {
        filters.push(lte(products.cocoaPercent, maxCocoa));
    }

    if (params.get('vegan') === '1') filters.push(eq(products.vegan, true));
    if (params.get('glutenFree') === '1') filters.push(eq(products.glutenFree, true));

    const q = params.get('q')?.trim();
    if (q) {
        const needle = `%${q}%`;
        const match = or(ilike(products.name, needle), ilike(products.description, needle));
        if (match) filters.push(match);
    }

    const where = filters.length ? and(...filters) : undefined;
    const sortKey = params.get('sort');
    const orderBy = SORTS[(sortKey ?? 'featured') as keyof typeof SORTS] ?? SORTS.featured;

    try {
        const [items, [totals]] = await Promise.all([
            db.select().from(products).where(where).orderBy(orderBy).limit(limit).offset(offset),
            db.select({ n: count() }).from(products).where(where),
        ]);

        return Response.json({
            items,
            total: totals.n,
            // Null means "that was the last page" — the client stops asking.
            nextOffset: offset + items.length < totals.n ? offset + items.length : null,
        });
    } catch (err) {
        console.error('GET /api/products', err);
        return Response.json({ message: 'Failed to fetch products' }, { status: 500 });
    }
}
