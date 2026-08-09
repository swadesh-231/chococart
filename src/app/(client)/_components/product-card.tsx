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
        // `rounded-xl` is 0.35rem in this theme — the radius scale is built on
        // the house's near-square `--radius: 0.25rem` — so the corner is set
        // explicitly to the 14px a shopping card actually wants.
        <article className="group flex h-full flex-col overflow-hidden rounded-[0.875rem] border border-border/70 bg-card transition-[box-shadow,transform] duration-500 hover:-translate-y-0.5 hover:border-border hover:shadow-e-md">
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
                        sizes="(min-width: 1280px) 15vw, (min-width: 1024px) 21vw, 45vw"
                        className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-103"
                    />
                </Link>

                {badge && (
                    <span className="eyebrow pointer-events-none absolute top-2 left-2 rounded-full bg-ivory/95 px-2.5 py-1 text-[0.4375rem] text-cocoa-800">
                        {badge}
                    </span>
                )}

                {/* z-10 keeps the bag above the full-bleed image link, so a tap
                    on it always adds rather than opening the product. */}
                <AddToCart
                    product={product}
                    variant="icon"
                    className="absolute right-2 bottom-2 z-10 size-9 rounded-full"
                />
            </div>

            <div className="flex flex-1 flex-col p-3.5">
                <p className="eyebrow text-[0.4375rem] text-caramel">
                    {categoryLabel(product.category)}
                </p>

                {/* Exactly two lines, always: clamped so a long box name cannot
                    push the row out of line, and reserved so a short one still
                    leaves the notes beneath it where its neighbours' are. */}
                <h3 className="mt-1.5 min-h-[2lh] font-heading text-[0.9375rem] leading-snug font-medium text-cocoa-950 sm:text-base">
                    <Link
                        href={`/product/${product.id}`}
                        className="line-clamp-2 transition-colors hover:text-cocoa-700">
                        {product.name}
                    </Link>
                </h3>

                <p className="mt-1 line-clamp-1 text-[0.7rem] text-cocoa-500">
                    {notesFor(product).join(' · ')}
                </p>

                {/* Pushed to the bottom so prices sit on one line across a row
                    whatever the names above them do. */}
                <p className="tnum mt-auto pt-2.5 text-[0.8125rem] text-cocoa-800">
                    {formatPrice(product.price)}
                </p>
            </div>
        </article>
    );
}
