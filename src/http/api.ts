import { ApiError, productSearchParams } from '@/lib/api';
import type { ProductApiValues } from '@/lib/validators/productSchema';
import type {
    DeliveryPerson,
    DeliveryPersonData,
    Inventory,
    InventoryData,
    Order,
    OrderStatusData,
    ProductPage,
    ProductQuery,
    Warehouse,
} from '@/types';

async function request<T>(input: string, init?: RequestInit): Promise<T> {
    const isFormData = init?.body instanceof FormData;

    const response = await fetch(input, {
        ...init,
        headers: {
            ...(init?.body && !isFormData ? { 'Content-Type': 'application/json' } : {}),
            ...init?.headers,
        },
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
        const message =
            payload && typeof payload === 'object' && 'message' in payload
                ? String(payload.message)
                : 'Something went wrong';
        throw new ApiError(message, response.status);
    }

    return payload as T;
}

export function getAllProducts(query: ProductQuery = {}) {
    return request<ProductPage>(`/api/products?${productSearchParams(query)}`);
}

export function createProduct(data: ProductApiValues) {
    return request<{ message: string }>('/api/products', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export function getAllWarehouses() {
    return request<Warehouse[]>('/api/warehouses');
}

export function createWarehouse(data: Pick<Warehouse, 'name' | 'pincode'>) {
    return request<{ message: string }>('/api/warehouses', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export function getAllInventories() {
    return request<Inventory[]>('/api/inventories');
}

export function createInventory(data: InventoryData) {
    return request<{ message: string }>('/api/inventories', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export function getAllDeliveryPersons() {
    return request<DeliveryPerson[]>('/api/delivary-persion');
}

export function createDeliveryPerson(data: DeliveryPersonData) {
    return request<{ message: string }>('/api/delivary-persion', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export function getAllOrders() {
    return request<Order[]>('/api/orders');
}

export function changeOrderStatus(data: OrderStatusData) {
    return request<{ message: string }>('/api/orders/status', {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
}
