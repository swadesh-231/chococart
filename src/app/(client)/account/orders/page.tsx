'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, ArrowRight, Loader2, MapPin, Package, TimerReset } from 'lucide-react';

import { Reveal } from '@/components/motion/reveal';
import { Skeleton } from '@/components/ui/skeleton';
import { useCheckout } from '@/hooks/use-checkout';
import { getMyOrders } from '@/lib/api';
import { productImageSrc } from '@/lib/images';
import {
    formatCountdown,
    millisRemaining,
    RESERVATION_MINUTES,
} from '@/lib/orders/reservation';
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
    expired: 'Reservation expired',
};

const STATUS_TONE: Record<string, string> = {
    received: 'border-cocoa-300 text-cocoa-600',
    reserved: 'border-copper/50 text-copper',
    paid: 'border-gold/60 text-copper',
    shipped: 'border-gold/60 text-copper',
    completed: 'border-cocoa-800/30 text-cocoa-800',
    failed: 'border-destructive/40 text-destructive',
    expired: 'border-cocoa-400 text-cocoa-500',
};

/** Neither of these ever progressed, so they get a note instead of the rail. */
const ENDED = ['failed', 'expired'];

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
                reservedUntil: row.reservedUntil,
                total: row.price,
                lines: [row],
            });
        }
    }

    for (const group of groups.values()) {
        const stages = group.lines.map((line) => line.status);

        // A group is only as far along as its least advanced line, and a single
        // ended line ends the whole order.
        group.status =
            stages.find((status) => ENDED.includes(status)) ??
            STAGES.find((stage) => stages.includes(stage)) ??
            stages[0];

        // The hold expires as soon as its shortest-lived line does.
        group.reservedUntil = group.lines.reduce<string | null>((soonest, line) => {
            if (!line.reservedUntil) return soonest;
            if (!soonest) return line.reservedUntil;
            return new Date(line.reservedUntil) < new Date(soonest) ? line.reservedUntil : soonest;
        }, null);
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

/**
 * Ticks once a second while a hold is live. Reading the clock during render
 * would desync from the server anyway, so the deadline is the only shared
 * truth — the server re-checks it before taking a payment.
 */
function useMillisRemaining(reservedUntil: string | null): number {
    const [left, setLeft] = React.useState(() => millisRemaining(reservedUntil));

    React.useEffect(() => {
        if (!reservedUntil) return;

        // No synchronous catch-up set here: the initialiser already read the
        // clock at mount, and if the deadline is replaced the first tick
        // corrects it a second later.
        const id = setInterval(() => setLeft(millisRemaining(reservedUntil)), 1000);
        return () => clearInterval(id);
    }, [reservedUntil]);

    return left;
}

/**
 * The panel on an order that is placed but unpaid: how long the chocolate is
 * still being held, and the way back into Razorpay.
 */
function PendingPayment({
    group,
    onPay,
    onExpire,
    busy,
}: {
    group: MyOrderGroup;
    onPay: () => void;
    onExpire: () => void;
    busy: boolean;
}) {
    const left = useMillisRemaining(group.reservedUntil);
    const lapsed = left <= 0;

    // The row is only really expired once the server says so, so ask it to
    // catch up the moment the clock runs out.
    React.useEffect(() => {
        if (lapsed) onExpire();
    }, [lapsed, onExpire]);

    return (
        <div className="mt-5 border border-copper/30 bg-copper/5 px-5 py-5">
            <div className="flex items-start gap-2.5">
                <TimerReset
                    className="mt-0.5 size-4 shrink-0 text-copper"
                    strokeWidth={1.4}
                    aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                    <p className="eyebrow text-[0.5625rem] text-copper">
                        {lapsed ? 'Releasing this order' : 'Payment pending'}
                    </p>

                    {lapsed ? (
                        <p className="mt-2 text-[0.8rem] leading-relaxed text-cocoa-600">
                            The hold has run out and this order is being released. Nothing was
                            charged.
                        </p>
                    ) : (
                        <>
                            <p className="mt-2 text-[0.8rem] leading-relaxed text-cocoa-600">
                                Your chocolate is held for{' '}
                                <span className="tnum font-medium text-cocoa-800">
                                    {formatCountdown(left)}
                                </span>{' '}
                                longer. Pay within that time and it ships; after it, the order is
                                released and nothing is charged.
                            </p>

                            <button
                                type="button"
                                onClick={onPay}
                                disabled={busy}
                                className="eyebrow mt-4 inline-flex h-11 items-center justify-center gap-2.5 bg-cocoa-800 px-7 text-ivory transition-colors hover:bg-cocoa-900 disabled:opacity-60">
                                {busy && <Loader2 className="size-3.5 animate-spin" />}
                                {busy ? 'Opening' : `Complete payment — ${formatPrice(group.total)}`}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

/** Four-step progress rail. Hidden for ended orders, which never progressed. */
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
        refetch,
    } = useQuery<MyOrder[]>({
        queryKey: ['my-orders'],
        queryFn: getMyOrders,
    });

    const groups = React.useMemo(() => groupOrders(myOrders ?? []), [myOrders]);

    // Stable so the countdown's expiry effect doesn't refire every tick.
    const reload = React.useCallback(() => {
        void refetch();
    }, [refetch]);

    const { resumeCheckout, busy } = useCheckout({
        description: 'Chococart order',
        onPaid: reload,
        onUnpaid: reload,
    });

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

                                        {group.status === 'failed' && (
                                            <p className="mt-5 text-[0.75rem] text-destructive">
                                                Payment did not go through, so this order was
                                                released. Nothing was charged.
                                            </p>
                                        )}

                                        {group.status === 'expired' && (
                                            <p className="mt-5 text-[0.75rem] text-cocoa-500">
                                                This order was not paid for within{' '}
                                                {RESERVATION_MINUTES} minutes, so the chocolate went
                                                back on the shelf. Nothing was charged — you are
                                                welcome to order it again.
                                            </p>
                                        )}

                                        {/* Resuming is keyed by groupId, so orders
                                            written before carts existed can only
                                            run out their clock. */}
                                        {group.status === 'reserved' &&
                                            group.reservedUntil &&
                                            group.lines[0].groupId && (
                                                <PendingPayment
                                                    group={group}
                                                    busy={busy}
                                                    onExpire={reload}
                                                    onPay={() =>
                                                        resumeCheckout(group.lines[0].groupId!)
                                                    }
                                                />
                                            )}

                                        {!ENDED.includes(group.status) && (
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
