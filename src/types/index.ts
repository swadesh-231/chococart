export interface Product {
    id: number;
    name: string;
    description: string | null;
    image: string | null;
    price: number;
}

export interface Warehouse {
    id: number;
    name: string;
    pincode: string;
}

export interface DeliveryPerson {
    id: number;
    name: string;
    phone: string;
    warehouse: string | null;
}

/** The create payload, before the row exists and the warehouse is joined in. */
export interface DeliveryPersonData {
    name: string;
    phone: string;
    warehouseId: number;
}

export interface Inventory {
    id: number;
    sku: string;
    warehouse: string | null;
    product: string | null;
}

export interface InventoryData {
    sku: string;
    warehouseId: number;
    productId: number;
}

export interface OrderData {
    items: { productId: number; qty: number }[];
    pincode: string;
    address: string;
}

export interface Order {
    id: number;
    product: string | null;
    productId: number | null;
    userId: number | null;
    user: string | null;
    type: string | null;
    address: string;
    status: string;
    price: number;
    qty: number;
    image: string | null;
    groupId: string | null;
    createdAt: string | null;
}

export interface OrderStatusData {
    orderId: number;
    status: string;
}

export interface MyOrder {
    id: number;
    image: string | null;
    price: number;
    qty: number;
    product: string | null;
    address: string;
    productDescription: string | null;
    status: string;
    type: string | null;
    groupId: string | null;
    createdAt: string | null;
}

/** Order-history rows folded back into the cart they were checked out as. */
export interface MyOrderGroup {
    key: string;
    createdAt: string | null;
    address: string;
    status: string;
    total: number;
    lines: MyOrder[];
}

/** What `POST /api/orders` hands back so the browser can open Razorpay Checkout. */
export interface CheckoutSession {
    groupId: string;
    orderId: number;
    orderIds: number[];
    razorpayOrderId: string;
    amount: number | string;
    currency: string;
    keyId?: string;
    customer: {
        name: string;
        email: string;
    };
}

export interface VerifyPaymentData {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}
