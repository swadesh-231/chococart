'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCw } from 'lucide-react';

import { BrandMark } from './_components/brand-mark';

/**
 * Storefront error boundary. Anything that throws below the client layout lands
 * here rather than on the white Next.js screen.
 */
export default function StorefrontError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    React.useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <section className="flex flex-1 items-center bg-ivory-dim">
            <div className="shell py-20 md:py-28">
                <div className="mx-auto max-w-xl border border-border bg-card px-6 py-14 text-center shadow-e-md sm:px-12">
                    <span className="mx-auto grid size-14 place-items-center rounded-full border border-destructive/30 bg-destructive/8">
                        <AlertTriangle
                            className="size-6 text-destructive"
                            strokeWidth={1.5}
                            aria-hidden="true"
                        />
                    </span>

                    <span className="eyebrow mt-7 block text-cocoa-500">Something went wrong</span>
                    <h1 className="display-2 mt-4 text-cocoa-800">A moment of turbulence</h1>

                    <p className="prose-body mx-auto mt-5 text-cocoa-600">
                        We could not finish loading this page. Nothing was lost — your cart is safe.
                        Try again, and if it keeps happening, write to care@chococart.in.
                    </p>

                    {error.digest && (
                        <p className="tnum mt-6 text-[0.7rem] text-cocoa-400">
                            Reference {error.digest}
                        </p>
                    )}

                    <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <button
                            type="button"
                            onClick={reset}
                            className="flex items-center justify-center gap-3 bg-cocoa-800 px-8 py-4 text-ivory transition-colors hover:bg-cocoa-900">
                            <RotateCw className="size-4" strokeWidth={1.5} aria-hidden="true" />
                            <span className="eyebrow">Try again</span>
                        </button>
                        <Link
                            href="/"
                            className="flex items-center justify-center gap-3 border border-cocoa-800 px-8 py-4 text-cocoa-800 transition-colors hover:bg-cocoa-800 hover:text-ivory">
                            <span className="eyebrow">Back home</span>
                        </Link>
                    </div>

                    <BrandMark className="mx-auto mt-12 h-6 text-gold/50" />
                </div>
            </div>
        </section>
    );
}
