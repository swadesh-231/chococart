import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { Reveal, RevealGroup, RevealItem } from '@/components/motion/reveal';
import { formatPrice } from '@/lib/utils';

/**
 * Three chocolates, chosen to show the range rather than the whole shelf.
 * Names, notes and prices track `src/data/chocolates.json`, so the landing page
 * never quotes a price the shop will not honour. The tile leads to its type on
 * /shop — adding to the bag needs a real catalogue row, which only the shop
 * has.
 */
const featured = [
    {
        name: '78% Dark · Ecuador',
        notes: 'Deep cocoa · roasted almond',
        price: 625,
        href: '/shop?category=dark',
        image: '/assets/1720608785720.jpg',
        alt: 'A tempered 78% dark chocolate bar, seen from above',
    },
    {
        name: '34% Milk · Dominican Republic',
        notes: 'Salted caramel · ripe banana',
        price: 475,
        href: '/shop?category=milk',
        image: '/assets/1720707243058.jpg',
        alt: 'A glossy milk chocolate bar on a warm brown ground',
    },
    {
        name: '33% White · Ghana',
        notes: 'Lemon · poppy · cocoa butter',
        price: 590,
        href: '/shop?category=white',
        image: '/assets/1721119564567.jpg',
        alt: 'A white chocolate block finished with a dark chocolate curl',
    },
];

export default function Featured() {
    return (
        <section id="chocolates" className="scroll-mt-24 bg-ivory">
            <div className="shell pb-24 lg:pb-32">
                <Reveal className="flex flex-wrap items-end justify-between gap-6 border-t border-border pt-14">
                    <div>
                        <p className="eyebrow text-caramel">Featured</p>
                        <h2 className="display-2 mt-5 text-cocoa-950">Made for the moment.</h2>
                    </div>

                    <Link
                        href="/shop"
                        className="eyebrow link-underline group flex items-center gap-3 pb-1 text-cocoa-700">
                        All chocolates
                        <ArrowRight
                            className="size-3.5 transition-transform duration-500 group-hover:translate-x-1"
                            strokeWidth={1.5}
                        />
                    </Link>
                </Reveal>

                <RevealGroup
                    as="ul"
                    className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:mt-20 lg:grid-cols-3 lg:gap-x-12">
                    {featured.map((chocolate) => (
                        <RevealItem as="li" key={chocolate.name}>
                            <Link href={chocolate.href} className="group block">
                                <div className="relative aspect-4/3 w-full overflow-hidden bg-cream">
                                    <Image
                                        src={chocolate.image}
                                        alt={chocolate.alt}
                                        fill
                                        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 100vw"
                                        className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-103"
                                    />
                                </div>

                                <h3 className="mt-7 font-heading text-2xl leading-snug font-medium text-cocoa-950">
                                    {chocolate.name}
                                </h3>
                                <p className="mt-2 text-[0.8125rem] text-cocoa-500">
                                    {chocolate.notes}
                                </p>

                                <div className="mt-5 flex items-center justify-between">
                                    <span className="tnum text-[0.9375rem] text-cocoa-800">
                                        {formatPrice(chocolate.price)}
                                    </span>
                                    {/* Decorative: the whole tile is the link, so this
                                        stays out of the tab order and the a11y tree. */}
                                    <span
                                        aria-hidden="true"
                                        className="font-heading text-xl leading-none text-cocoa-400 transition-colors duration-300 group-hover:text-caramel">
                                        +
                                    </span>
                                </div>
                            </Link>
                        </RevealItem>
                    ))}
                </RevealGroup>
            </div>
        </section>
    );
}
