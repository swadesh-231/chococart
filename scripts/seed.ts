
import 'dotenv/config';
import { pool } from '../src/db/db';
import { runSeed, seedStatus } from '../src/lib/seed';

const started = Date.now();

const before = await seedStatus();
console.log(
    `before · ${before.products} products, ${before.freeStock} free units, ` +
        `${before.freeRiders} free riders, ${before.warehouses} warehouses`
);
console.log(`seeding up to ${before.catalogueSize} chocolates — this takes a minute…\n`);

const report = await runSeed();

console.log(`+ ${report.productsAdded} products (${report.productsTotal} total)`);
console.log(`+ ${report.warehousesAdded} warehouses`);
console.log(`+ ${report.stockAdded} inventory units`);
console.log(`+ ${report.ridersAdded} riders`);
console.log(`\n✅ done in ${((Date.now() - started) / 1000).toFixed(1)}s`);
console.log(`   deliverable pincodes: ${report.pincodes.join(', ')}`);

await pool.end();
