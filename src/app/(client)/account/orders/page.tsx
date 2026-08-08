'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, ArrowRight, MapPin, Package } from 'lucide-react';

import { Reveal } from '@/components/motion/reveal';
import { Skeleton } from '@/components/ui/skeleton';
import { getMyOrders } from '@/lib/api';
import { productImageSrc } from '@/lib/images';
import { cn, formatDate, formatPrice } from '@/lib/utils';
import type { MyOrder, MyOrderGroup } from '@/types';
import { BrandMark } from '../../_components/brand-mark';

/** How far along an order is. Lines checked out together share these stages. */
const STAGES = ['reserved', 'paid', 'shipped', 'completed'] as const;

const STAGE_LABEL: Record<string, string> = {
    received: 'Received',
    reserved: 'Awaiting payment',
    paid: 'Paid',
    shipped: 'Out for delivery',
    completed: 'Delivered',
    failed: 'Payment failed',
};

const STATUS_TONE: Record<string, string> = {
    received: 'border-cocoa-300 text-cocoa-600',
    reserved: 'border-copper/50 text-copper',
    paid: 'border-gold/60 text-copper',
    shipped: 'border-gold/60 text-copper',
    completed: 'border-cocoa-800/30 text-cocoa-800',
    failed: 'border-destructive/40 text-destructive',
};

/**
 * A cart's lines are separate rows sharing a `groupId`. Fold them back into the
 * order the customer actually placed; rows written before the cart existed have
 * no group and stand alone.
 */
function groupOrders(rows: MyOrder[]): MyOrderGroup[] {
    const groups = new Map<string, MyOrderGroup>();

    for (const row of rows) {
        const key = row.groupId ?? `order-${row.id}`;
        const group = groups.get(key);

        if (group) {
            group.lines.push(row);
            group.total += row.price;
        } else {
            groups.set(key, {
                key,
                createdAt: row.createdAt,
                address: row.address,
                status: row.status,
                total: row.price,
                lines: [row],
            });
        }
    }

    // A group is only as far along as its least advanced line.
    for (const group of groups.values()) {
        const stages = group.lines.map((line) => line.status);
        group.status =
            stages.find((status) => status === 'failed') ??
            STAGES.find((stage) => stages.includes(stage)) ??
            stages[0];
    }

    return [...groups.values()];
}

function StatusPill({ status }: { status: string }) {
    return (
        <span
            className={cn(
                'eyebrow inline-block border px-3 py-1.5 text-[0.5625rem] whitespace-nowrap',
                STATUS_TONE[status] ?? 'border-cocoa-300 text-cocoa-600'
            )}>
            {STAGE_LABEL[status] ?? status}
        </span>
    );
}

/** Four-step progress rail. Hidden for failed orders, which never progressed. */
function Progress({ status }: { status: string }) {
    const current = STAGES.indexOf(status as (typeof STAGES)[number]);

    return (
        <ol className="mt-6 grid grid-cols-4 gap-2">
            {STAGES.map((stage, index) => {
                const done = index <= current;
                return (
                    <li key={stage} className="flex flex-col gap-2">
                        <span
                            className={cn(
                                'h-0.5 w-full transition-colors',
                                done ? 'bg-gold' : 'bg-border'
                            )}
                            aria-hidden="true"
                        />
                        <span
                            className={cn(
                                'eyebrow text-[0.5rem] leading-tight',
                                done ? 'text-cocoa-700' : 'text-cocoa-400'
                            )}>
                            {STAGE_LABEL[stage]}
                        </span>
                    </li>
                );
            })}
        </ol>
    );
}

