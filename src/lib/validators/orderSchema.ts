import { z } from 'zod';

/** Per-line quantity ceiling, shared by the cart UI and the API. */
export const MAX_LINE_QTY = 20;
/** How many distinct chocolates one cart may hold. */
export const MAX_CART_LINES = 20;

/** Indian PIN codes are six digits and never start with a zero. */
export const pincodeSchema = z
    .string({ message: 'Pincode is required' })
    .trim()
    .regex(/^[1-9]\d{5}$/, 'Enter a valid 6-digit pincode');

export const addressSchema = z
    .string({ message: 'Address is required' })
    .trim()
    .min(10, 'Address should be at least 10 characters')
    .max(500, 'Address cannot be longer than 500 characters');

export const qtySchema = z
    .number({ message: 'Qty should be a number' })
    .int('Qty should be a whole number')
    .min(1, 'Qty should be at least 1')
    .max(MAX_LINE_QTY, `Qty cannot be more than ${MAX_LINE_QTY}`);

export const productIdSchema = z
    .number({ message: 'Product id should be a number' })
    .int('Product id should be a whole number')
    .positive('Product id should be positive');

/** The delivery details collected at checkout, shared by every order form. */
export const deliverySchema = z.object({
    address: addressSchema,
    pincode: pincodeSchema,
});

export const orderLineSchema = z.object({
    productId: productIdSchema,
    qty: qtySchema,
});

/**
 * What `POST /api/orders` accepts. A single "Buy now" is just a one-line cart,
 * so the browser and the route only ever deal with this one shape.
 */
export const cartOrderSchema = deliverySchema.extend({
    items: z
        .array(orderLineSchema)
        .min(1, 'Your cart is empty')
        .max(MAX_CART_LINES, `A cart can hold at most ${MAX_CART_LINES} different chocolates`)
        .refine(
            (items) => new Set(items.map((item) => item.productId)).size === items.length,
            'Each chocolate may only appear once — increase its quantity instead'
        ),
});

export type DeliveryFormValues = z.infer<typeof deliverySchema>;
export type OrderLine = z.infer<typeof orderLineSchema>;
export type CartOrderData = z.infer<typeof cartOrderSchema>;
