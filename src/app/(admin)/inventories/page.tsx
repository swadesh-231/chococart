'use client';

import { Button } from '@/components/ui/button';
import React from 'react';
import { columns } from './_components/columns';
import { useQuery } from '@tanstack/react-query';
import { getAllInventories } from '@/http/api';
import { Inventory } from '@/types';
import { Loader2 } from 'lucide-react';
import { DataTable } from '../_components/data-table';
import PageHeader from '../_components/page-header';
import InventorySheet from './_components/inventory-sheet';
import { useNewInventory } from '@/store/inventory/inventory-store';

const InventoriesPage = () => {
    const { onOpen } = useNewInventory();

    const {
        data: inventories,
        isLoading,
        isError,
    } = useQuery<Inventory[]>({
        queryKey: ['inventories'],
        queryFn: getAllInventories,
    });

    return (
        <>
            <PageHeader
                eyebrow="Stock"
                title="Inventories"
                description="Individual units, and the order each is reserved for."
                action={
                    <Button size="sm" className="eyebrow rounded-none" onClick={onOpen}>
                        Add Inventory
                    </Button>
                }
            />
            <InventorySheet />

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
                <DataTable columns={columns} data={inventories || []} />
            )}
        </>
    );
};

export default InventoriesPage;