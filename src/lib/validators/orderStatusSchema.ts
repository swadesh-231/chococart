import { z } from 'zod';
import { ORDER_STATUSES } from '@/lib/orders/status';

export const orderStatusSchema = z.object({
    orderId: z.number({ message: 'Order Id should be a number' }).int().positive(),
    status: z.enum(ORDER_STATUSES, {
        message: `Status should be one of: ${ORDER_STATUSES.join(', ')}`,
    }),
});
