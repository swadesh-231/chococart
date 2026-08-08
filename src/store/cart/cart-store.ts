import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MAX_CART_LINES, MAX_LINE_QTY } from '@/lib/validators/orderSchema';
import type { Product } from '@/types';

export interface CartLine {
    productId: number;
    name: string;
    /** Unit price in whole rupees, snapshotted for display only — the server
     *  re-prices every line at checkout. */
    price: number;
    image: string | null;
    qty: number;
}

export type AddToCartResult =
    | { ok: true; qty: number }
    | { ok: false; reason: 'cart-full' | 'qty-limit' };

interface CartState {
    lines: CartLine[];
    /** Set once the persisted cart has been read back in the browser, so the
     *  server-rendered markup and the first client render agree. */
    hydrated: boolean;
    setHydrated: () => void;
    add: (product: Product, qty?: number) => AddToCartResult;
    setQty: (productId: number, qty: number) => void;
    remove: (productId: number) => void;
    clear: () => void;
}

const clampQty = (qty: number) => Math.min(MAX_LINE_QTY, Math.max(1, Math.trunc(qty) || 1));

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            lines: [],
            hydrated: false,
            setHydrated: () => set({ hydrated: true }),

            add: (product, qty = 1) => {
                const lines = get().lines;
                const existing = lines.find((line) => line.productId === product.id);

                if (!existing && lines.length >= MAX_CART_LINES) {
                    return { ok: false, reason: 'cart-full' };
                }

                const wanted = (existing?.qty ?? 0) + clampQty(qty);

                if (existing && existing.qty >= MAX_LINE_QTY) {
                    return { ok: false, reason: 'qty-limit' };
                }

                const next = Math.min(MAX_LINE_QTY, wanted);

                set({
                    lines: existing
                        ? lines.map((line) =>
                              line.productId === product.id ? { ...line, qty: next } : line
                          )
                        : [
                              ...lines,
                              {
                                  productId: product.id,
                                  name: product.name,
                                  price: product.price,
                                  image: product.image,
                                  qty: next,
                              },
                          ],
                });

                return { ok: true, qty: next };
            },

            setQty: (productId, qty) =>
                set((state) => ({
                    lines:
                        qty < 1
                            ? state.lines.filter((line) => line.productId !== productId)
                            : state.lines.map((line) =>
                                  line.productId === productId
                                      ? { ...line, qty: clampQty(qty) }
                                      : line
                              ),
                })),

            remove: (productId) =>
                set((state) => ({
                    lines: state.lines.filter((line) => line.productId !== productId),
                })),

            clear: () => set({ lines: [] }),
        }),
        {
            name: 'chococart.cart',
            version: 1,
            partialize: (state) => ({ lines: state.lines }),
            // Fires after rehydration whether or not anything was stored.
            onRehydrateStorage: () => (state) => state?.setHydrated(),
        }
    )
);

/** Total number of bars in the cart — what the header badge shows. */
export const selectCartCount = (state: CartState) =>
    state.lines.reduce((sum, line) => sum + line.qty, 0);

/** Cart subtotal in whole rupees, from the snapshotted unit prices. */
export const selectCartSubtotal = (state: CartState) =>
    state.lines.reduce((sum, line) => sum + line.price * line.qty, 0);
