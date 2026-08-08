import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { Reveal } from '@/components/motion/reveal';
import { BrandMark } from './brand-mark';

export default function Story() {
    return (
        <section id="story" className="scroll-mt-28">
            <div className="grid lg:grid-cols-2">
                <div className="flex flex-col justify-center bg-cocoa-800 px-6 py-20 text-ivory md:px-14 lg:py-28">
                    <Reveal className="mx-auto w-full max-w-md" direction="right">
                        <span className="eyebrow text-gold">Our Story</span>
                        <h2 className="display-2 mt-5">
                            Rooted in Tradition.
                            <br />
                            Driven by Passion.
                        </h2>
                        <p className="prose-body mt-7 text-ivory/70">
                            Chococart began with one stubborn belief: that great chocolate should
                            never have to travel far to reach you. We temper in small batches at
                            neighbourhood ateliers, so every bar arrives with its snap and its
                            shine intact.
                        </p>
                        <p className="prose-body mt-4 text-ivory/70">
                            From bean to bar, every step is guided by patience, precision and
                            purpose — and nothing leaves the marble until it earns its wrapper.
                        </p>
                        <Link
                            href="#craft"
                            className="eyebrow link-underline mt-9 inline-flex items-center gap-3 text-gold">
                            See how it is made
                            <ArrowRight className="size-3.5" />
                        </Link>
                    </Reveal>
                </div>

                <div className="relative min-h-[22rem] lg:min-h-full">
                    <Image
                        src="/assets/product3.jpg"
                        alt="Layers of dark chocolate with a raspberry ganache centre"
                        fill
                        sizes="(min-width: 1024px) 50vw, 100vw"
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-cocoa-950/12" />
                    <BrandMark className="absolute right-8 bottom-8 h-14 text-ivory/50" />
                </div>
            </div>
        </section>
    );
}
