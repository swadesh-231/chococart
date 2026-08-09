'use client';

import React from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { AlertCircle, ChevronDown, Loader2, Search, SlidersHorizontal, X } from 'lucide-react';

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError, getProducts } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { ProductPage } from '@/types';
import ProductCard from '../../_components/product-card';
import FilterRail from './filter-rail';
import {
    activeFilterCount,
    COCOA_BANDS,
    DEFAULT_FILTERS,
    type ShopFilters,
    SORTS,
} from './filters';

/** Small enough that the first screen is quick, large enough to fill it. */
const PAGE_SIZE = 12;

/** Keeps a fast typist from firing a request per keystroke at the database. */
function useDebounced<T>(value: T, delay = 300): T {
    const [settled, setSettled] = React.useState(value);

    React.useEffect(() => {
        const timer = setTimeout(() => setSettled(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return settled;
}

/** Mirrors the card: left-aligned, four across on a wide screen. */
function GridSkeleton({ count = 8 }: { count?: number }) {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <li
                    key={index}
                    className="overflow-hidden rounded-[0.875rem] border border-border/70 bg-card">
                    <Skeleton className="aspect-4/5 w-full rounded-none bg-cocoa-100" />
                    <div className="flex flex-col gap-2.5 p-3.5">
                        <Skeleton className="h-4 w-3/4 rounded-none bg-cocoa-100" />
                        <Skeleton className="h-2.5 w-1/2 rounded-none bg-cocoa-100" />
                        <Skeleton className="h-3 w-12 rounded-none bg-cocoa-100" />
                    </div>
                </li>
            ))}
        </>
    );
}

/**
 * `initialFilters` is resolved on the server from the query string rather than
 * read here with `useSearchParams`. Doing it client-side made the server render
 * the unfiltered grid and the client the filtered one — a hydration mismatch
 * that left the boundary wedged, so effects never ran and the catalogue never
 * loaded. The rail owns the filters from mount onwards.
 */
