/**
 * Shrinks the stored catalogue back down to what `src/data/chocolates.json`
 * lists, after the generator has been re-run with smaller targets.
 *
 * `bun run seed` only ever adds, so cutting the catalogue in the generator
 * leaves the old rows sitting in the database. This removes them.
 *
 * A product an order points at is never deleted: `orders.product_id` is
 * `onDelete: 'no action'`, so the delete would fail anyway, and an order that
 * lost its product would be unreadable in the account and admin views. Those
 * rows are reported and kept. Inventory cascades with the product.
 *
 *   bun run prune
 */
import 'dotenv/config';
import { inArray, notInArray, sql } from 'drizzle-orm';

import catalogue from '../src/data/chocolates.json';
import { db, pool } from '../src/db/db';
import { orders, products } from '../src/db/schema/schema';

const keepNames = catalogue.map((item) => item.name);

// Anything an order references stays, whether or not the catalogue still lists
// it — history has to keep resolving.
const referenced = await db
    .selectDistinct({ id: orders.productId })
    .from(orders);
const referencedIds = referenced.map((row) => row.id);

const doomed = await db
    .select({ id: products.id, name: products.name })
    .from(products)
    .where(
        referencedIds.length
            ? sql`${notInArray(products.name, keepNames)} and ${notInArray(products.id, referencedIds)}`
            : notInArray(products.name, keepNames)
    );

console.log(`catalogue lists ${keepNames.length} chocolates`);
console.log(`${doomed.length} stored products are no longer listed and unreferenced`);

if (doomed.length) {
    // Chunked: Postgres caps the parameters in a single statement.
    for (let i = 0; i < doomed.length; i += 500) {
        const slice = doomed.slice(i, i + 500).map((row) => row.id);
        await db.delete(products).where(inArray(products.id, slice));
    }
    console.log(`deleted ${doomed.length} products (their inventory cascaded)`);
}

const kept = await db.select({ id: products.id, name: products.name }).from(products);
const orphans = kept.filter((row) => !keepNames.includes(row.name));

console.log(`\n✅ ${kept.length} products remain`);
if (orphans.length) {
    console.log(`   ${orphans.length} kept because an order references them:`);
    for (const row of orphans) console.log(`   · ${row.name}`);
}

await pool.end();
