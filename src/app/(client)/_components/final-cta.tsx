import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { Reveal } from '@/components/motion/reveal';

export default function FinalCta() {
    return (
        <section className="bg-cream">
            <div className="shell py-24 text-center lg:py-32">
                <Reveal className="mx-auto flex max-w-2xl flex-col items-center">
                    <h2 className="display-1 text-cocoa-950">
                        Something worth
                        <br />
                        bringing home.
                    </h2>

                    <p className="prose-body mt-8 text-cocoa-600">
                        Discover chocolates made for slow moments and good company.
                    </p>

                    <Link
                        href="/shop"
                        className="group mt-12 inline-flex items-center gap-4 bg-cocoa-950 px-9 py-4.5 text-ivory transition-colors hover:bg-cocoa-800">
                        <span className="eyebrow">Shop Chocolates</span>
                        <ArrowRight
                            className="size-4 transition-transform duration-500 group-hover:translate-x-1"
                            strokeWidth={1.5}
                        />
                    </Link>
                </Reveal>
            </div>

            <Reveal>
                <div className="relative aspect-3/2 w-full overflow-hidden sm:aspect-21/9">
                    <Image
                        src="/assets/chocolate.jpg"
                        alt="A tempered bar broken over slate, scattered with roasted cacao beans"
                        fill
                        sizes="100vw"
                        className="object-cover"
                    />
                </div>
            </Reveal>
        </section>
    );
}
