import 'dotenv/config';
import { desc, eq } from 'drizzle-orm';

import { db, pool } from '../src/db/db';
import { products } from '../src/db/schema/schema';
import { createImageDealer } from '../src/lib/categories';

/**
 * Re-deals the house photographs across the catalogue already in the database.
 *
 * `runSeed` only inserts chocolates it has not seen, so changing the image
 * column in `chocolates.json` never reaches a database seeded before it — and
 * the ids that came out of that seed bear no relation to the order of the file
 * anyway. Dealing in `desc(id)`, the shop's own "featured" order, is the only
 * way the no-repeat window means anything on screen.
 *
 * Only the `image` column is touched, and rows carrying a real uploaded
 * photograph are left alone. Prices, names, descriptions and stock are never
 * read. Running it twice is a no-op.
 */
const isUpload = (image: string | null) =>
    Boolean(image && (image.startsWith('http://') || image.startsWith('https://')));

const rows = await db
    .select({ id: products.id, category: products.category, image: products.image })
    .from(products)
    .orderBy(desc(products.id));

const nextImage = createImageDealer();
const updates: { id: number; image: string }[] = [];
let uploads = 0;

for (const row of rows) {
    if (isUpload(row.image)) {
        uploads++;
        continue;
    }

    const image = nextImage(row.category);
    if (image !== row.image) updates.push({ id: row.id, image });
}

console.log(`${rows.length} products · ${uploads} carrying their own uploaded photograph`);

for (const update of updates) {
    await db.update(products).set({ image: update.image }).where(eq(products.id, update.id));
}

console.log(
    updates.length === 0
        ? '✅ every photograph was already where it should be'
        : `✅ repointed ${updates.length} photograph${updates.length === 1 ? '' : 's'}`
);

// Read back and measure what the shop will actually show.
const after = await db
    .select({ image: products.image })
    .from(products)
    .orderBy(desc(products.id));

let collisions = 0;
for (let i = 0; i < after.length; i++) {
    for (let j = i + 1; j < Math.min(i + 4, after.length); j++) {
        if (after[i].image === after[j].image) collisions++;
    }
}
console.log(`   repeats among any four neighbours in featured order: ${collisions}`);

await pool.end();
