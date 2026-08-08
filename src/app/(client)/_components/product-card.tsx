'use client';

import Image from 'next/image';
import Link from 'next/link';

import { categoryLabel, noteLabel } from '@/lib/categories';
import { productImageSrc } from '@/lib/images';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types';
import AddToCart from './add-to-cart';

/**
 * The house notes for a chocolate. `flavourNotes` is the real column, but a row
 * added through the admin form leaves it empty — so that case falls back to
 * scraping the description, and then to house notes, rather than showing a gap.
 */
export function notesFor(product: Product) {
    if (product.flavourNotes?.length) {
        return product.flavourNotes.slice(0, 3).map(noteLabel);
    }

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
            {/* The bag button sits over the photograph rather than inside the
                link, so adding to the cart never navigates to the product. */}
            <div className="relative aspect-4/5 w-full overflow-hidden bg-ivory-dim">
                <Link
                    href={`/product/${product.id}`}
                    className="absolute inset-0"
                    aria-label={product.name}>
                    <Image
                        src={productImageSrc(product.image)}
                        alt={product.name}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                    />
                </Link>

                {badge && (
                    <span className="eyebrow pointer-events-none absolute top-3 left-3 bg-ivory/95 px-2.5 py-1.5 text-[0.5rem] text-cocoa-800">
                        {badge}
                    </span>
                )}

                {/* z-10 keeps the bag above the full-bleed image link, so a tap
                    on it always adds rather than opening the product. */}
                <AddToCart
                    product={product}
                    variant="icon"
                    className="absolute right-3 bottom-3 z-10"
                />
            </div>

            <div className="flex flex-1 flex-col items-center px-4 py-5 text-center">
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

                <p className="tnum mt-3 text-sm text-cocoa-700">{formatPrice(product.price)}</p>
            </div>
        </article>
    );
}
