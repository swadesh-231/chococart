import Image from 'next/image';
import Link from 'next/link';

import { Reveal, RevealGroup, RevealItem } from '@/components/motion/reveal';
import SectionHeading from './section-heading';

const entries = [
    {
        kicker: 'Origin',
        title: 'What single origin actually tastes like',
        readingTime: '4 min read',
        image: '/assets/1720608785720.jpg',
    },
    {
        kicker: 'Technique',
        title: 'Why tempering is the whole game',
        readingTime: '6 min read',
        image: '/assets/1720707243058.jpg',
    },
    {
        kicker: 'Pairing',
        title: 'Dark chocolate and the wines that suit it',
        readingTime: '5 min read',
        image: '/assets/product3.jpg',
    },
];

export default function Journal() {
    return (
        <section id="journal" className="scroll-mt-28 border-t border-border bg-background">
            <div className="shell py-20 lg:py-28">
                <Reveal>
                    <SectionHeading
                        eyebrow="The Journal"
                        title="Notes from the Atelier"
                        align="left"
                    />
                </Reveal>

                <RevealGroup as="ul" className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
                    {entries.map((entry) => (
                        <RevealItem as="li" key={entry.title}>
                            <Link href="#journal" className="group block">
                                <div className="relative aspect-3/2 w-full overflow-hidden bg-ivory-dim">
                                    <Image
                                        src={entry.image}
                                        alt=""
                                        fill
                                        sizes="(min-width: 768px) 33vw, 100vw"
                                        className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                                    />
                                </div>
                                <p className="eyebrow mt-5 text-[0.5625rem] text-gold">
                                    {entry.kicker}
                                </p>
                                <h3 className="mt-2.5 font-heading text-xl leading-snug font-medium text-cocoa-800 transition-colors group-hover:text-cocoa-950">
                                    {entry.title}
                                </h3>
                                <p className="mt-2 text-[0.75rem] text-cocoa-500">
                                    {entry.readingTime}
                                </p>
                            </Link>
                        </RevealItem>
                    ))}
                </RevealGroup>
            </div>
        </section>
    );
}
