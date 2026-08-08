'use client';

import React from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Loader2, Search, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { getAllProducts } from '@/http/api';
import { categoryLabel, PRODUCT_CATEGORIES } from '@/lib/categories';
import type { ProductPage } from '@/types';
import { useNewProduct } from '@/store/product/product-store';
import { DataTable } from '../_components/data-table';
import PageHeader from '../_components/page-header';
import { columns } from './_components/columns';
import ProductSheet from './_components/product-sheet';

const PAGE_SIZE = 25;

const ProductsPage = () => {
    const { onOpen } = useNewProduct();
    const [page, setPage] = React.useState(0);
    const [search, setSearch] = React.useState('');
    const [category, setCategory] = React.useState('all');

    // Debounced so typing a name doesn't fire a query per keystroke.
    const [query, setQuery] = React.useState('');
    React.useEffect(() => {
        const timer = setTimeout(() => setQuery(search), 300);
        return () => clearTimeout(timer);
    }, [search]);

    const { data, isLoading, isError, isFetching } = useQuery<ProductPage>({
        queryKey: ['products', 'admin', { query, category, page }],
        queryFn: () =>
            getAllProducts({
                q: query,
                category,
                limit: PAGE_SIZE,
                offset: page * PAGE_SIZE,
                sort: 'featured',
            }),
        // Holds the previous page on screen while the next one loads, instead of
        // collapsing the table to a spinner on every click.
        placeholderData: keepPreviousData,
    });

    const total = data?.total ?? 0;
    const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const from = total === 0 ? 0 : page * PAGE_SIZE + 1;
    const to = Math.min((page + 1) * PAGE_SIZE, total);

    return (
        <>
            <PageHeader
                eyebrow="Catalogue"
                title="Products"
                description="Every bar in your storefront."
                action={
                    <Button size="sm" className="eyebrow rounded-none" onClick={onOpen}>
                        Add Product
                    </Button>
                }
            />
            <ProductSheet />

            {isError && (
                <p className="border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    Something went wrong loading this data.
                </p>
            )}

            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative sm:max-w-xs sm:flex-1">
                    <Search
                        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                        aria-hidden="true"
                    />
                    <label htmlFor="admin-product-search" className="sr-only">
                        Search products
                    </label>
                    <input
                        id="admin-product-search"
                        type="search"
                        value={search}
                        onChange={(event) => {
                            // Narrowing the catalogue invalidates whatever page
                            // number you were on, so reset it with the filter
                            // rather than reacting to it in an effect.
                            setSearch(event.target.value);
                            setPage(0);
                        }}
                        placeholder="Search products"
                        className="h-9 w-full border border-input bg-background pr-8 pl-9 text-sm focus:border-gold focus:outline-none"
                    />
                    {search && (
                        <button
                            type="button"
                            aria-label="Clear search"
                            onClick={() => {
                                setSearch('');
                                setPage(0);
                            }}
                            className="absolute top-1/2 right-2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground">
                            <X className="size-3.5" />
                        </button>
                    )}
                </div>

                <select
                    value={category}
                    onChange={(event) => {
                        setCategory(event.target.value);
                        setPage(0);
                    }}
                    aria-label="Filter by type"
                    className="h-9 border border-input bg-background px-3 text-sm focus:border-gold focus:outline-none">
                    <option value="all">All types</option>
                    {PRODUCT_CATEGORIES.map((name) => (
                        <option key={name} value={name}>
                            {categoryLabel(name)}
                        </option>
                    ))}
                </select>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="size-8 animate-spin text-cocoa-400" />
                </div>
            ) : (
                <div className={isFetching ? 'opacity-60 transition-opacity' : undefined}>
                    <DataTable columns={columns} data={data?.items ?? []} />
                </div>
            )}

            <div className="mt-4 flex items-center justify-between gap-4">
                <p className="tnum text-xs text-muted-foreground">
                    {total === 0 ? 'No products' : `${from}–${to} of ${total}`}
                </p>

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-none"
                        onClick={() => setPage((current) => Math.max(0, current - 1))}
                        disabled={page === 0}>
                        <ChevronLeft className="size-4" />
                        Previous
                    </Button>
                    <span className="tnum text-xs text-muted-foreground">
                        Page {page + 1} of {pageCount}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-none"
                        onClick={() => setPage((current) => current + 1)}
                        disabled={data?.nextOffset === null || data?.nextOffset === undefined}>
                        Next
                        <ChevronRight className="size-4" />
                    </Button>
                </div>
            </div>
        </>
    );
};

export default ProductsPage;
