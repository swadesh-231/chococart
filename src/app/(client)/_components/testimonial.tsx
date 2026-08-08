import { Reveal, RevealGroup, RevealItem } from '@/components/motion/reveal';
import { BrandMark } from './brand-mark';

const quotes = [
    {
        quote: 'The texture, the balance, the packaging — everything about Chococart is pure elegance.',
        name: 'Ananya D.',
        city: 'Mumbai',
    },
    {
        quote: 'It arrived in twelve minutes and still had a perfect snap. I did not think that was possible.',
        name: 'Rohan M.',
        city: 'Bengaluru',
    },
    {
        quote: 'I sent the signature box to a client and got a phone call just to say thank you.',
        name: 'Meera S.',
        city: 'Delhi',
    },
];

export default function Testimonial() {
    return (
        <section aria-label="What our customers say" className="bg-background">
            <div className="shell py-20 lg:py-28">
                <Reveal className="flex flex-col items-center text-center">
                    <BrandMark className="h-8 text-gold" />
                    <span className="eyebrow mt-6 text-cocoa-500">Kind words</span>
                </Reveal>

                <RevealGroup
                    as="ul"
                    className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8 lg:gap-12">
                    {quotes.map((entry) => (
                        <RevealItem
                            as="li"
                            key={entry.name}
                            className="flex flex-col items-center text-center">
                            <figure className="flex flex-1 flex-col items-center">
                                <span
                                    aria-hidden="true"
                                    className="font-heading text-4xl leading-none text-gold/70">
                                    &ldquo;
                                </span>
                                <blockquote className="mt-3 font-heading text-xl leading-relaxed font-light text-cocoa-800 sm:text-[1.375rem]">
                                    {entry.quote}
                                </blockquote>
                                <figcaption className="eyebrow mt-6 text-[0.5625rem] text-cocoa-500">
                                    {entry.name} · {entry.city}
                                </figcaption>
                            </figure>
                        </RevealItem>
                    ))}
                </RevealGroup>
            </div>
        </section>
    );
}
