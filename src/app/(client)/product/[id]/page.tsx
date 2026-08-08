'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, ChevronRight, Leaf, Loader2, Lock, Star, Truck } from 'lucide-react';

import { Reveal } from '@/components/motion/reveal';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useCheckout } from '@/hooks/use-checkout';
import { ApiError, getSingleProduct } from '@/lib/api';
import { productImageSrc } from '@/lib/images';
import { categoryLabel } from '@/lib/categories';
import { formatPrice } from '@/lib/utils';
import { deliverySchema, type DeliveryFormValues } from '@/lib/validators/orderSchema';
import type { Product } from '@/types';
import { useQuery } from '@tanstack/react-query';
import AddToCart from '../../_components/add-to-cart';
import { notesFor } from '../../_components/product-card';
import QtyStepper from '../../_components/qty-stepper';

const pillars = [
    { icon: Leaf, label: 'Single origin', copy: 'Ethically sourced cacao' },
    { icon: Truck, label: 'Ten minutes', copy: 'From the nearest atelier' },
    { icon: Lock, label: 'Secure payment', copy: 'Protected by Razorpay' },
];

export default function ProductPage() {
    const params = useParams<{ id: string }>();
    const id = params.id;

    const [qty, setQty] = React.useState(1);
    const [buyNow, setBuyNow] = React.useState(false);

    const { data: product, isLoading, isError, error } = useQuery<Product>({
        queryKey: ['product', id],
        queryFn: () => getSingleProduct(id),
        enabled: Boolean(id),
        retry: (failureCount, err) =>
            // A missing product is a 404, not something to keep retrying.
            !(err instanceof ApiError && err.status === 404) && failureCount < 2,
    });

    const form = useForm<DeliveryFormValues>({
        resolver: zodResolver(deliverySchema),
        defaultValues: { address: '', pincode: '' },
        mode: 'onBlur',
    });

    const { checkout, busy } = useCheckout({ description: product?.name });

    if (isError && error instanceof ApiError && error.status === 404) {
        notFound();
    }

    const onSubmit = (values: DeliveryFormValues) =>
        checkout({
            address: values.address,
            pincode: values.pincode,
            items: [{ productId: Number(id), qty }],
        });

    return (
        <>
            <nav aria-label="Breadcrumb" className="border-b border-border bg-background">
                <ol className="shell flex items-center gap-2 py-3.5 text-[0.7rem] text-cocoa-500">
                    <li>
                        <Link href="/" className="transition-colors hover:text-cocoa-800">
                            Home
                        </Link>
                    </li>
                    <ChevronRight className="size-3 text-cocoa-300" aria-hidden="true" />
                    <li>
                        <Link href="/shop" className="transition-colors hover:text-cocoa-800">
                            Collection
                        </Link>
                    </li>
                    <ChevronRight className="size-3 text-cocoa-300" aria-hidden="true" />
                    <li aria-current="page" className="truncate text-cocoa-800">
                        {product?.name ?? '—'}
                    </li>
                </ol>
            </nav>

            <section className="bg-ivory-dim">
                <div className="shell grid gap-10 py-12 lg:grid-cols-2 lg:gap-16 lg:py-20">
                    <div>
                        {isLoading ? (
                            <Skeleton className="aspect-square w-full rounded-none bg-cocoa-100" />
                        ) : (
                            <Reveal
                                direction="none"
                                className="relative aspect-square w-full overflow-hidden bg-background shadow-e-lg">
                                <Image
                                    src={productImageSrc(product?.image)}
                                    alt={product?.name ?? 'Chococart bar'}
                                    fill
                                    priority
                                    sizes="(min-width: 1024px) 46vw, 100vw"
                                    className="object-cover"
                                />
                            </Reveal>
                        )}
                    </div>

                    {isError && !(error instanceof ApiError && error.status === 404) ? (
                        <div className="flex flex-col items-start gap-3">
                            <AlertCircle className="size-6 text-destructive" strokeWidth={1.4} />
                            <h1 className="display-3 text-cocoa-800">
                                We could not load this chocolate
                            </h1>
                            <p className="text-[0.85rem] text-cocoa-500">
                                {error instanceof Error
                                    ? error.message
                                    : 'Please try again in a moment.'}
                            </p>
                            <Link
                                href="/shop"
                                className="eyebrow link-underline mt-3 text-cocoa-800">
                                Back to the collection
                            </Link>
                        </div>
                    ) : isLoading ? (
                        <div className="flex flex-col gap-4">
                            <Skeleton className="h-3 w-24 rounded-none bg-cocoa-100" />
                            <Skeleton className="h-12 w-2/3 rounded-none bg-cocoa-100" />
                            <Skeleton className="h-3 w-40 rounded-none bg-cocoa-100" />
                            <Skeleton className="mt-4 h-24 w-full rounded-none bg-cocoa-100" />
                            <Skeleton className="mt-6 h-13 w-full rounded-none bg-cocoa-100" />
                        </div>
                    ) : (
                        product && (
                            <div className="flex flex-col">
                                <span className="eyebrow text-cocoa-500">
                                    {categoryLabel(product.category)} · Small batch
                                </span>

                                <h1 className="display-2 mt-4 text-cocoa-800">{product.name}</h1>

                                <p className="eyebrow mt-3 text-[0.5625rem] text-cocoa-500">
                                    {notesFor(product).join(' · ')}
                                </p>

                                <div className="mt-5 flex items-center gap-3">
                                    <span
                                        className="flex items-center gap-0.5"
                                        aria-label="Rated 4 out of 5">
                                        {Array.from({ length: 5 }).map((_, index) => (
                                            <Star
                                                key={index}
                                                className="size-3.5 text-gold"
                                                strokeWidth={1.2}
                                                fill={index < 4 ? 'currentColor' : 'none'}
                                                aria-hidden="true"
                                            />
                                        ))}
                                    </span>
                                    <span className="tnum text-[0.75rem] text-cocoa-500">
                                        4.0 · 144 reviews
                                    </span>
                                </div>

                                <p className="tnum mt-6 font-heading text-3xl font-medium text-cocoa-800">
                                    {formatPrice(product.price)}
                                </p>

                                <p className="prose-body mt-5 text-cocoa-600">
                                    {product.description ??
                                        'A small-batch bar, tempered by hand for a clean snap and a long, balanced finish.'}
                                </p>

                                <div className="rule-gold mt-8 w-24" />

                                <div className="mt-8 flex flex-wrap items-center gap-5">
                                    <div>
                                        <p className="eyebrow mb-2.5 text-[0.5625rem] text-cocoa-600">
                                            Quantity
                                        </p>
                                        <QtyStepper
                                            value={qty}
                                            onChange={setQty}
                                            disabled={busy}
                                        />
                                    </div>
                                    <div className="min-w-[12rem] flex-1">
                                        <p className="eyebrow mb-2.5 text-[0.5625rem] text-cocoa-600">
                                            Total
                                        </p>
                                        <p className="tnum font-heading text-2xl font-medium text-cocoa-800">
                                            {formatPrice(product.price * qty)}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-8 space-y-3">
                                    <AddToCart
                                        product={product}
                                        qty={qty}
                                        variant="solid"
                                        label={`Add to cart — ${formatPrice(product.price * qty)}`}
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setBuyNow((open) => !open)}
                                        aria-expanded={buyNow}
                                        className="eyebrow h-13 w-full border border-cocoa-800 text-cocoa-800 transition-colors hover:bg-cocoa-800 hover:text-ivory">
                                        {buyNow ? 'Hide quick checkout' : 'Buy it now'}
                                    </button>
                                </div>

                                {buyNow && (
                                    <Form {...form}>
                                        <form
                                            onSubmit={form.handleSubmit(onSubmit)}
                                            noValidate
                                            className="mt-6 space-y-5 border border-border bg-card p-5">
                                            <p className="eyebrow text-[0.5625rem] text-cocoa-500">
                                                Skip the cart — deliver this bar now
                                            </p>

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
                                                                rows={2}
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
                                                                onChange={(event) =>
                                                                    field.onChange(
                                                                        event.target.value
                                                                            .replace(/\D/g, '')
                                                                            .slice(0, 6)
                                                                    )
                                                                }
                                                            />
                                                        </FormControl>
                                                        <FormMessage className="text-xs" />
                                                    </FormItem>
                                                )}
                                            />

                                            <button
                                                type="submit"
                                                disabled={busy}
                                                className="eyebrow flex h-12 w-full items-center justify-center gap-2.5 bg-cocoa-800 text-ivory transition-colors hover:bg-cocoa-900 disabled:opacity-60">
                                                {busy && (
                                                    <Loader2 className="size-4 animate-spin" />
                                                )}
                                                {busy
                                                    ? 'Processing'
                                                    : `Pay ${formatPrice(product.price * qty)}`}
                                            </button>
                                        </form>
                                    </Form>
                                )}

                                <ul className="mt-9 grid gap-5 border-t border-border pt-7 sm:grid-cols-3">
                                    {pillars.map((pillar) => (
                                        <li key={pillar.label} className="flex items-start gap-3">
                                            <pillar.icon
                                                className="mt-0.5 size-4 shrink-0 text-gold"
                                                strokeWidth={1.4}
                                                aria-hidden="true"
                                            />
                                            <div>
                                                <p className="eyebrow text-[0.5rem] text-cocoa-800">
                                                    {pillar.label}
                                                </p>
                                                <p className="mt-1 text-[0.7rem] leading-relaxed text-cocoa-500">
                                                    {pillar.copy}
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )
                    )}
                </div>
            </section>
        </>
    );
}
