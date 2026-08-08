/**
 * Fills in the fulfilment side of the shop — the warehouses, stock and riders
 * an order needs to get through checkout.
 *
 * `POST /api/orders` refuses an order unless, for the pincode given, there is
 * a warehouse, enough unreserved inventory for every line, and a free delivery
 * person. A catalogue alone is not enough to buy anything.
 *
 * Safe to run repeatedly: warehouses are matched on pincode, and stock and
 * riders are only topped up to the targets below, never duplicated.
 *
 *   bun run seed
 */
import 'dotenv/config';
import { and, eq, isNull } from 'drizzle-orm';
import { db, pool } from '../src/db/db';
import { deliveryPersons, inventories, products, warehouses } from '../src/db/schema/schema';

/** Pincodes the shop can deliver to. Real Indian codes, one per city centre. */
const WAREHOUSES = [
    { name: 'Kolkata — Dalhousie', pincode: '700001' },
    { name: 'Kolkata — Park Street', pincode: '700016' },
    { name: 'Mumbai — Fort', pincode: '400001' },
    { name: 'New Delhi — Connaught Place', pincode: '110001' },
    { name: 'Bengaluru — MG Road', pincode: '560001' },
];

/** Unreserved units to keep, per product, per warehouse. */
const STOCK_PER_PRODUCT = 24;
/** Riders to keep free per warehouse. One order pins one rider until delivered. */
const RIDERS_PER_WAREHOUSE = 4;

const RIDER_NAMES = ['Arjun', 'Meera', 'Rahul', 'Ishita', 'Kabir', 'Ananya'];

/** `sku` is unique and only 8 characters, so continue the SKU00000 sequence. */
async function nextSkuFactory() {
    const existing = await db.select({ sku: inventories.sku }).from(inventories);
    let counter = existing.reduce((max, row) => {
        const match = /^SKU(\d{5})$/.exec(row.sku);
        return match ? Math.max(max, Number(match[1])) : max;
    }, -1);

    return () => `SKU${String(++counter).padStart(5, '0')}`;
}

const catalogue = await db.select({ id: products.id, name: products.name }).from(products);

if (!catalogue.length) {
    console.error('No products yet — add some in the admin panel first.');
    await pool.end();
    process.exit(1);
}

const nextSku = await nextSkuFactory();

for (const target of WAREHOUSES) {
    const [existing] = await db
        .select()
        .from(warehouses)
        .where(eq(warehouses.pincode, target.pincode))
        .limit(1);

    // An existing warehouse keeps its name — only the pincode identifies it.
    const warehouse =
        existing ??
        (
            await db
                .insert(warehouses)
                .values({ name: target.name, pincode: target.pincode })
                .returning()
        )[0];

    console.log(
        `${existing ? '·' : '+'} ${warehouse.name} (${warehouse.pincode}) #${warehouse.id}`
    );

    for (const product of catalogue) {
        const free = await db
            .select({ id: inventories.id })
            .from(inventories)
            .where(
                and(
                    eq(inventories.warehouseId, warehouse.id),
                    eq(inventories.productId, product.id),
                    isNull(inventories.orderId)
                )
            );

        const shortfall = STOCK_PER_PRODUCT - free.length;

        if (shortfall > 0) {
            await db.insert(inventories).values(
                Array.from({ length: shortfall }, () => ({
                    sku: nextSku(),
                    warehouseId: warehouse.id,
                    productId: product.id,
                }))
            );
        }

        console.log(`    ${product.name}: ${free.length} → ${Math.max(free.length, STOCK_PER_PRODUCT)}`);
    }

    const freeRiders = await db
        .select({ id: deliveryPersons.id })
        .from(deliveryPersons)
        .where(
            and(eq(deliveryPersons.warehouseId, warehouse.id), isNull(deliveryPersons.orderId))
        );

    const ridersNeeded = RIDERS_PER_WAREHOUSE - freeRiders.length;

    if (ridersNeeded > 0) {
        await db.insert(deliveryPersons).values(
            Array.from({ length: ridersNeeded }, (_, index) => ({
                name: `${RIDER_NAMES[index % RIDER_NAMES.length]} (${target.pincode})`,
                // Ten digits with the country code, inside the 13-char column.
                phone: `+919${String(warehouse.id).padStart(2, '0')}0000${index}`,
                warehouseId: warehouse.id,
            }))
        );
    }

    console.log(
        `    riders: ${freeRiders.length} → ${Math.max(freeRiders.length, RIDERS_PER_WAREHOUSE)} free`
    );
}

console.log(`\n✅ Deliverable pincodes: ${WAREHOUSES.map((w) => w.pincode).join(', ')}`);
await pool.end();
