import { randomUUID } from 'node:crypto';
import { and, desc, eq, inArray, isNull } from 'drizzle-orm';
import { db } from '@/db/db';
import { deliveryPersons, inventories, orders, products, users, warehouses } from '@/db/schema/schema';
import { requireUser } from '@/lib/auth/session';
import { releaseOrders } from '@/lib/orders/group';
import {
    APP_ORDER_GROUP_NOTE_KEY,
    APP_ORDER_NOTE_KEY,
    RAZORPAY_CURRENCY,
    getRazorpay,
    toPaise,
} from '@/lib/razorpay';
import { cartOrderSchema } from '@/lib/validators/orderSchema';

/** Thrown inside the transaction to roll it back with a client-safe message. */
class OrderError extends Error {}

export async function POST(request: Request) {
    const appUser = await requireUser();
    if (appUser instanceof Response) return appUser;

    const parsed = cartOrderSchema.safeParse(await request.json().catch(() => null));

    if (!parsed.success) {
        return Response.json({ message: parsed.error.issues[0].message }, { status: 400 });
    }

    const { items, address, pincode } = parsed.data;

    const [warehouse] = await db
        .select({ id: warehouses.id })
        .from(warehouses)
        .where(eq(warehouses.pincode, pincode))
        .limit(1);

    if (!warehouse) {
        return Response.json({ message: 'We do not deliver to this pincode yet' }, { status: 400 });
    }

    const productIds = items.map((item) => item.productId);
    const catalogue = await db
        .select({ id: products.id, name: products.name, price: products.price })
        .from(products)
        .where(inArray(products.id, productIds));

    const priced = items.map((item) => {
        const product = catalogue.find((row) => row.id === item.productId);
        return { ...item, product };
    });

    const missing = priced.find((line) => !line.product);
    if (missing) {
        return Response.json({ message: 'One of these chocolates is no longer available' }, { status: 400 });
    }

    // Prices always come from the database, never from the request body.
    const lines = priced.map((line) => ({
        productId: line.productId,
        qty: line.qty,
        name: line.product!.name,
        price: line.product!.price * line.qty,
    }));

    const total = lines.reduce((sum, line) => sum + line.price, 0);
    const groupId = randomUUID();

    let orderIds: number[] = [];

    try {
        orderIds = await db.transaction(async (tx) => {
            const created: number[] = [];

            for (const line of lines) {
                const [order] = await tx
                    .insert(orders)
                    .values({
                        userId: appUser.id,
                        productId: line.productId,
                        qty: line.qty,
                        address,
                        price: line.price,
                        status: 'received',
                        groupId,
                    })
                    .returning({ id: orders.id });

                created.push(order.id);

                // Claim unreserved stock. SKIP LOCKED lets concurrent checkouts
                // take different rows instead of queueing behind each other.
                const availableStock = await tx
                    .select({ id: inventories.id })
                    .from(inventories)
                    .where(
                        and(
                            eq(inventories.warehouseId, warehouse.id),
                            eq(inventories.productId, line.productId),
                            isNull(inventories.orderId)
                        )
                    )
                    .limit(line.qty)
                    .for('update', { skipLocked: true });

                if (availableStock.length < line.qty) {
                    throw new OrderError(
                        availableStock.length === 0
                            ? `${line.name} is out of stock`
                            : `Only ${availableStock.length} × ${line.name} left in stock`
                    );
                }

                await tx
                    .update(inventories)
                    .set({ orderId: order.id })
                    .where(
                        inArray(
                            inventories.id,
                            availableStock.map((stock) => stock.id)
                        )
                    );
            }

            // One rider carries the whole cart, so the group needs a single
            // delivery person — pinned to the first line of the order.
            const [deliveryPerson] = await tx
                .select({ id: deliveryPersons.id })
                .from(deliveryPersons)
                .where(
                    and(
                        isNull(deliveryPersons.orderId),
                        eq(deliveryPersons.warehouseId, warehouse.id)
                    )
                )
                .limit(1)
                .for('update', { skipLocked: true });

            if (!deliveryPerson) {
                throw new OrderError('No delivery partner is available at the moment');
            }

            await tx
                .update(deliveryPersons)
                .set({ orderId: created[0] })
                .where(eq(deliveryPersons.id, deliveryPerson.id));

            await tx
                .update(orders)
                .set({ status: 'reserved', updatedAt: new Date() })
                .where(eq(orders.groupId, groupId));

            return created;
        });
    } catch (err) {
        if (err instanceof OrderError) {
            return Response.json({ message: err.message }, { status: 409 });
        }
        console.error('POST /api/orders (transaction)', err);
        return Response.json({ message: 'Could not place the order' }, { status: 500 });
    }

    try {
        const razorpayOrder = await getRazorpay().orders.create({
            amount: toPaise(total),
            currency: RAZORPAY_CURRENCY,
            receipt: `group_${groupId.slice(0, 30)}`,
            notes: {
                [APP_ORDER_GROUP_NOTE_KEY]: groupId,
                // Kept for single-line orders so older tooling still resolves them.
                [APP_ORDER_NOTE_KEY]: String(orderIds[0]),
                userId: String(appUser.id),
            },
        });

        return Response.json({
            groupId,
            orderId: orderIds[0],
            orderIds,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            customer: {
                name: `${appUser.fname} ${appUser.lname}`.trim(),
                email: appUser.email,
            },
        });
    } catch (err) {
        console.error('POST /api/orders (razorpay)', err);
        // The reservation is worthless without a payment attempt, so give the
        // stock and the delivery person back.
        await releaseOrders(orderIds).catch((releaseErr) =>
            console.error('POST /api/orders (release)', releaseErr)
        );
        return Response.json({ message: 'Failed to start the payment' }, { status: 502 });
    }
}

export async function GET() {
    const admin = await requireUser();
    if (admin instanceof Response) return admin;
    if (admin.role !== 'admin') {
        return Response.json({ message: 'Not allowed' }, { status: 403 });
    }

    try {
        const allOrders = await db
            .select({
                id: orders.id,
                product: products.name,
                productId: products.id,
                userId: users.id,
                user: users.fname,
                type: orders.type,
                price: orders.price,
                image: products.image,
                status: orders.status,
                address: orders.address,
                qty: orders.qty,
                groupId: orders.groupId,
                createdAt: orders.createdAt,
            })
            .from(orders)
            .leftJoin(products, eq(orders.productId, products.id))
            .leftJoin(users, eq(orders.userId, users.id))
            .orderBy(desc(orders.id))
            .limit(100);

        return Response.json(allOrders);
    } catch (err) {
        console.error('GET /api/orders', err);
        return Response.json({ message: 'Failed to fetch orders' }, { status: 500 });
    }
}
