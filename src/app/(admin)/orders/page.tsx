'use client';

import { getAllOrders } from '@/http/api';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import React from 'react';
import { DataTable } from '../_components/data-table';
import PageHeader from '../_components/page-header';
import { columns } from './_components/columns';

const OrdersPage = () => {
    const {
        data: orders,
        isError,
        isLoading,
    } = useQuery({
        queryKey: ['orders'],
        queryFn: getAllOrders,
    });

    return (
        <>
            <PageHeader
                eyebrow="Sales"
                title="Orders"
                description="Every order placed, newest first."
            />

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
                <DataTable columns={columns} data={orders || []} />
            )}
        </>
    );
};

export default OrdersPage;