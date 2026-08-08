import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check, Package, Sparkles, Truck } from 'lucide-react';

import { BrandMark } from '../../_components/brand-mark';

export const metadata: Metadata = {
    description: 'Your payment went through and your chocolate is on its way.',
};

const steps = [
    {
        icon: Check,
        title: 'Payment received',
        copy: 'Your card has been charged and the order is confirmed.',
    },
    {
        icon: Package,
        title: 'Packed by hand',
        copy: 'Each bar is wrapped and sealed at the nearest atelier.',
    },
    {
        icon: Truck,
        title: 'On its way',
        copy: 'A rider is assigned — expect your box in about ten minutes.',
    },
];

export default async function SuccessPage({ searchParams }: PageProps<'/payment/success'>) {
    const { order } = await searchParams;
    const reference = typeof order === 'string' && /^\d+$/.test(order) ? order : null;

    return (
        <section className="flex flex-1 items-center bg-ivory-dim">
            <div className="shell py-16 md:py-24">
                <div className="mx-auto max-w-2xl border border-border bg-card px-6 py-12 text-center shadow-e-md sm:px-14">
                    <span className="mx-auto grid size-16 place-items-center rounded-full border border-gold/40 bg-gold/10">
                        <Check className="size-7 text-gold" strokeWidth={1.5} aria-hidden="true" />
                    </span>

                    <span className="eyebrow mt-8 block text-cocoa-500">Order confirmed</span>
                    <h1 className="display-2 mt-4 text-cocoa-800">Thank you for your order</h1>

                    <p className="prose-body mx-auto mt-5 text-cocoa-600">
                        Your payment was received and your chocolate is being packed. A confirmation
                        is on its way to your inbox.
                    </p>

                    {reference && (
                        <p className="tnum eyebrow mt-7 inline-block border border-border px-5 py-3 text-[0.625rem] text-cocoa-600">
                            Order reference · #{reference}
                        </p>
                    )}

                    <div className="rule-gold mx-auto mt-10 w-24" />

                    <ol className="mt-10 grid gap-7 text-left sm:grid-cols-3">
                        {steps.map((step) => (
                            <li key={step.title}>
                                <step.icon
                                    className="size-4 text-gold"
                                    strokeWidth={1.5}
                                    aria-hidden="true"
                                />
                                <p className="eyebrow mt-3 text-[0.5625rem] text-cocoa-800">
                                    {step.title}
                                </p>
                                <p className="mt-2 text-[0.75rem] leading-relaxed text-cocoa-500">
                                    {step.copy}
                                </p>
                            </li>
                        ))}
                    </ol>

                    <div className="mt-11 flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <Link
                            href="/account/orders"
                            className="group flex items-center justify-center gap-3 bg-cocoa-800 px-8 py-4 text-ivory transition-colors hover:bg-cocoa-900">
                            <span className="eyebrow">Track your order</span>
                            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                        <Link
                            href="/shop"
                            className="flex items-center justify-center gap-3 border border-cocoa-800 px-8 py-4 text-cocoa-800 transition-colors hover:bg-cocoa-800 hover:text-ivory">
                            <span className="eyebrow">Keep shopping</span>
                        </Link>
                    </div>

                    <p className="mt-10 flex items-center justify-center gap-2 text-[0.7rem] text-cocoa-400">
                        <Sparkles className="size-3" strokeWidth={1.5} aria-hidden="true" />
                        Best enjoyed at room temperature, within a week
                    </p>

                    <BrandMark className="mx-auto mt-10 h-6 text-gold/50" />
                </div>
            </div>
        </section>
    );
}