export default function MyOrdersPage() {
    const {
        data: myOrders,
        isLoading,
        isError,
        error,
    } = useQuery<MyOrder[]>({
        queryKey: ['my-orders'],
        queryFn: getMyOrders,
    });

    const groups = React.useMemo(() => groupOrders(myOrders ?? []), [myOrders]);

    return (
        <>
            <section className="border-b border-border bg-ivory-dim">
                <div className="shell py-12 lg:py-16">
                    <div className="flex items-center gap-3">
                        <BrandMark className="h-5 text-gold" />
                        <span className="eyebrow text-cocoa-500">Your account</span>
                    </div>
                    <h1 className="display-2 mt-5 text-cocoa-800">Order History</h1>
                    <p className="prose-body mt-4 text-cocoa-600">
                        Every box you have ordered, and exactly where it is right now.
                    </p>
                </div>
            </section>

            <section className="bg-background">
                <div className="shell py-12 lg:py-16">
                    {isLoading && (
                        <div className="space-y-6">
                            {Array.from({ length: 2 }).map((_, index) => (
                                <Skeleton
                                    key={index}
                                    className="h-64 w-full rounded-none bg-cocoa-100"
                                />
                            ))}
                        </div>
                    )}

                    {isError && (
                        <div className="flex flex-col items-start gap-3 border border-border bg-card px-6 py-10">
                            <AlertCircle className="size-6 text-destructive" strokeWidth={1.4} />
                            <h2 className="display-3 text-cocoa-800">
                                We could not load your orders
                            </h2>
                            <p className="text-[0.85rem] text-cocoa-500">
                                {error instanceof Error
                                    ? error.message
                                    : 'Please try again in a moment.'}
                            </p>
                        </div>
                    )}

                    {!isLoading && !isError && groups.length === 0 && (
                        <div className="flex flex-col items-center gap-5 border border-border bg-card px-6 py-20 text-center">
                            <Package className="size-8 text-cocoa-300" strokeWidth={1.2} />
                            <h2 className="display-3 text-cocoa-800">No orders yet</h2>
                            <p className="max-w-sm text-[0.85rem] leading-relaxed text-cocoa-500">
                                When you order, every box will appear here with its live delivery
                                status.
                            </p>
                            <Link
                                href="/shop"
                                className="group mt-2 flex items-center gap-3 bg-cocoa-800 px-8 py-4 text-ivory transition-colors hover:bg-cocoa-900">
                                <span className="eyebrow">Shop the collection</span>
                                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                    )}

                    <div className="space-y-8">
                        {groups.map((group) => (
                            <Reveal key={group.key} direction="up">
                                <article className="border border-border bg-card shadow-e-sm">
                                    <header className="flex flex-wrap items-start justify-between gap-6 border-b border-border px-6 py-5">
                                        <div className="flex flex-wrap gap-x-10 gap-y-4">
                                            <div>
                                                <p className="eyebrow text-[0.5rem] text-cocoa-500">
                                                    Date placed
                                                </p>
                                                <p className="mt-1.5 text-[0.85rem] text-cocoa-800">
                                                    {formatDate(group.createdAt)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="eyebrow text-[0.5rem] text-cocoa-500">
                                                    Order total
                                                </p>
                                                <p className="tnum mt-1.5 text-[0.85rem] font-medium text-cocoa-800">
                                                    {formatPrice(group.total)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="eyebrow text-[0.5rem] text-cocoa-500">
                                                    Reference
                                                </p>
                                                <p className="tnum mt-1.5 text-[0.85rem] text-cocoa-800">
                                                    #{group.lines[0].id}
                                                </p>
                                            </div>
                                        </div>
                                        <StatusPill status={group.status} />
                                    </header>

                                    <ul className="divide-y divide-border">
                                        {group.lines.map((line) => (
                                            <li
                                                key={line.id}
                                                className="flex flex-wrap gap-5 px-6 py-6 sm:flex-nowrap">
                                                <Link
                                                    href={`/product/${line.productId}`}
                                                    className="relative size-24 shrink-0 overflow-hidden bg-ivory-dim">
                                                    <Image
                                                        src={productImageSrc(line.image)}
                                                        alt={line.product ?? 'Chococart bar'}
                                                        fill
                                                        sizes="96px"
                                                        className="object-cover"
                                                    />
                                                </Link>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                                                        <h3 className="font-heading text-xl font-medium text-cocoa-800">
                                                            {line.product ?? 'Chocolate'}
                                                        </h3>
                                                        <span className="tnum text-[0.9rem] font-medium text-cocoa-800">
                                                            {formatPrice(line.price)}
                                                        </span>
                                                    </div>
                                                    <p className="tnum mt-1 text-[0.7rem] text-cocoa-500">
                                                        Quantity {line.qty}
                                                    </p>
                                                    {line.productDescription && (
                                                        <p className="mt-2.5 line-clamp-2 text-[0.8rem] leading-relaxed text-cocoa-500">
                                                            {line.productDescription}
                                                        </p>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>

                                    <footer className="border-t border-border bg-ivory-dim px-6 py-6">
                                        <div className="flex items-start gap-2.5">
                                            <MapPin
                                                className="mt-0.5 size-3.5 shrink-0 text-gold"
                                                strokeWidth={1.4}
                                                aria-hidden="true"
                                            />
                                            <p className="text-[0.75rem] leading-relaxed text-cocoa-600">
                                                {group.address}
                                            </p>
                                        </div>

                                        {group.status === 'failed' ? (
                                            <p className="mt-5 text-[0.75rem] text-destructive">
                                                Payment did not go through, so this order was
                                                released. Nothing was charged.
                                            </p>
                                        ) : (
                                            <Progress status={group.status} />
                                        )}
                                    </footer>
                                </article>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
