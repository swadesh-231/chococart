import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Lock } from 'lucide-react';

import { Reveal, RevealGroup, RevealItem } from '@/components/motion/reveal';
import SectionHeading from './section-heading';

/**
 * A marketing look at the range. Prices and add-to-cart deliberately live behind
 * sign-in on /shop — this section only sets the appetite.
 */
const families = [
    {
        name: 'Dark',
        notes: 'Rich · Smooth · Intense',
        copy: 'Single-origin cacao from 70% to 85%, conched for a long, clean finish.',
        image: '/assets/1720608785720.jpg',
    },
    {
        name: 'Milk',
        notes: 'Creamy · Salty · Indulgent',
        copy: 'Slow-churned with sea salt, caramel and toasted hazelnut.',
        image: '/assets/1720707243058.jpg',
    },
    {
        name: 'Gifting',
        notes: 'Exclusive · Seasonal · Unique',
        copy: 'Signature boxes, wrapped by hand and finished with a wax seal.',
        image: '/assets/product1.jpg',
    },
];

export default function CollectionTeaser() {
    return (
        <section id="collection" className="scroll-mt-28 bg-background">
            <div className="shell py-20 lg:py-28">
                <Reveal>
                    <SectionHeading
                        eyebrow="Our Collection"
                        title={
                            <>
                                Timeless Flavors.
                                <br className="hidden sm:block" /> Crafted to Perfection.
                            </>
                        }
                    />
                    <p className="prose-body mx-auto mt-6 text-center text-cocoa-600">
                        Three families, nine bars, one obsession. Sign in to see the full
                        collection, today&apos;s prices and what is in stock near you.
                    </p>
                </Reveal>

                <RevealGroup
                    as="ul"
                    className="mt-16 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                    {families.map((family) => (
                        <RevealItem as="li" key={family.name}>
                            <Link href="/shop" className="group flex h-full flex-col">
                                <div className="relative aspect-4/5 w-full overflow-hidden bg-ivory-dim">
                                    <Image
                                        src={family.image}
                                        alt={`${family.name} chocolate from Chococart`}
                                        fill
                                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                                        className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-cocoa-950/0 transition-colors duration-500 group-hover:bg-cocoa-950/10" />
                                </div>

                                <div className="flex flex-1 flex-col items-center px-4 py-7 text-center">
                                    <h3 className="font-heading text-2xl font-medium text-cocoa-800">
                                        {family.name}
                                    </h3>
                                    <p className="eyebrow mt-2 text-[0.5625rem] text-cocoa-500">
                                        {family.notes}
                                    </p>
                                    <p className="mt-4 max-w-[22rem] text-[0.825rem] leading-relaxed text-cocoa-500">
                                        {family.copy}
                                    </p>
                                    <span className="eyebrow link-underline mt-6 text-cocoa-800">
                                        Explore {family.name.toLowerCase()}
                                    </span>
                                </div>
                            </Link>
                        </RevealItem>
                    ))}
                </RevealGroup>

                <Reveal delay={0.1} className="mt-16 flex flex-col items-center gap-4">
                    <Link
                        href="/shop"
                        className="group inline-flex items-center gap-4 bg-cocoa-800 px-9 py-4 text-ivory transition-colors hover:bg-cocoa-900">
                        <span className="eyebrow">View the collection</span>
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <p className="flex items-center gap-2 text-[0.7rem] text-cocoa-500">
                        <Lock className="size-3" aria-hidden="true" />
                        Ordering opens once you sign in
                    </p>
                </Reveal>
            </div>
        </section>
    );
}
