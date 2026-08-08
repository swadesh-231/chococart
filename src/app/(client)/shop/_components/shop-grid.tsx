'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, ChevronDown, Search, X } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { ApiError, getProducts } from '@/lib/api';
import type { Product } from '@/types';
import ProductCard from '../../_components/product-card';

const SORTS = {
    featured: { label: 'Featured', compare: undefined },
    'price-asc': { label: 'Price: low to high', compare: (a: Product, b: Product) => a.price - b.price },
    'price-desc': { label: 'Price: high to low', compare: (a: Product, b: Product) => b.price - a.price },
    name: {
        label: 'Alphabetical',
        compare: (a: Product, b: Product) => a.name.localeCompare(b.name),
    },
} satisfies Record<string, { label: string; compare?: (a: Product, b: Product) => number }>;

type SortKey = keyof typeof SORTS;

/** The two newest products carry a badge, mirroring the reference's grid. */
function badgeFor(product: Product, newest: number[]) {
    if (product.id === newest[0]) return 'New';
    if (product.id === newest[1]) return 'Best seller';
    return null;
}

export default function ShopGrid() {
    const [query, setQuery] = React.useState('');
    const [sort, setSort] = React.useState<SortKey>('featured');

    const { data, isLoading, isError, error } = useQuery<Product[]>({
        queryKey: ['products'],
        queryFn: getProducts,
        staleTime: 30 * 1000,
    });

    const newest = React.useMemo(
        () =>
            [...(data ?? [])]
                .sort((a, b) => b.id - a.id)
                .slice(0, 2)
                .map((product) => product.id),
        [data]
    );

    const visible = React.useMemo(() => {
        const needle = query.trim().toLowerCase();
        const filtered = (data ?? []).filter((product) =>
            needle
                ? product.name.toLowerCase().includes(needle) ||
                  (product.description ?? '').toLowerCase().includes(needle)
                : true
        );

        const compare = SORTS[sort].compare;
        return compare ? [...filtered].sort(compare) : filtered;
    }, [data, query, sort]);

    return (
        <div className="shell py-14 lg:py-20">
            <div className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative sm:max-w-xs sm:flex-1">
                    <Search
                        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-cocoa-400"
                        aria-hidden="true"
                    />
                    <label htmlFor="shop-search" className="sr-only">
                        Search the collection
                    </label>
                    <input
                        id="shop-search"
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search the collection"
                        className="h-10 w-full border border-input bg-background pr-9 pl-9 text-sm text-cocoa-800 placeholder:text-cocoa-400 focus:border-gold focus:outline-none"
                    />
                    {query && (
                        <button
                            type="button"
                            aria-label="Clear search"
                            onClick={() => setQuery('')}
                            className="absolute top-1/2 right-2.5 -translate-y-1/2 p-1 text-cocoa-400 transition-colors hover:text-cocoa-700">
                            <X className="size-3.5" />
                        </button>
                    )}
                </div>

                <div className="flex items-center justify-between gap-5 sm:justify-end">
                    <p className="eyebrow text-[0.5625rem] text-cocoa-500">
                        {isLoading ? '—' : `${visible.length} product${visible.length === 1 ? '' : 's'}`}
                    </p>

                    <div className="flex items-center gap-2.5">
                        <label
                            htmlFor="shop-sort"
                            className="eyebrow text-[0.5625rem] text-cocoa-500">
                            Sort
                        </label>
                        {/* Plain select so it can share the squared-off look of the
                            search field — the UI kit's wrapper styles its own box. */}
                        <div className="relative">
                            <select
                                id="shop-sort"
                                value={sort}
                                onChange={(event) => setSort(event.target.value as SortKey)}
                                className="h-10 w-44 appearance-none border border-input bg-background pr-8 pl-3 text-[0.8rem] text-cocoa-800 focus:border-gold focus:outline-none">
                                {Object.entries(SORTS).map(([key, option]) => (
                                    <option key={key} value={key}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown
                                className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-cocoa-400"
                                aria-hidden="true"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {isError && (
                <div className="mt-14 flex flex-col items-center gap-3 text-center">
                    <AlertCircle className="size-6 text-destructive" strokeWidth={1.4} />
                    <p className="font-heading text-xl text-cocoa-800">
                        We could not load the collection
                    </p>
                    <p className="text-[0.825rem] text-cocoa-500">
                        {error instanceof ApiError || error instanceof Error
                            ? error.message
                            : 'Please try again in a moment.'}
                    </p>
                </div>
            )}

            {isLoading && (
                <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="flex flex-col gap-4">
                            <Skeleton className="aspect-4/5 w-full rounded-none bg-cocoa-100" />
                            <Skeleton className="mx-auto h-5 w-2/3 rounded-none bg-cocoa-100" />
                            <Skeleton className="mx-auto h-3 w-1/2 rounded-none bg-cocoa-100" />
                            <Skeleton className="mx-auto h-4 w-16 rounded-none bg-cocoa-100" />
                        </div>
                    ))}
                </div>
            )}

            {!isLoading && !isError && (
                <>
                    <motion.ul
                        layout
                        className="mt-12 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                        <AnimatePresence mode="popLayout">
                            {visible.map((product) => (
                                <motion.li
                                    key={product.id}
                                    layout
                                    initial={{ opacity: 0, y: 18 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.97 }}
                                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
                                    <ProductCard
                                        product={product}
                                        badge={badgeFor(product, newest)}
                                    />
                                </motion.li>
                            ))}
                        </AnimatePresence>
                    </motion.ul>

                    {visible.length === 0 && (
                        <div className="mt-16 flex flex-col items-center gap-3 text-center">
                            <p className="font-heading text-xl text-cocoa-800">
                                {query ? 'Nothing matches that search' : 'The collection is resting'}
                            </p>
                            <p className="max-w-sm text-[0.825rem] leading-relaxed text-cocoa-500">
                                {query
                                    ? 'Try a different flavour, or clear the search to see everything.'
                                    : 'Our next collection is being tempered. Check back shortly.'}
                            </p>
                            {query && (
                                <button
                                    type="button"
                                    onClick={() => setQuery('')}
                                    className="eyebrow link-underline mt-2 text-cocoa-800">
                                    Clear search
                                </button>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
