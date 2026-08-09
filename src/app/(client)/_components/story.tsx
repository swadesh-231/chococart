import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { Reveal } from '@/components/motion/reveal';

export default function Story() {
    return (
        <section id="story" className="scroll-mt-24 bg-cream">
            <div className="shell py-24 lg:py-32">
                {/* Asymmetric on purpose: the photograph takes the left half
                    and the copy sits a little below centre, hard against the
                    right edge, with a whole column of air between them. */}
                <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-x-8">
                    <Reveal className="lg:col-span-6">
                        <div className="relative aspect-4/5 w-full overflow-hidden bg-ivory-dim sm:aspect-3/2 lg:aspect-square">
                            <Image
                                src="/assets/choco-bg.jpg"
                                alt="Truffles and pralines laid out on marble in the atelier"
                                fill
                                sizes="(min-width: 1024px) 49vw, 100vw"
                                className="object-cover"
                            />
                        </div>
                    </Reveal>

                    <Reveal
                        delay={0.08}
                        className="lg:col-span-5 lg:col-start-8 lg:mt-16"
                        direction="left">
                        <p className="eyebrow text-caramel">Why we make it</p>

                        <h2 className="display-2 mt-6 text-cocoa-950">
                            Chocolate should
                            <br />
                            feel personal.
                        </h2>

                        <p className="prose-body mt-7 text-cocoa-600">
                            Small-batch chocolate, made carefully and delivered thoughtfully. We
                            temper in neighbourhood ateliers so every bar reaches you with its snap
                            and its shine intact.
                        </p>

                        <Link
                            href="#signature"
                            className="eyebrow link-underline group mt-10 inline-flex items-center gap-3 text-cocoa-800">
                            See the signature box
                            <ArrowRight
                                className="size-3.5 transition-transform duration-500 group-hover:translate-x-1"
                                strokeWidth={1.5}
                            />
                        </Link>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}
