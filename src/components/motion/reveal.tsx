'use client';

import React from 'react';
import { motion, useReducedMotion, type Variants } from 'motion/react';

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

const OFFSET: Record<Direction, { x: number; y: number }> = {
    up: { x: 0, y: 28 },
    down: { x: 0, y: -28 },
    left: { x: 28, y: 0 },
    right: { x: -28, y: 0 },
    none: { x: 0, y: 0 },
};

/**
 * Fades a section in the first time it scrolls into view. Motion is dropped
 * entirely when the visitor asks for reduced motion — the content still shows,
 * it just arrives without the travel.
 */
export function Reveal({
    children,
    className,
    direction = 'up',
    delay = 0,
    duration = 0.7,
    as = 'div',
}: {
    children: React.ReactNode;
    className?: string;
    direction?: Direction;
    delay?: number;
    duration?: number;
    as?: 'div' | 'section' | 'li' | 'article' | 'span';
}) {
    const reduced = useReducedMotion();
    const Component = motion[as];
    const offset = OFFSET[direction];

    return (
        <Component
            className={className}
            initial={reduced ? { opacity: 0 } : { opacity: 0, ...offset }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
                duration: reduced ? 0.2 : duration,
                delay,
                // Slow, confident ease — nothing springs on a luxury storefront.
                ease: [0.22, 1, 0.36, 1],
            }}>
            {children}
        </Component>
    );
}

/**
 * Reveals children one after another. Pair with <RevealItem> for grids and lists
 * so cards cascade instead of all snapping in together.
 */
export function RevealGroup({
    children,
    className,
    stagger = 0.09,
    as = 'div',
}: {
    children: React.ReactNode;
    className?: string;
    stagger?: number;
    as?: 'div' | 'ul' | 'ol';
}) {
    const Component = motion[as];

    return (
        <Component
            className={className}
            initial="hidden"
            whileInView="shown"
            viewport={{ once: true, amount: 0.15 }}
            variants={{ shown: { transition: { staggerChildren: stagger } } }}>
            {children}
        </Component>
    );
}

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    shown: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const itemVariantsReduced: Variants = {
    hidden: { opacity: 0 },
    shown: { opacity: 1, transition: { duration: 0.25 } },
};

export function RevealItem({
    children,
    className,
    as = 'div',
}: {
    children: React.ReactNode;
    className?: string;
    as?: 'div' | 'li' | 'article';
}) {
    const reduced = useReducedMotion();
    const Component = motion[as];

    return (
        <Component className={className} variants={reduced ? itemVariantsReduced : itemVariants}>
            {children}
        </Component>
    );
}
