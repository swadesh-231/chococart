import type { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, LifeBuoy } from 'lucide-react';

import { BrandMark } from '../../_components/brand-mark';

export const metadata: Metadata = {
    description: 'Your payment could not be completed. Nothing has been charged.',
};

const reasons = [
    'The bank declined the card or the payment timed out.',
    'The payment window was closed before it finished.',
    'The details entered did not match the card on file.',
];

export default function ReturnPage() {
    return (
        <section className="flex flex-1 items-center bg-ivory-dim">
            <div className="shell py-16 md:py-24">
                <div className="mx-auto max-w-2xl border border-border bg-card px-6 py-12 text-center shadow-e-md sm:px-14">
                    <span className="mx-auto grid size-16 place-items-center rounded-full border border-destructive/30 bg-destructive/8">
                        <AlertTriangle
                            className="size-7 text-destructive"
                            strokeWidth={1.5}
                            aria-hidden="true"
                        />
                    </span>

                    <span className="eyebrow mt-8 block text-cocoa-500">Payment unsuccessful</span>
                    <h1 className="display-2 mt-4 text-cocoa-800">We could not take payment</h1>

                    <p className="prose-body mx-auto mt-5 text-cocoa-600">
                        Nothing has been charged and the chocolate you chose has been returned to
                        the case. Your cart is still waiting whenever you are ready to try again.
                    </p>

                    <div className="rule-gold mx-auto mt-10 w-24" />

                    <div className="mt-10 border border-border bg-ivory-dim px-6 py-6 text-left">
                        <p className="eyebrow text-[0.5625rem] text-cocoa-600">
                            This usually happens when
                        </p>
                        <ul className="mt-4 space-y-2.5">
                            {reasons.map((reason) => (
                                <li
                                    key={reason}
                                    className="flex items-start gap-3 text-[0.8rem] leading-relaxed text-cocoa-500">
                                    <span
                                        className="mt-2 size-1 shrink-0 rounded-full bg-cocoa-300"
                                        aria-hidden="true"
                                    />
                                    {reason}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="mt-11 flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <Link
                            href="/cart"
                            className="group flex items-center justify-center gap-3 bg-cocoa-800 px-8 py-4 text-ivory transition-colors hover:bg-cocoa-900">
                            <span className="eyebrow">Try payment again</span>
                            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                        <Link
                            href="/shop"
                            className="flex items-center justify-center gap-3 border border-cocoa-800 px-8 py-4 text-cocoa-800 transition-colors hover:bg-cocoa-800 hover:text-ivory">
                            <span className="eyebrow">Back to the collection</span>
                        </Link>
                    </div>

                    <p className="mt-10 flex items-center justify-center gap-2 text-[0.7rem] text-cocoa-400">
                        <LifeBuoy className="size-3" strokeWidth={1.5} aria-hidden="true" />
                        Charged but no confirmation? Write to care@chococart.in
                    </p>

                    <BrandMark className="mx-auto mt-10 h-6 text-gold/50" />
                </div>
            </div>
        </section>
    );
}
