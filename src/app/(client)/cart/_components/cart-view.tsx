'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, Loader2, Lock, ShoppingBag, Trash2, Truck } from 'lucide-react';

import { Reveal } from '@/components/motion/reveal';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCheckout } from '@/hooks/use-checkout';
import { getProfile } from '@/lib/api';
import { productImageSrc } from '@/lib/images';
import { formatPrice } from '@/lib/utils';
import { deliverySchema, type DeliveryFormValues } from '@/lib/validators/orderSchema';
import { selectCartCount, selectCartSubtotal, useCartStore } from '@/store/cart/cart-store';
import type { Profile } from '@/types';
import QtyStepper from '../../_components/qty-stepper';

export default function CartView() {
    const lines = useCartStore((state) => state.lines);
    const hydrated = useCartStore((state) => state.hydrated);
    const setQty = useCartStore((state) => state.setQty);
    const remove = useCartStore((state) => state.remove);
    const clear = useCartStore((state) => state.clear);
    const count = useCartStore(selectCartCount);
    const subtotal = useCartStore(selectCartSubtotal);

    const form = useForm<DeliveryFormValues>({
        resolver: zodResolver(deliverySchema),
        defaultValues: { address: '', pincode: '' },
        mode: 'onBlur',
    });

    const { data: profile } = useQuery<Profile>({ queryKey: ['profile'], queryFn: getProfile });

    // Start from the address saved on the profile, but never overwrite anything
    // typed here — a gift can go somewhere else without changing the account.
    const { setValue, getValues } = form;
    React.useEffect(() => {
        if (profile?.address && !getValues('address')) {
            setValue('address', profile.address);
        }
    }, [profile, setValue, getValues]);

    const { checkout, busy } = useCheckout({
        description: `${count} ${count === 1 ? 'bar' : 'bars'} from Chococart`,
        onPaid: clear,
    });

    const onSubmit = (values: DeliveryFormValues) =>
        checkout({
            address: values.address,
            pincode: values.pincode,
            items: lines.map((line) => ({ productId: line.productId, qty: line.qty })),
        });

    // Until the persisted cart is read back, neither state is correct to show.
    if (!hydrated) {
        return (
            <div className="shell flex min-h-[24rem] items-center justify-center py-20">
                <Loader2 className="size-5 animate-spin text-cocoa-400" aria-label="Loading cart" />
            </div>
        );
    }

    if (lines.length === 0) {
        return (
            <div className="shell py-20 lg:py-28">
                <Reveal className="mx-auto flex max-w-md flex-col items-center text-center">
                    <ShoppingBag className="size-9 text-cocoa-300" strokeWidth={1.1} />
                    <h1 className="display-3 mt-6 text-cocoa-800">Your cart is empty</h1>
                    <p className="prose-body mt-4 text-cocoa-600">
                        Nothing chosen yet. Every bar is tempered by hand in small batches — start
                        with the one that sounds most like you.
                    </p>
                    <Link
                        href="/shop"
                        className="eyebrow mt-9 inline-flex items-center gap-3 bg-cocoa-800 px-8 py-4 text-ivory transition-colors hover:bg-cocoa-900">
                        Browse the collection
                    </Link>
                </Reveal>
            </div>
        );
    }

    return (
        <div className="shell py-12 lg:py-16">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:gap-16">
                <section aria-labelledby="cart-items-heading">
                    <div className="flex items-baseline justify-between border-b border-border pb-4">
                        <h2
                            id="cart-items-heading"
                            className="eyebrow font-sans text-cocoa-600">
                            Cart items ({count})
                        </h2>
                        <button
                            type="button"
                            onClick={clear}
                            disabled={busy}
                            className="eyebrow link-underline text-[0.5625rem] text-cocoa-500 transition-colors hover:text-destructive disabled:opacity-50">
                            Empty cart
                        </button>
                    </div>

                    <ul className="divide-y divide-border">
                        <AnimatePresence initial={false}>
                            {lines.map((line) => (
                                <motion.li
                                    key={line.productId}
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                                    className="overflow-hidden">
                                    <div className="flex gap-5 py-6 sm:gap-7">
                                        <Link
                                            href={`/product/${line.productId}`}
                                            className="relative size-24 shrink-0 overflow-hidden bg-ivory-dim sm:size-28">
                                            <Image
                                                src={productImageSrc(line.image)}
                                                alt={line.name}
                                                fill
                                                sizes="112px"
                                                className="object-cover"
                                            />
                                        </Link>

                                        <div className="flex min-w-0 flex-1 flex-col">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="min-w-0">
                                                    <h3 className="font-heading text-xl leading-snug font-medium text-cocoa-800">
                                                        <Link
                                                            href={`/product/${line.productId}`}
                                                            className="hover:text-cocoa-950">
                                                            {line.name}
                                                        </Link>
                                                    </h3>
                                                    <p className="tnum mt-1 text-[0.775rem] text-cocoa-500">
                                                        {formatPrice(line.price)} each
                                                    </p>
                                                </div>
                                                <span className="tnum shrink-0 text-sm font-medium text-cocoa-800">
                                                    {formatPrice(line.price * line.qty)}
                                                </span>
                                            </div>

                                            <div className="mt-auto flex items-center gap-4 pt-5">
                                                <QtyStepper
                                                    size="sm"
                                                    value={line.qty}
                                                    disabled={busy}
                                                    onChange={(qty) => setQty(line.productId, qty)}
                                                    label={`quantity of ${line.name}`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => remove(line.productId)}
                                                    disabled={busy}
                                                    className="flex items-center gap-1.5 text-[0.7rem] text-cocoa-400 transition-colors hover:text-destructive disabled:opacity-50">
                                                    <Trash2 className="size-3.5" />
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.li>
                            ))}
                        </AnimatePresence>
                    </ul>

                    <Link
                        href="/shop"
                        className="eyebrow link-underline mt-8 inline-flex items-center gap-2.5 text-cocoa-600">
                        <ArrowLeft className="size-3.5" />
                        Continue shopping
                    </Link>
                </section>

                <aside className="lg:sticky lg:top-32 lg:self-start">
                    <div className="border border-border bg-card p-6 shadow-e-sm sm:p-7">
                        <h2 className="eyebrow font-sans text-cocoa-600">Order summary</h2>

                        <dl className="mt-6 space-y-3.5 text-[0.85rem]">
                            <div className="flex items-baseline justify-between">
                                <dt className="text-cocoa-600">Subtotal</dt>
                                <dd className="tnum text-cocoa-800">{formatPrice(subtotal)}</dd>
                            </div>
                            <div className="flex items-baseline justify-between">
                                <dt className="text-cocoa-600">Delivery</dt>
                                <dd className="text-cocoa-800">Complimentary</dd>
                            </div>
                        </dl>

                        <div className="rule-gold my-6" />

                        <div className="flex items-baseline justify-between">
                            <span className="eyebrow text-cocoa-700">Order total</span>
                            <span className="tnum font-heading text-3xl font-medium text-cocoa-800">
                                {formatPrice(subtotal)}
                            </span>
                        </div>

                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                noValidate
                                className="mt-7 space-y-5">
                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="eyebrow text-cocoa-600">
                                                Delivery address
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    rows={3}
                                                    autoComplete="street-address"
                                                    className="resize-none rounded-none bg-background"
                                                    placeholder="Flat, building, street, landmark"
                                                    disabled={busy}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-xs" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="pincode"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="eyebrow text-cocoa-600">
                                                Pincode
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    inputMode="numeric"
                                                    autoComplete="postal-code"
                                                    maxLength={6}
                                                    className="tnum h-11 rounded-none bg-background"
                                                    placeholder="400001"
                                                    disabled={busy}
                                                    {...field}
                                                    // Digits only, so the field can never hold
                                                    // something the API would reject.
                                                    onChange={(event) =>
                                                        field.onChange(
                                                            event.target.value
                                                                .replace(/\D/g, '')
                                                                .slice(0, 6)
                                                        )
                                                    }
                                                />
                                            </FormControl>
                                            <FormDescription className="text-[0.7rem]">
                                                We deliver from the atelier nearest to you.
                                            </FormDescription>
                                            <FormMessage className="text-xs" />
                                        </FormItem>
                                    )}
                                />

                                <button
                                    type="submit"
                                    disabled={busy}
                                    className="eyebrow flex h-13 w-full items-center justify-center gap-2.5 bg-cocoa-800 text-ivory transition-colors hover:bg-cocoa-900 disabled:opacity-60">
                                    {busy && <Loader2 className="size-4 animate-spin" />}
                                    {busy ? 'Processing' : `Pay ${formatPrice(subtotal)}`}
                                </button>
                            </form>
                        </Form>

                        <ul className="mt-6 space-y-2.5 text-[0.7rem] text-cocoa-500">
                            <li className="flex items-center gap-2">
                                <Lock className="size-3 text-gold" aria-hidden="true" />
                                Secure payment through Razorpay
                            </li>
                            <li className="flex items-center gap-2">
                                <Truck className="size-3 text-gold" aria-hidden="true" />
                                Delivered in about ten minutes
                            </li>
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    );
}
