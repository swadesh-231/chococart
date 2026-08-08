'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, ShoppingBag, Trash2, Truck } from 'lucide-react';

import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { productImageSrc } from '@/lib/images';
import { formatPrice } from '@/lib/utils';
import { selectCartCount, selectCartSubtotal, useCartStore } from '@/store/cart/cart-store';
import QtyStepper from './qty-stepper';

export default function CartSheet() {
    const [open, setOpen] = React.useState(false);

    const lines = useCartStore((state) => state.lines);
    const hydrated = useCartStore((state) => state.hydrated);
    const setQty = useCartStore((state) => state.setQty);
    const remove = useCartStore((state) => state.remove);
    const count = useCartStore(selectCartCount);
    const subtotal = useCartStore(selectCartSubtotal);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
                render={
                    <button
                        type="button"
                        aria-label={`Cart, ${count} item${count === 1 ? '' : 's'}`}
                        className="relative -m-1 p-1 text-cocoa-600 transition-colors hover:text-cocoa-900"
                    />
                }>
                <ShoppingBag className="size-[1.15rem]" strokeWidth={1.5} />
                {/* Rendered only after rehydration so the server markup matches. */}
                <AnimatePresence>
                    {hydrated && count > 0 && (
                        <motion.span
                            key={count}
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                            className="tnum absolute -top-1.5 -right-2 grid size-[1.05rem] place-items-center rounded-full bg-cocoa-800 text-[0.6rem] font-semibold text-ivory">
                            {count > 9 ? '9+' : count}
                        </motion.span>
                    )}
                </AnimatePresence>
            </SheetTrigger>

            <SheetContent
                side="right"
                className="flex w-full flex-col gap-0 data-[side=right]:sm:max-w-md">
                <div className="border-b border-border px-6 py-5">
                    <SheetTitle className="font-heading text-2xl font-medium text-cocoa-800">
                        Your Cart
                    </SheetTitle>
                    <SheetDescription className="eyebrow mt-1 text-[0.6rem] text-cocoa-500">
                        {count} {count === 1 ? 'bar' : 'bars'} selected
                    </SheetDescription>
                </div>

                {lines.length > 0 && (
                    <div className="flex items-center gap-2.5 border-b border-border bg-ivory-dim px-6 py-3.5">
                        <Truck className="size-3.5 shrink-0 text-gold" strokeWidth={1.4} />
                        <p className="text-[0.75rem] text-cocoa-600">
                            Delivery is complimentary, and takes about ten minutes.
                        </p>
                    </div>
                )}

                <div className="min-h-0 flex-1 overflow-y-auto px-6">
                    {lines.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center gap-4 py-16 text-center">
                            <ShoppingBag
                                className="size-8 text-cocoa-300"
                                strokeWidth={1.2}
                                aria-hidden="true"
                            />
                            <p className="font-heading text-xl text-cocoa-700">
                                Your cart is empty
                            </p>
                            <p className="max-w-[16rem] text-[0.8rem] leading-relaxed text-cocoa-500">
                                Every bar is tempered by hand in small batches. Choose the one that
                                sounds like you.
                            </p>
                            <SheetClose
                                render={
                                    <Link
                                        href="/shop"
                                        className="eyebrow link-underline mt-2 text-cocoa-800"
                                    />
                                }>
                                Browse the collection
                            </SheetClose>
                        </div>
                    ) : (
                        <ul className="divide-y divide-border">
                            <AnimatePresence initial={false}>
                                {lines.map((line) => (
                                    <motion.li
                                        key={line.productId}
                                        layout
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                                        className="overflow-hidden">
                                        <div className="flex gap-4 py-5">
                                            <Link
                                                href={`/product/${line.productId}`}
                                                onClick={() => setOpen(false)}
                                                className="relative size-20 shrink-0 overflow-hidden bg-ivory-dim">
                                                <Image
                                                    src={productImageSrc(line.image)}
                                                    alt={line.name}
                                                    fill
                                                    sizes="80px"
                                                    className="object-cover"
                                                />
                                            </Link>

                                            <div className="flex min-w-0 flex-1 flex-col">
                                                <div className="flex items-start justify-between gap-3">
                                                    <Link
                                                        href={`/product/${line.productId}`}
                                                        onClick={() => setOpen(false)}
                                                        className="font-heading text-lg leading-snug text-cocoa-800 hover:text-cocoa-950">
                                                        {line.name}
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        aria-label={`Remove ${line.name}`}
                                                        onClick={() => remove(line.productId)}
                                                        className="-m-1 p-1 text-cocoa-400 transition-colors hover:text-destructive">
                                                        <Trash2 className="size-3.5" />
                                                    </button>
                                                </div>

                                                <p className="tnum mt-0.5 text-[0.75rem] text-cocoa-500">
                                                    {formatPrice(line.price)} each
                                                </p>

                                                <div className="mt-3 flex items-center justify-between gap-3">
                                                    <QtyStepper
                                                        size="sm"
                                                        min={1}
                                                        value={line.qty}
                                                        onChange={(qty) =>
                                                            setQty(line.productId, qty)
                                                        }
                                                        label={`quantity of ${line.name}`}
                                                    />
                                                    <span className="tnum text-sm font-medium text-cocoa-800">
                                                        {formatPrice(line.price * line.qty)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.li>
                                ))}
                            </AnimatePresence>
                        </ul>
                    )}
                </div>

                {lines.length > 0 && (
                    <div className="border-t border-border px-6 py-5">
                        <div className="flex items-baseline justify-between">
                            <span className="eyebrow text-cocoa-600">Subtotal</span>
                            <span className="tnum font-heading text-2xl font-medium text-cocoa-800">
                                {formatPrice(subtotal)}
                            </span>
                        </div>
                        <p className="mt-1.5 text-[0.7rem] text-cocoa-500">
                            Delivery is calculated at checkout.
                        </p>

                        <SheetClose
                            render={
                                <Link
                                    href="/cart"
                                    className="group mt-5 flex w-full items-center justify-center gap-3 bg-cocoa-800 py-4 text-ivory transition-colors hover:bg-cocoa-900"
                                />
                            }>
                            <span className="eyebrow">Proceed to checkout</span>
                            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                        </SheetClose>

                        <SheetClose
                            render={
                                <Link
                                    href="/shop"
                                    className="eyebrow link-underline mx-auto mt-4 block w-fit text-[0.65rem] text-cocoa-500"
                                />
                            }>
                            Continue shopping
                        </SheetClose>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
