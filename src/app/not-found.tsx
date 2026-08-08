import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import { BrandMark, Wordmark } from './(client)/_components/brand-mark';

export const metadata: Metadata = {
    title: 'Page not found — Chococart',
    description: 'The page you were looking for has melted away.',
};

/** Where people usually meant to go when they land here. */
const suggestions = [
    { label: 'The collection', href: '/shop' },
    { label: 'Our story', href: '/#story' },
    { label: 'Order history', href: '/account/orders' },
];

export default function NotFound() {
    return (
        // A section, not a <main>: this also renders inside the storefront
        // layout, which already provides one.
        <section className="relative flex min-h-[80vh] flex-1 items-center justify-center overflow-hidden bg-cocoa-950 text-ivory">
            {/* The photograph sits far back so the type stays the subject. */}
            <div className="grain absolute inset-0" aria-hidden="true">
                <Image
                    src="/assets/choco-bg.jpg"
                    alt=""
                    fill
                    priority
                    sizes="100vw"
                    className="scale-105 object-cover opacity-25"
                />
                <div className="absolute inset-0 bg-linear-to-b from-cocoa-950/70 via-cocoa-950/85 to-cocoa-950" />
            </div>

            <div className="shell relative flex flex-col items-center py-20 text-center md:py-28">
                <Link
                    href="/"
                    aria-label="Chococart home"
                    className="flex flex-col items-center gap-3">
                    <BrandMark className="h-9 text-gold" />
                    <Wordmark tagline={null} />
                </Link>

                <span
                    aria-hidden="true"
                    className="text-foil mt-14 block font-heading text-[clamp(5rem,4rem+12vw,11rem)] leading-[0.82] font-medium tracking-[-0.03em]">
                    404
                </span>

                <div className="rule-gold mt-10 w-28" />

                <h1 className="display-2 mt-10 max-w-2xl text-ivory">
                    This page has melted away
                </h1>

                <p className="prose-body mt-5 text-ivory/60">
                    The link may be old, or the chocolate it pointed to has sold out. Everything
                    still in the case is a click away.
                </p>

                <div className="mt-11 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                    <Link
                        href="/shop"
                        className="group flex items-center justify-center gap-3 bg-ivory px-9 py-4 text-cocoa-900 transition-colors hover:bg-gold">
                        <span className="eyebrow">Shop the collection</span>
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link
                        href="/"
                        className="group flex items-center justify-center gap-3 border border-ivory/25 px-9 py-4 text-ivory transition-colors hover:border-ivory/60">
                        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
                        <span className="eyebrow">Back home</span>
                    </Link>
                </div>

                <nav aria-label="Suggested pages" className="mt-14">
                    <p className="eyebrow text-[0.5625rem] text-ivory/40">Or try one of these</p>
                    <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
                        {suggestions.map((item) => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className="eyebrow link-underline text-[0.625rem] text-ivory/70 transition-colors hover:text-gold">
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </section>
    );
}
