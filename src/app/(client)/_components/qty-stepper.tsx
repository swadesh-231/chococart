'use client';

import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MAX_LINE_QTY } from '@/lib/validators/orderSchema';

/**
 * Minus / value / plus, matching the reference's squared-off control. `min={0}`
 * lets the last decrement remove a cart line instead of sticking at 1.
 */
export default function QtyStepper({
    value,
    onChange,
    min = 1,
    max = MAX_LINE_QTY,
    size = 'default',
    disabled,
    label = 'Quantity',
    className,
}: {
    value: number;
    onChange: (qty: number) => void;
    min?: number;
    max?: number;
    size?: 'default' | 'sm';
    disabled?: boolean;
    label?: string;
    className?: string;
}) {
    const compact = size === 'sm';

    return (
        <div
            className={cn(
                'inline-flex items-center border border-input bg-background',
                compact ? 'h-8' : 'h-11',
                className
            )}>
            <button
                type="button"
                aria-label={`Decrease ${label.toLowerCase()}`}
                disabled={disabled || value <= min}
                onClick={() => onChange(value - 1)}
                className={cn(
                    'grid place-items-center text-cocoa-600 transition-colors hover:text-cocoa-900 disabled:opacity-35 disabled:hover:text-cocoa-600',
                    compact ? 'size-8' : 'size-11'
                )}>
                <Minus className={compact ? 'size-3' : 'size-3.5'} />
            </button>

            <span
                aria-live="polite"
                className={cn(
                    'tnum grid place-items-center text-center text-cocoa-800',
                    compact ? 'min-w-7 text-[0.8rem]' : 'min-w-10 text-sm'
                )}>
                {value}
            </span>

            <button
                type="button"
                aria-label={`Increase ${label.toLowerCase()}`}
                disabled={disabled || value >= max}
                onClick={() => onChange(value + 1)}
                className={cn(
                    'grid place-items-center text-cocoa-600 transition-colors hover:text-cocoa-900 disabled:opacity-35 disabled:hover:text-cocoa-600',
                    compact ? 'size-8' : 'size-11'
                )}>
                <Plus className={compact ? 'size-3' : 'size-3.5'} />
            </button>
        </div>
    );
}
