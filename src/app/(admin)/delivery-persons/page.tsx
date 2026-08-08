'use client';

import { Button } from '@/components/ui/button';
import React from 'react';
import { columns } from './_components/columns';
import { useQuery } from '@tanstack/react-query';
import { getAllDeliveryPersons } from '@/http/api';
import { DeliveryPerson } from '@/types';
import { Loader2 } from 'lucide-react';
import { useNewDeliveryPerson } from '@/store/deliveryPerson/delivery-person-store';
import { DataTable } from '../_components/data-table';
import PageHeader from '../_components/page-header';
import DeliveryPersonSheet from './_components/delivery-person-sheet';

const DeliveryPersonsPage = () => {
    const { onOpen } = useNewDeliveryPerson();

    const {
        data: deliveryPersons,
        isLoading,
        isError,
    } = useQuery<DeliveryPerson[]>({
        queryKey: ['delivery-persons'],
        queryFn: getAllDeliveryPersons,
    });

    return (
        <>
            <PageHeader
                eyebrow="Network"
                title="Delivery Persons"
                description="Riders assigned to each warehouse."
                action={
                    <Button size="sm" className="eyebrow rounded-none" onClick={onOpen}>
                        Add Delivery Person
                    </Button>
                }
            />
            <DeliveryPersonSheet />

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
                <DataTable columns={columns} data={deliveryPersons || []} />
            )}
        </>
    );
};

export default DeliveryPersonsPage;