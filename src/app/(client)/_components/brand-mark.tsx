import { cn } from '@/lib/utils';

/** Cacao pod flanked by leaves, on a stem — the house mark. */
export function BrandMark({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 32 40"
            fill="none"
            aria-hidden="true"
            className={cn('h-8 w-auto', className)}>
            <path
                d="M16 4c-3.6 3.1-5.4 6.9-5.4 11.3 0 4.9 2.1 8.9 5.4 11.7 3.3-2.8 5.4-6.8 5.4-11.7C21.4 10.9 19.6 7.1 16 4Z"
                stroke="currentColor"
                strokeWidth="1.1"
                strokeLinejoin="round"
            />
            <path d="M16 7.5v16.8" stroke="currentColor" strokeWidth="0.9" opacity="0.55" />
            <path
                d="M10.6 15.3c-2.6-.8-4.9-.4-6.6 1.1 1.5 1.8 3.6 2.6 6.2 2.3M21.4 15.3c2.6-.8 4.9-.4 6.6 1.1-1.5 1.8-3.6 2.6-6.2 2.3"
                stroke="currentColor"
                strokeWidth="1.1"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path d="M16 27v6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
            <path d="M11.5 36h9" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
    );
}

/**
 * Wordmark used in the header, footer and sign-in card. `tagline={null}` drops
 * the second line for tight spots such as the scrolled header.
 */
export function Wordmark({
    className,
    tagline = 'Artisan Chocolatier',
    size = 'default',
}: {
    className?: string;
    tagline?: string | null;
    size?: 'default' | 'lg';
}) {
    return (
        <span className={cn('flex flex-col items-center leading-none', className)}>
            <span
                className={cn(
                    'font-heading font-semibold uppercase',
                    size === 'lg'
                        ? 'text-2xl tracking-[0.26em] sm:text-3xl'
                        : 'text-[1.0625rem] tracking-[0.2em] sm:text-xl sm:tracking-[0.22em]'
                )}>
                Chococart
            </span>
            {tagline && (
                <span className="eyebrow mt-1.5 text-[0.5rem] opacity-70 sm:text-[0.5625rem]">
                    {tagline}
                </span>
            )}
        </span>
    );
}
