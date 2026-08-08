import { sql } from 'drizzle-orm';
import {
    boolean,
    index,
    integer,
    pgTable,
    serial,
    text,
    timestamp,
    varchar,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    fname: varchar('fname', { length: 100 }).notNull(),
    lname: varchar('lname', { length: 100 }).notNull(),
    email: varchar('email', { length: 100 }).unique().notNull(),
    provider: varchar('provider', { length: 20 }),
    externalId: varchar('external_id', { length: 100 }).notNull(),
    image: text('image'),
    // The customer's default delivery address, used to prefill checkout. Null
    // until they save one — every order still stores its own copy in `orders`.
    address: text('address'),
    role: varchar('role', { length: 12 }).notNull().default('customer'),
    updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
    createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const products = pgTable('products', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    image: text('image'),
    description: text('description'),
    price: integer('price').notNull(),
    // Which kind of chocolate this is — see `PRODUCT_CATEGORIES`. Kept as a
    // plain varchar rather than a pg enum so adding a type is a code change,
    // not a migration. Defaulted so rows written before it existed stay valid.
    category: varchar('category', { length: 20 }).notNull().default('dark'),
    // The tasting detail the shop filters on. All nullable: a chocolate added
    // through the admin form before these were filled in still lists fine, it
    // just doesn't answer the matching filter.
    cocoaPercent: integer('cocoa_percent'),
    // A real Postgres text[], so "any of these notes" is one `&&` overlap in
    // the query rather than a LIKE over a joined string.
    flavourNotes: text('flavour_notes').array(),
    origin: varchar('origin', { length: 60 }),
    weightGrams: integer('weight_grams'),
    vegan: boolean('vegan').notNull().default(false),
    glutenFree: boolean('gluten_free').notNull().default(false),
    updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
    createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const warehouses = pgTable(
    'warehouses',
    {
        id: serial('id').primaryKey(),
        name: varchar('name', { length: 100 }).notNull(),
        pincode: varchar('pincode', { length: 6 }).notNull(),
        updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
        createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
    },
    (table) => [index('pincode_idx').on(table.pincode)]
);

export const orders = pgTable(
    'orders',
    {
        id: serial('id').primaryKey(),
        userId: integer('user_id')
            .references(() => users.id, { onDelete: 'cascade' })
            .notNull(),
        status: varchar('status', { length: 10 }).notNull(),
        type: varchar('type', { length: 6 }).default('quick'),
        price: integer('price').notNull(),
        address: text('address').notNull(),
        productId: integer('product_id')
            .references(() => products.id, { onDelete: 'no action' })
            .notNull(),
        qty: integer('qty').notNull(),
        // One row per cart line. Lines checked out together share a groupId so
        // they can be paid for, released and shown as a single order. Null on
        // rows written before the cart existed.
        groupId: varchar('group_id', { length: 36 }),
        // The moment this reservation stops holding its stock. Set while the
        // order is `reserved` and cleared once it is paid or released, so a
        // non-null value here always means "payment is still outstanding".
        reservedUntil: timestamp('reserved_until'),
        updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
        createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
    },
    (table) => [index('orders_group_id_idx').on(table.groupId)]
);

export const deliveryPersons = pgTable('delivery_persons', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    phone: varchar('phone', { length: 13 }).notNull(),
    warehouseId: integer('warehouse_id').references(() => warehouses.id, { onDelete: 'cascade' }),
    orderId: integer('order_id').references(() => orders.id, { onDelete: 'set null' }),
    updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
    createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const inventories = pgTable('inventories', {
    id: serial('id').primaryKey(),
    sku: varchar('sku', { length: 8 }).unique().notNull(),
    orderId: integer('order_id').references(() => orders.id, { onDelete: 'set null' }),
    warehouseId: integer('warehouse_id').references(() => warehouses.id, { onDelete: 'cascade' }),
    productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }),
    updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`),
    createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
});