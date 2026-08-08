import { formatPrice } from '@/lib/utils';
import { Order } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import StatusBadge from './status-badge';
import StatusChanger from './status-changer';

export const columns: ColumnDef<Order>[] = [
    {
        accessorKey: 'product',
        header: 'Product Name',
    },
    {
        accessorKey: 'qty',
        header: 'Qty',
    },
    {
        accessorKey: 'user',
        header: 'Customer Name',
    },
    {
        accessorKey: 'type',
        header: 'Order Type',
    },
    {
        accessorKey: 'address',
        header: 'Address',
    },
    {
        accessorKey: 'price',
        header: 'Amount',
        cell: ({ row }) => formatPrice(row.original.price),
    },
    {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => {
            return <StatusBadge status={row.original.status} />;
        },
    },
    {
        // Must differ from the column above — react-table keys rows by column id.
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => {
            return <StatusChanger orderId={row.original.id} currentStatus={row.original.status} />;
        },
    },
];