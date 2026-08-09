import Link from 'next/link';

import { BrandMark, Wordmark } from './brand-mark';

/* lucide dropped brand glyphs in v1, so the social mark is drawn here. */
function InstagramIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
            <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="5"
                stroke="currentColor"
                strokeWidth="1.4"
            />
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.4" />
            <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
        </svg>
    );
}

/** Only routes that exist — a luxury footer full of dead links is neither. */
const columns = [
    {
        title: 'Shop',
        links: [
            { label: 'All chocolate', href: '/shop' },
            { label: 'Dark', href: '/shop?category=dark' },
            { label: 'Milk', href: '/shop?category=milk' },
            { label: 'Gift boxes', href: '/shop?category=gift-box' },
        ],
    },
    {
        title: 'House',
        links: [
            { label: 'Our story', href: '/#story' },
            { label: 'The signature box', href: '/#signature' },
            { label: 'Delivery', href: '/#delivery' },
        ],
    },
    {
        title: 'Account',
        links: [
            { label: 'Your bag', href: '/cart' },
            { label: 'Order history', href: '/account/orders' },
            { label: 'Your profile', href: '/account/profile' },
        ],
    },
];

export default function Footer() {
    return (
        <footer className="bg-cocoa-950 text-ivory">
            <div className="shell py-20">
                <div className="grid gap-14 md:grid-cols-[1.3fr_repeat(3,1fr)]">
                    <div className="flex flex-col items-start gap-4">
                        <BrandMark className="h-8 text-caramel-soft" />
                        <Wordmark className="!items-start" tagline={null} />
                        <a
                            href="https://instagram.com"
                            target="_blank"
                            rel="noreferrer noopener"
                            className="eyebrow mt-6 inline-flex items-center gap-2.5 text-ivory/60 transition-colors hover:text-ivory">
                            <InstagramIcon className="size-4" />
                            Instagram
                        </a>
                    </div>

                    {columns.map((column) => (
                        <nav key={column.title} aria-label={column.title}>
                            <h3 className="eyebrow font-sans text-caramel-soft">{column.title}</h3>
                            <ul className="mt-6 space-y-3.5">
                                {column.links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-[0.85rem] text-ivory/60 transition-colors hover:text-ivory">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    ))}
                </div>

                <div className="mt-20 flex flex-col items-start justify-between gap-4 border-t border-ivory/12 pt-8 sm:flex-row sm:items-center">
                    <span className="text-[0.75rem] text-ivory/45">
                        © {new Date().getFullYear()} Chococart
                    </span>
                    <span className="eyebrow text-[0.5625rem] text-ivory/45">
                        Complimentary delivery · Made in India
                    </span>
                </div>
            </div>
        </footer>
    );
}
