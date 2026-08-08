import Link from 'next/link';
import { Facebook, Instagram, Truck } from 'lucide-react';

import { BrandMark, Wordmark } from './brand-mark';

const columns = [
    {
        title: 'Shop',
        links: [
            { label: 'All chocolate', href: '/shop' },
            { label: 'Dark', href: '/shop' },
            { label: 'Milk', href: '/shop' },
            { label: 'Gifting', href: '/shop' },
        ],
    },
    {
        title: 'House',
        links: [
            { label: 'Our story', href: '/#story' },
            { label: 'The craft', href: '/#craft' },
            { label: 'Journal', href: '/#journal' },
        ],
    },
    {
        title: 'Care',
        links: [
            { label: 'Order history', href: '/account/orders' },
            { label: 'Your cart', href: '/cart' },
            { label: 'Shipping & delivery', href: '/#collection' },
        ],
    },
];

const socials = [
    { label: 'Instagram', icon: Instagram, href: 'https://instagram.com' },
    { label: 'Facebook', icon: Facebook, href: 'https://facebook.com' },
];

export default function Footer() {
    return (
        <footer className="bg-cocoa-900 text-ivory">
            <div className="border-b border-ivory/10">
                <div className="shell flex items-center justify-center gap-2.5 py-4 text-center">
                    <Truck className="size-3.5 text-gold" strokeWidth={1.4} aria-hidden="true" />
                    <span className="eyebrow text-[0.5625rem] text-ivory/60">
                        Complimentary delivery on every order · Ready in ten minutes
                    </span>
                </div>
            </div>

            <div className="shell py-16">
                <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
                    <div>
                        <div className="flex flex-col items-start gap-3">
                            <BrandMark className="h-8 text-gold" />
                            <Wordmark className="!items-start" tagline={null} />
                            <span className="eyebrow text-[0.5rem] text-ivory/45">
                                Artisan Chocolatier · India
                            </span>
                        </div>
                        <p className="mt-6 max-w-xs text-[0.8rem] leading-relaxed text-ivory/55">
                            Timeless flavours, tempered in small batches with the world&apos;s
                            finest cacao.
                        </p>

                        <ul className="mt-7 flex items-center gap-4">
                            {socials.map((social) => (
                                <li key={social.label}>
                                    <a
                                        href={social.href}
                                        target="_blank"
                                        rel="noreferrer noopener"
                                        aria-label={social.label}
                                        className="grid size-9 place-items-center border border-ivory/15 text-ivory/60 transition-colors hover:border-gold/50 hover:text-gold">
                                        <social.icon className="size-4" strokeWidth={1.4} />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {columns.map((column) => (
                        <nav key={column.title} aria-label={column.title}>
                            <h3 className="eyebrow font-sans text-gold">{column.title}</h3>
                            <ul className="mt-5 space-y-3">
                                {column.links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-[0.85rem] text-ivory/65 transition-colors hover:text-ivory">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    ))}
                </div>

                <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-ivory/12 pt-8 sm:flex-row">
                    <span className="text-[0.75rem] text-ivory/45">
                        © {new Date().getFullYear()} Chococart. All rights reserved.
                    </span>
                    <span className="eyebrow text-[0.5625rem] text-ivory/45">
                        Crafted with care · Made in India
                    </span>
                </div>
            </div>
        </footer>
    );
}
