'use client';

import { Button } from '@/components/ui/button';
import React from 'react';
import { columns } from './_components/columns';
import { useQuery } from '@tanstack/react-query';
import { getAllWarehouses } from '@/http/api';
import { Warehouse } from '@/types';
import { Loader2 } from 'lucide-react';
import { useNewWarehouse } from '@/store/warehouse/warehouse-store';
import { DataTable } from '../_components/data-table';
import PageHeader from '../_components/page-header';
import WarehouseSheet from './_components/warehouse-sheet';

const WarehousesPage = () => {
    const { onOpen } = useNewWarehouse();

    const {
        data: warehouses,
        isLoading,
        isError,
    } = useQuery<Warehouse[]>({
        queryKey: ['warehouses'],
        queryFn: getAllWarehouses,
    });

    return (
        <>
            <PageHeader
                eyebrow="Network"
                title="Warehouses"
                description="Fulfilment centres and the pincodes they serve."
                action={
                    <Button size="sm" className="eyebrow rounded-none" onClick={onOpen}>
                        Add Warehouse
                    </Button>
                }
            />
            <WarehouseSheet />

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
                <DataTable columns={columns} data={warehouses || []} />
            )}
        </>
    );
};

export default WarehousesPage;