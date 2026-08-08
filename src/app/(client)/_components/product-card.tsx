'use client';

import Image from 'next/image';
import Link from 'next/link';

import { categoryLabel } from '@/lib/categories';
import { productImageSrc } from '@/lib/images';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types';
import AddToCart from './add-to-cart';

/**
 * Flavour notes are not a column yet, so they're derived from the description —
 * falling back to house notes when there is nothing usable to pull out.
 */
export function notesFor(product: Product) {
    const words = (product.description ?? '')
        .split(/[,.]/)
        .map((part) => part.trim())
        .filter((part) => part.length > 2 && part.length < 14)
        .slice(0, 3);

    return words.length ? words : ['Rich', 'Smooth', 'Intense'];
}

export default function ProductCard({
    product,
    badge,
}: {
    product: Product;
    badge?: string | null;
}) {
    return (
        <article className="group flex h-full flex-col border border-transparent bg-card transition-shadow duration-500 hover:shadow-e-md">
            <Link
                href={`/product/${product.id}`}
                className="relative aspect-4/5 w-full overflow-hidden bg-ivory-dim"
                aria-label={product.name}>
                <Image
                    src={productImageSrc(product.image)}
                    alt={product.name}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                />
                {badge && (
                    <span className="eyebrow absolute top-3 left-3 bg-ivory/95 px-2.5 py-1.5 text-[0.5rem] text-cocoa-800">
                        {badge}
                    </span>
                )}
            </Link>

            <div className="flex flex-1 flex-col items-center px-4 py-6 text-center">
                <p className="eyebrow mb-2 text-[0.5rem] text-gold">
                    {categoryLabel(product.category)}
                </p>

                <h3 className="font-heading text-xl leading-snug font-medium text-cocoa-800 sm:text-2xl">
                    <Link href={`/product/${product.id}`} className="hover:text-cocoa-950">
                        {product.name}
                    </Link>
                </h3>

                <p className="eyebrow mt-2 text-[0.5rem] text-cocoa-500">
                    {notesFor(product).join(' · ')}
                </p>

                <p className="tnum mt-4 text-sm text-cocoa-700">{formatPrice(product.price)}</p>

                <div className="mt-auto pt-5">
                    <AddToCart product={product} />
                </div>
            </div>
        </article>
    );
}
