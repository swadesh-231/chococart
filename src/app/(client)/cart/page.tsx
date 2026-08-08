import type { Metadata } from 'next';

import { BrandMark } from '../_components/brand-mark';
import CartView from './_components/cart-view';

export const metadata: Metadata = {
    description: 'Review your chocolates and complete your order.',
};

export default function CartPage() {
    return (
        <>
            <section className="border-b border-border bg-ivory-dim">
                <div className="shell py-12 lg:py-16">
                    <div className="flex items-center gap-3">
                        <BrandMark className="h-5 text-gold" />
                        <span className="eyebrow text-cocoa-500">Checkout</span>
                    </div>
                    <h1 className="display-2 mt-5 text-cocoa-800">Your Cart</h1>
                    <p className="prose-body mt-4 text-cocoa-600">
                        Indulge in the world&apos;s finest chocolate, tempered in small batches and
                        on its way in minutes.
                    </p>
                </div>
            </section>

            <CartView />
        </>
    );
}
