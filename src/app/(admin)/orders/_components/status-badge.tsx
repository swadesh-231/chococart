import React from 'react';
import { capitalizeFirstLetter } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
    received: 'bg-purple-600',
    reserved: 'bg-amber-600',
    paid: 'bg-green-600',
    shipped: 'bg-blue-600',
    completed: 'bg-gray-600',
    failed: 'bg-red-600',
};

const StatusBadge = ({ status }: { status: string }) => {
    return (
        <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap text-white ${
                STATUS_COLORS[status] ?? 'bg-gray-400'
            }`}>
            {capitalizeFirstLetter(status)}
        </span>
    );
};

export default StatusBadge;
