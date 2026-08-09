'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

const ease = [0.22, 1, 0.36, 1] as const;

export default function Hero() {
    const reduced = useReducedMotion();

    /** Copy arrives line by line, so the headline lands last. */
    const rise = (delay: number) => ({
        initial: reduced ? { opacity: 0 } : { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: reduced ? 0.3 : 0.9, delay, ease },
    });

    return (
        <section className="bg-ivory">
            {/* One screen, near enough: the photograph runs the full height of
                the section and off the right edge of the page. */}
            <div className="grid lg:min-h-[min(46rem,100svh)] lg:grid-cols-[1.05fr_1fr]">
                {/* The copy keeps the page gutter on the left and lets the
                    photograph take everything to the right of it. The header
                    floats over this section, so the top padding clears it. */}
                <div className="flex flex-col justify-center px-5 pt-28 pb-16 md:px-8 md:pt-32 lg:py-24 lg:pr-16 lg:pl-[max(2rem,calc((100vw-80rem)/2+2rem))]">
                    <motion.p className="eyebrow text-caramel" {...rise(0.05)}>
                        Small-batch · Handcrafted
                    </motion.p>

                    <motion.h1 className="display-1 mt-8 text-cocoa-950" {...rise(0.16)}>
                        Chocolate
                        <br />
                        worth slowing
                        <br />
                        down for.
                    </motion.h1>

                    <motion.p className="prose-body mt-8 text-cocoa-600" {...rise(0.3)}>
                        Thoughtfully crafted chocolate, made in small batches and delivered fresh
                        to your door.
                    </motion.p>

                    <motion.div className="mt-11" {...rise(0.42)}>
                        <Link
                            href="/shop"
                            className="group inline-flex items-center gap-4 bg-cocoa-950 px-9 py-4.5 text-ivory transition-colors hover:bg-cocoa-800">
                            <span className="eyebrow">Explore Chocolates</span>
                            <ArrowRight
                                className="size-4 transition-transform duration-500 group-hover:translate-x-1"
                                strokeWidth={1.5}
                            />
                        </Link>
                    </motion.div>
                </div>

                <motion.div
                    className="relative min-h-[24rem] overflow-hidden bg-cream sm:min-h-[30rem] lg:min-h-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: reduced ? 0.3 : 1.1, ease }}>
                    <motion.div
                        className="absolute inset-0"
                        initial={{ scale: reduced ? 1 : 1.05 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: reduced ? 0 : 2.2, ease }}>
                        <Image
                            src="/assets/product2.jpg"
                            alt="An open box of hand-finished pralines beside a gilded cup of tea"
                            fill
                            preload
                            sizes="(min-width: 1024px) 50vw, 100vw"
                            className="object-cover object-[50%_38%]"
                        />
                    </motion.div>

                    {/* From lg the bar is transparent over this photograph, so
                        it has to fade out underneath or the navigation goes
                        illegible. Below lg the copy is what sits under the bar,
                        and the photograph needs no scrim at all. The left
                        feather joins it to the ivory panel beside it. */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-0 top-0 hidden h-44 bg-linear-to-b from-ivory via-ivory/70 to-transparent lg:block"
                    />
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-y-0 -left-px hidden w-28 bg-linear-to-r from-ivory to-transparent lg:block"
                    />
                </motion.div>
            </div>
        </section>
    );
}
