import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { Reveal } from '@/components/motion/reveal';
import { formatPrice } from '@/lib/utils';

/** The Tasting Flight Box, as it is listed in the catalogue. */
const box = {
    pieces: '12 pieces',
    origins: '5 cacao origins',
    notes: 'Deep cocoa · toasted almond · black fig',
    price: 1150,
};

export default function Signature() {
    return (
        <section id="signature" className="scroll-mt-24 bg-cocoa-950 text-ivory">
            <div className="shell grid items-center gap-14 py-24 lg:grid-cols-2 lg:gap-20 lg:py-32">
                <Reveal className="order-2 lg:order-1">
                    <p className="eyebrow text-caramel-soft">The Signature Box</p>

                    <h2 className="display-2 mt-6">
                        {box.pieces}
                        <br />
                        {box.origins}
                    </h2>

                    <p className="mt-8 text-[0.9375rem] leading-relaxed text-ivory/60">
                        {box.notes}
                    </p>

                    <p className="tnum mt-10 font-heading text-3xl font-medium">
                        {formatPrice(box.price)}
                    </p>

                    <Link
                        href="/shop?category=gift-box"
                        className="group mt-10 inline-flex items-center gap-4 bg-ivory px-9 py-4.5 text-cocoa-950 transition-colors hover:bg-cream">
                        <span className="eyebrow">Shop the box</span>
                        <ArrowRight
                            className="size-4 transition-transform duration-500 group-hover:translate-x-1"
                            strokeWidth={1.5}
                        />
                    </Link>
                </Reveal>

                <Reveal className="order-1 lg:order-2" delay={0.08} direction="left">
                    <div className="relative aspect-4/5 w-full overflow-hidden bg-cocoa-900">
                        <Image
                            src="/assets/product1.jpg"
                            alt="The signature box, open, showing rows of hand-finished pralines"
                            fill
                            sizes="(min-width: 1024px) 46vw, 100vw"
                            className="object-cover"
                        />
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
