'use client';

import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, ShoppingBag } from 'lucide-react';

import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { MAX_LINE_QTY } from '@/lib/validators/orderSchema';
import { useCartStore } from '@/store/cart/cart-store';
import type { Product } from '@/types';

/**
 * Adds a product to the cart and confirms it in place. `variant="solid"` is the
 * primary action on the product page; `"quiet"` is the understated version used
 * inside the collection grid.
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
    variant?: 'solid' | 'quiet';
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

    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={`${label}: ${product.name}`}
            className={cn(
                'group/atc relative inline-flex items-center justify-center gap-2.5 overflow-hidden transition-colors',
                solid
                    ? 'h-13 w-full bg-cocoa-800 px-8 text-ivory hover:bg-cocoa-900'
                    : 'eyebrow link-underline text-cocoa-800 hover:text-cocoa-950',
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
                        Added
                    </motion.span>
                ) : (
                    <motion.span
                        key="idle"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                        className={cn('flex items-center gap-2.5', solid && 'eyebrow')}>
                        {solid && <ShoppingBag className="size-4" aria-hidden="true" />}
                        {label}
                    </motion.span>
                )}
            </AnimatePresence>
        </button>
    );
}
