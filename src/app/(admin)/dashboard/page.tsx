import Link from 'next/link';
import { ArrowUpRight, Blocks, IndianRupee, Package, ShoppingCart } from 'lucide-react';
import { count, desc, eq, inArray, isNull, sum } from 'drizzle-orm';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { db } from '@/db/db';
import { inventories, orders, products, users } from '@/db/schema/schema';
import { formatDate, formatPrice } from '@/lib/utils';
import StatusBadge from '../orders/_components/status-badge';

/** Revenue only counts orders that actually got paid for. */
const EARNED = ['paid', 'shipped', 'completed'];

async function getStats() {
    const [[revenue], [orderCount], [productCount], [freeStock]] = await Promise.all([
        db
            .select({ total: sum(orders.price) })
            .from(orders)
            .where(inArray(orders.status, EARNED)),
        db.select({ value: count() }).from(orders),
        db.select({ value: count() }).from(products),
        db.select({ value: count() }).from(inventories).where(isNull(inventories.orderId)),
    ]);

    return {
        revenue: Number(revenue?.total ?? 0),
        orders: orderCount?.value ?? 0,
        products: productCount?.value ?? 0,
        stock: freeStock?.value ?? 0,
    };
}

async function getRecentOrders() {
    return db
        .select({
            id: orders.id,
            product: products.name,
            customer: users.fname,
            email: users.email,
            price: orders.price,
            qty: orders.qty,
            status: orders.status,
            createdAt: orders.createdAt,
        })
        .from(orders)
        .leftJoin(products, eq(orders.productId, products.id))
        .leftJoin(users, eq(orders.userId, users.id))
        .orderBy(desc(orders.id))
        .limit(8);
}

const AdminPage = async () => {
    const [stats, recentOrders] = await Promise.all([getStats(), getRecentOrders()]);

    const cards = [
        {
            label: 'Total Revenue',
            value: formatPrice(stats.revenue),
            hint: 'From paid and completed orders',
            icon: IndianRupee,
        },
        {
            label: 'Orders',
            value: String(stats.orders),
            hint: 'All orders ever placed',
            icon: ShoppingCart,
        },
        {
            label: 'Products',
            value: String(stats.products),
            hint: 'Items in the catalog',
            icon: Package,
        },
        {
            label: 'Available Stock',
            value: String(stats.stock),
            hint: 'Unreserved inventory units',
            icon: Blocks,
        },
    ];

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                {cards.map((card) => (
                    <Card key={card.label}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{card.label}</CardTitle>
                            <card.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{card.value}</div>
                            <p className="text-xs text-muted-foreground">{card.hint}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center">
                    <div className="grid gap-2">
                        <CardTitle>Recent Orders</CardTitle>
                        <CardDescription>The latest orders placed in your store.</CardDescription>
                    </div>
                    <Button
                        render={<Link href="/admin/orders" />}
                        size="sm"
                        className="ml-auto gap-1">
                        View All
                        <ArrowUpRight className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead className="hidden md:table-cell">Qty</TableHead>
                                    <TableHead className="hidden lg:table-cell">Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentOrders.length ? (
                                    recentOrders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell>
                                                <div className="font-medium">
                                                    {order.customer ?? 'Unknown'}
                                                </div>
                                                <div className="hidden text-sm text-muted-foreground md:inline">
                                                    {order.email}
                                                </div>
                                            </TableCell>
                                            <TableCell>{order.product ?? '—'}</TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                {order.qty}
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell">
                                                {formatDate(order.createdAt)}
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge status={order.status} />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatPrice(order.price)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="h-24 text-center text-muted-foreground">
                                            No orders yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </>
    );
};

export default AdminPage;
