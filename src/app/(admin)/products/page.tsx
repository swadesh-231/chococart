'use client';

import { Button } from '@/components/ui/button';
import React from 'react';
import { DataTable } from '../_components/data-table';
import PageHeader from '../_components/page-header';
import { columns } from './_components/columns';
import { useQuery } from '@tanstack/react-query';
import { getAllProducts } from '@/http/api';
import { Product } from '@/types';
import ProductSheet from './_components/product-sheet';
import { useNewProduct } from '@/store/product/product-store';
import { Loader2 } from 'lucide-react';

const ProductsPage = () => {
    const { onOpen } = useNewProduct();

    const {
        data: products,
        isLoading,
        isError,
    } = useQuery<Product[]>({
        queryKey: ['products'],
        queryFn: getAllProducts,
    });

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

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="size-8 animate-spin text-cocoa-400" />
                </div>
            ) : (
                <DataTable columns={columns} data={products || []} />
            )}
        </>
    );
};

export default ProductsPage;