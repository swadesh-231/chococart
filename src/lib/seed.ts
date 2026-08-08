import { count, inArray, isNull, sql } from 'drizzle-orm';

import catalogue from '@/data/chocolates.json';
import { db } from '@/db/db';
import { deliveryPersons, inventories, products, warehouses } from '@/db/schema/schema';

/**
 * Fills the shop with something to sell.
 *
 * `POST /api/orders` refuses an order unless, for the pincode given, there is a
 * warehouse, enough unreserved inventory for every line and a free rider — so a
 * catalogue on its own is not enough to buy anything. This seeds all four.
 *
 * Written set-based rather than row-by-row: it runs inside a request, and a
 * hundred chocolates across five warehouses is thousands of inventory rows.
 * Safe to run repeatedly — everything below tops up to a target instead of
 * inserting again.
 */

/** Pincodes the shop can deliver to. Real Indian codes, one per city centre. */
const WAREHOUSES = [
    { name: 'Kolkata — Dalhousie', pincode: '700001' },
    { name: 'Kolkata — Park Street', pincode: '700016' },
    { name: 'Mumbai — Fort', pincode: '400001' },
    { name: 'New Delhi — Connaught Place', pincode: '110001' },
    { name: 'Bengaluru — MG Road', pincode: '560001' },
];

/** Unreserved units to keep, per product, per warehouse. */
const STOCK_PER_PRODUCT = 6;
/** Riders to keep free per warehouse. One order pins one rider until delivered. */
const RIDERS_PER_WAREHOUSE = 4;

const RIDER_NAMES = ['Arjun', 'Meera', 'Rahul', 'Ishita', 'Kabir', 'Ananya'];

/** Postgres caps a single statement's parameters, so large inserts go in slices. */
const CHUNK = 500;

async function insertInChunks<T>(rows: T[], insert: (slice: T[]) => Promise<unknown>) {
    for (let i = 0; i < rows.length; i += CHUNK) {
        await insert(rows.slice(i, i + CHUNK));
    }
}

export type SeedReport = {
    productsAdded: number;
    productsTotal: number;
    warehousesAdded: number;
    stockAdded: number;
    ridersAdded: number;
    pincodes: string[];
};

export async function runSeed(): Promise<SeedReport> {
    // ── Catalogue ────────────────────────────────────────────────────────────
    // Matched on name: re-seeding must not duplicate a chocolate, and a name is
    // the only thing the JSON and the table both carry.
    const existingProducts = await db.select({ name: products.name }).from(products);
    const known = new Set(existingProducts.map((row) => row.name));
    const missing = catalogue.filter((item) => !known.has(item.name));

    await insertInChunks(missing, (slice) =>
        db.insert(products).values(
            slice.map((item) => ({
                name: item.name,
                description: item.description,
                image: item.image,
                price: item.price,
                category: item.category,
                cocoaPercent: item.cocoaPercent,
                flavourNotes: item.flavourNotes,
                origin: item.origin,
                weightGrams: item.weightGrams,
                vegan: item.vegan,
                glutenFree: item.glutenFree,
            }))
        )
    );

    const allProducts = await db.select({ id: products.id }).from(products);

    // ── Warehouses ───────────────────────────────────────────────────────────
    const existingWarehouses = await db
        .select({ id: warehouses.id, pincode: warehouses.pincode })
        .from(warehouses);
    const knownPincodes = new Set(existingWarehouses.map((row) => row.pincode));
    const newWarehouses = WAREHOUSES.filter((w) => !knownPincodes.has(w.pincode));

    if (newWarehouses.length) {
        await db.insert(warehouses).values(newWarehouses);
    }

    const wanted = WAREHOUSES.map((w) => w.pincode);
    const liveWarehouses = await db
        .select({ id: warehouses.id, pincode: warehouses.pincode })
        .from(warehouses)
        .where(inArray(warehouses.pincode, wanted));

    // ── Stock ────────────────────────────────────────────────────────────────
    // One grouped count instead of a query per product per warehouse.
    const freeStock = await db
        .select({
            warehouseId: inventories.warehouseId,
            productId: inventories.productId,
            free: count(),
        })
        .from(inventories)
        .where(isNull(inventories.orderId))
        .groupBy(inventories.warehouseId, inventories.productId);

    const stockIndex = new Map(
        freeStock.map((row) => [`${row.warehouseId}:${row.productId}`, row.free])
    );

    const [{ maxSku }] = await db
        .select({
            // Continue the SKU00000 sequence; `sku` is unique and only 8 chars.
            maxSku: sql<number>`coalesce(max(nullif(regexp_replace(${inventories.sku}, '\\D', '', 'g'), '')::int), -1)`,
        })
        .from(inventories);

    let skuCounter = Number(maxSku);
    const nextSku = () => `SKU${String(++skuCounter).padStart(5, '0')}`;

    const stockRows: { sku: string; warehouseId: number; productId: number }[] = [];

    for (const warehouse of liveWarehouses) {
        for (const product of allProducts) {
            const free = stockIndex.get(`${warehouse.id}:${product.id}`) ?? 0;
            for (let i = free; i < STOCK_PER_PRODUCT; i += 1) {
                stockRows.push({
                    sku: nextSku(),
                    warehouseId: warehouse.id,
                    productId: product.id,
                });
            }
        }
    }

    await insertInChunks(stockRows, (slice) => db.insert(inventories).values(slice));

    // ── Riders ───────────────────────────────────────────────────────────────
    const freeRiders = await db
        .select({ warehouseId: deliveryPersons.warehouseId, free: count() })
        .from(deliveryPersons)
        .where(isNull(deliveryPersons.orderId))
        .groupBy(deliveryPersons.warehouseId);

    const riderIndex = new Map(freeRiders.map((row) => [row.warehouseId, row.free]));
    const riderRows: { name: string; phone: string; warehouseId: number }[] = [];

    for (const warehouse of liveWarehouses) {
        const free = riderIndex.get(warehouse.id) ?? 0;
        for (let i = free; i < RIDERS_PER_WAREHOUSE; i += 1) {
            riderRows.push({
                name: `${RIDER_NAMES[i % RIDER_NAMES.length]} (${warehouse.pincode})`,
                // Ten digits with the country code, inside the 13-char column.
                phone: `+919${String(warehouse.id).padStart(2, '0')}0000${i}`,
                warehouseId: warehouse.id,
            });
        }
    }

    if (riderRows.length) {
        await db.insert(deliveryPersons).values(riderRows);
    }

    return {
        productsAdded: missing.length,
        productsTotal: allProducts.length,
        warehousesAdded: newWarehouses.length,
        stockAdded: stockRows.length,
        ridersAdded: riderRows.length,
        pincodes: wanted,
    };
}

/** Whether the shop has anything to sell yet — drives the admin's empty state. */
export async function seedStatus() {
    const [products_] = await db.select({ n: count() }).from(products);
    const [stock] = await db
        .select({ n: count() })
        .from(inventories)
        .where(isNull(inventories.orderId));
    const [riders] = await db
        .select({ n: count() })
        .from(deliveryPersons)
        .where(isNull(deliveryPersons.orderId));
    const [houses] = await db.select({ n: count() }).from(warehouses);

    return {
        products: products_.n,
        freeStock: stock.n,
        freeRiders: riders.n,
        warehouses: houses.n,
        catalogueSize: catalogue.length,
    };
}

/** Used by the admin panel to show which pincodes will actually check out. */
export const DELIVERABLE_PINCODES = WAREHOUSES.map((w) => w.pincode);
