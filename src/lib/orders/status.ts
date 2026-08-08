/** `orders.status` is a varchar(10), so every value here must stay <= 10 chars. */
export const ORDER_STATUSES = ['received', 'reserved', 'paid', 'shipped', 'completed', 'failed'] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
