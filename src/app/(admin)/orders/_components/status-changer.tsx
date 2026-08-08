import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { changeOrderStatus } from '@/http/api';
import { ORDER_STATUSES } from '@/lib/orders/status';
import { capitalizeFirstLetter } from '@/lib/utils';
import { OrderStatusData } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React from 'react';

const StatusChanger = ({ orderId, currentStatus }: { orderId: number; currentStatus: string }) => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { mutate } = useMutation({
        mutationKey: ['order-status'],
        mutationFn: (data: OrderStatusData) => {
            return changeOrderStatus(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            toast({ title: 'Order status updated successfully' });
        },
        onError: (err) => {
            toast({ title: err.message, variant: 'destructive' });
        },
    });

    return (
        <Select
            defaultValue={currentStatus}
            onValueChange={(value) => {
                if (!value) return;
                mutate({ status: String(value), orderId });
            }}>
            <SelectTrigger>
                <SelectValue placeholder={currentStatus}></SelectValue>
            </SelectTrigger>
            <SelectContent>
                {ORDER_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                        {capitalizeFirstLetter(status)}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};

export default StatusChanger;