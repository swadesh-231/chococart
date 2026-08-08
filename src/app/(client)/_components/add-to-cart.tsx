'use client';

import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Plus, ShoppingBag } from 'lucide-react';

import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { MAX_LINE_QTY } from '@/lib/validators/orderSchema';
import { useCartStore } from '@/store/cart/cart-store';
import type { Product } from '@/types';

/**
 * Adds a product to the cart and confirms it in place.
 *
 * `solid` is the primary action on the product page, `quiet` an understated
 * text link, and `icon` the small bag button that sits on a card in the
 * collection grid — where a full-width button would shout over the photograph.
 */
export default function AddToCart({
    product,
    qty = 1,
    variant = 'quiet',
    className,
    label = 'Add to cart',
}: {
    product: Product;
    qty?: number;
    variant?: 'solid' | 'quiet' | 'icon';
    className?: string;
    label?: string;
}) {
    const add = useCartStore((state) => state.add);
    const [justAdded, setJustAdded] = React.useState(false);
    const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    React.useEffect(
        () => () => {
            if (timer.current) clearTimeout(timer.current);
        },
        []
    );

    const onClick = () => {
        const result = add(product, qty);

        if (!result.ok) {
            toast.add({
                title:
                    result.reason === 'cart-full'
                        ? 'Your cart is full — check out first'
                        : `You can order at most ${MAX_LINE_QTY} of one bar`,
                type: 'error',
            });
            return;
        }

        setJustAdded(true);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setJustAdded(false), 1800);
    };

    const solid = variant === 'solid';
    const iconOnly = variant === 'icon';

    return (
        <button
            type="button"
            onClick={onClick}
            title={iconOnly ? label : undefined}
            aria-label={`${label}: ${product.name}`}
            className={cn(
                'group/atc relative inline-flex items-center justify-center gap-2.5 overflow-hidden transition-colors',
                solid && 'h-13 w-full bg-cocoa-800 px-8 text-ivory hover:bg-cocoa-900',
                iconOnly &&
                    'size-10 border border-cocoa-200 bg-ivory/95 text-cocoa-800 shadow-e-sm backdrop-blur transition-[background-color,color,transform] hover:scale-105 hover:border-cocoa-800 hover:bg-cocoa-800 hover:text-ivory',
                !solid && !iconOnly && 'eyebrow link-underline text-cocoa-800 hover:text-cocoa-950',
                className
            )}>
            <AnimatePresence mode="wait" initial={false}>
                {justAdded ? (
                    <motion.span
                        key="added"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                        className={cn('flex items-center gap-2', solid && 'eyebrow')}>
                        <Check className="size-4" aria-hidden="true" />
                        {!iconOnly && 'Added'}
                    </motion.span>
                ) : (
                    <motion.span
                        key="idle"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                        className={cn('flex items-center gap-2.5', solid && 'eyebrow')}>
                        {/* A plus reads as "one more" at card size, where a bag
                            is easily mistaken for a link to the cart itself. */}
                        {iconOnly && <Plus className="size-4.5" strokeWidth={1.6} aria-hidden="true" />}
                        {solid && <ShoppingBag className="size-4" aria-hidden="true" />}
                        {!iconOnly && label}
                    </motion.span>
                )}
            </AnimatePresence>
        </button>
    );
}