export default function ShopGrid({ initialFilters }: { initialFilters: ShopFilters }) {
    const [filters, setFilters] = React.useState<ShopFilters>(initialFilters);
    const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);

    // Only the text input is debounced; ticking a box should feel immediate.
    const debouncedQuery = useDebounced(filters.q);
    const band = COCOA_BANDS[filters.cocoa];

    const query = React.useMemo(
        () => ({
            q: debouncedQuery,
            category: filters.category,
            notes: filters.notes,
            minCocoa: band.minCocoa,
            maxCocoa: band.maxCocoa,
            vegan: filters.vegan,
            glutenFree: filters.glutenFree,
            sort: filters.sort,
            limit: PAGE_SIZE,
        }),
        [
            debouncedQuery,
            filters.category,
            filters.notes,
            filters.vegan,
            filters.glutenFree,
            filters.sort,
            band,
        ]
    );

    const {
        data,
        isLoading,
        isError,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isFetching,
    } = useInfiniteQuery<ProductPage>({
        queryKey: ['products', query],
        queryFn: ({ pageParam }) => getProducts({ ...query, offset: pageParam as number }),
        initialPageParam: 0,
        // The endpoint hands back the next offset, or null at the end of the
        // catalogue — so the client never has to do the arithmetic itself.
        getNextPageParam: (lastPage) => lastPage.nextOffset,
        staleTime: 30 * 1000,
    });

    /**
     * Offset paging can still hand back a row twice — a product added while
     * someone is scrolling shifts every later page by one. Two cards with the
     * same React key corrupts the list, so the id is the last word on identity.
     */
    const items = React.useMemo(() => {
        const seen = new Set<number>();
        return (data?.pages ?? []).flatMap((page) =>
            page.items.filter((product) => !seen.has(product.id) && seen.add(product.id))
        );
    }, [data]);
    const total = data?.pages[0]?.total ?? null;

    // A sentinel below the grid rather than a scroll listener: the observer only
    // wakes when the end is genuinely near, and it costs nothing in between.
    const sentinelRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const node = sentinelRef.current;
        if (!node || !hasNextPage) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting && !isFetchingNextPage) void fetchNextPage();
            },
            // Fetch a screen early so the grid keeps up with a fast scroll.
            { rootMargin: '600px 0px' }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const filterCount = activeFilterCount(filters);
    const rail = <FilterRail filters={filters} onChange={setFilters} total={total} />;

    return (
        <div className="shell py-14 lg:py-20">
            <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-14">
                {/* Desktop rail — sticky, so filters stay reachable at page 40. */}
                <aside className="hidden lg:block">
                    <div className="sticky top-32">{rail}</div>
                </aside>

                <div>
                    <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
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
                                value={filters.q}
                                onChange={(event) =>
                                    setFilters({ ...filters, q: event.target.value })
                                }
                                placeholder="Search the collection"
                                className="h-10 w-full border border-input bg-background pr-9 pl-9 text-sm text-cocoa-800 placeholder:text-cocoa-400 focus:border-gold focus:outline-none"
                            />
                            {filters.q && (
                                <button
                                    type="button"
                                    aria-label="Clear search"
                                    onClick={() => setFilters({ ...filters, q: '' })}
                                    className="absolute top-1/2 right-2.5 -translate-y-1/2 p-1 text-cocoa-400 transition-colors hover:text-cocoa-700">
                                    <X className="size-3.5" />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center justify-between gap-4 sm:justify-end">
                            {/* Filters live behind a drawer below the rail's breakpoint. */}
                            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                                <SheetTrigger
                                    render={
                                        <button
                                            type="button"
                                            className="eyebrow flex h-10 items-center gap-2 border border-input px-4 text-[0.5625rem] text-cocoa-700 transition-colors hover:border-cocoa-400 lg:hidden"
                                        />
                                    }>
                                    <SlidersHorizontal className="size-3.5" strokeWidth={1.6} />
                                    Filters
                                    {filterCount > 0 && (
                                        <span className="tnum flex size-4 items-center justify-center bg-cocoa-800 text-[0.55rem] text-ivory">
                                            {filterCount}
                                        </span>
                                    )}
                                </SheetTrigger>
                                <SheetContent
                                    side="left"
                                    className="w-[86%] overflow-y-auto data-[side=left]:sm:max-w-sm">
                                    <SheetTitle className="sr-only">Filters</SheetTitle>
                                    <SheetDescription className="sr-only">
                                        Narrow the collection
                                    </SheetDescription>
                                    <div className="p-6">{rail}</div>
                                </SheetContent>
                            </Sheet>

                            <p className="eyebrow tnum hidden text-[0.5625rem] text-cocoa-500 sm:block">
                                {total === null
                                    ? '—'
                                    : `${total} product${total === 1 ? '' : 's'}`}
                            </p>

                            <div className="flex items-center gap-2.5">
                                <label
                                    htmlFor="shop-sort"
                                    className="eyebrow hidden text-[0.5625rem] text-cocoa-500 sm:block">
                                    Sort
                                </label>
                                {/* Plain select so it can share the squared-off look of the
                                    search field — the UI kit's wrapper styles its own box. */}
                                <div className="relative">
                                    <select
                                        id="shop-sort"
                                        value={filters.sort}
                                        onChange={(event) =>
                                            setFilters({ ...filters, sort: event.target.value })
                                        }
                                        className="h-10 w-44 appearance-none border border-input bg-background pr-8 pl-3 text-[0.8rem] text-cocoa-800 focus:border-gold focus:outline-none">
                                        {Object.entries(SORTS).map(([key, label]) => (
                                            <option key={key} value={key}>
                                                {label}
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

                    {!isError && (
                        <>
                            <motion.ul
                                className={cn(
                                    'mt-10 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-3 xl:grid-cols-4',
                                    // A refetch under new filters dims the old
                                    // results instead of flashing the page empty.
                                    isFetching && !isFetchingNextPage && !isLoading && 'opacity-60'
                                )}>
                                {isLoading ? (
                                    <GridSkeleton />
                                ) : (
                                    items.map((product, index) => (
                                        <motion.li
                                            key={product.id}
                                            initial={{ opacity: 0, y: 18 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                duration: 0.45,
                                                // Stagger within a page only, so
                                                // page 40 doesn't wait four seconds.
                                                delay: (index % PAGE_SIZE) * 0.02,
                                                ease: [0.22, 1, 0.36, 1],
                                            }}>
                                            <ProductCard
                                                product={product}
                                                badge={
                                                    filters.sort === 'featured' &&
                                                    filterCount === 0 &&
                                                    !debouncedQuery &&
                                                    index < 2
                                                        ? index === 0
                                                            ? 'New'
                                                            : 'Best seller'
                                                        : null
                                                }
                                            />
                                        </motion.li>
                                    ))
                                )}

                                {isFetchingNextPage && <GridSkeleton count={4} />}
                            </motion.ul>

                            {/* Tripwire for the next page. */}
                            <div ref={sentinelRef} aria-hidden="true" className="h-px" />

                            {isFetchingNextPage && (
                                <p className="mt-10 flex items-center justify-center gap-2.5 text-cocoa-500">
                                    <Loader2 className="size-3.5 animate-spin" />
                                    <span className="eyebrow text-[0.5625rem]">
                                        Tempering more
                                    </span>
                                </p>
                            )}

                            {!isLoading && !hasNextPage && items.length > 0 && (
                                <div className="mt-16 flex flex-col items-center gap-4">
                                    <div className="rule-gold w-24" />
                                    <p className="eyebrow tnum text-[0.5625rem] text-cocoa-400">
                                        All {total} shown
                                    </p>
                                </div>
                            )}

                            {!isLoading && items.length === 0 && (
                                <div className="mt-16 flex flex-col items-center gap-3 text-center">
                                    <p className="font-heading text-xl text-cocoa-800">
                                        {filters.q || filterCount
                                            ? 'Nothing matches that'
                                            : 'The collection is resting'}
                                    </p>
                                    <p className="max-w-sm text-[0.825rem] leading-relaxed text-cocoa-500">
                                        {filters.q || filterCount
                                            ? 'Try a different flavour, or loosen the filters to see more.'
                                            : 'Our next collection is being tempered. Check back shortly.'}
                                    </p>
                                    {(filters.q || filterCount > 0) && (
                                        <button
                                            type="button"
                                            onClick={() => setFilters(DEFAULT_FILTERS)}
                                            className="eyebrow link-underline mt-2 text-cocoa-800">
                                            Clear everything
                                        </button>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
