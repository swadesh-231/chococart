'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

import { BrandMark } from './brand-mark';

const ease = [0.22, 1, 0.36, 1] as const;

export default function Hero() {
    const reduced = useReducedMotion();

    /** Copy arrives line by line, so the headline lands last. */
    const rise = (delay: number) => ({
        initial: reduced ? { opacity: 0 } : { opacity: 0, y: 22 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: reduced ? 0.3 : 0.85, delay, ease },
    });

    return (
        <section className="grain relative isolate overflow-hidden bg-cocoa-950">
            <motion.div
                className="absolute inset-0"
                initial={{ scale: reduced ? 1 : 1.08 }}
                animate={{ scale: 1 }}
                transition={{ duration: reduced ? 0 : 2.4, ease }}>
                <Image
                    src="/assets/chocolate.jpg"
                    alt="A hand-tempered chocolate bar with roasted cacao beans on slate"
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover object-right"
                />
            </motion.div>

            {/* Two washes: one to seat the copy, one to warm the whole frame. */}
            <div className="absolute inset-0 bg-linear-to-r from-cocoa-950/95 via-cocoa-950/70 to-cocoa-950/25" />
            <div className="absolute inset-0 bg-linear-to-t from-cocoa-950/60 via-transparent to-cocoa-950/25" />

            <div className="shell relative flex min-h-[34rem] flex-col justify-center py-24 sm:min-h-[38rem] lg:min-h-[42rem] lg:py-32">
                <div className="max-w-2xl">
                    <motion.div className="flex items-center gap-3" {...rise(0.1)}>
                        <BrandMark className="h-5 text-gold" />
                        <span className="eyebrow text-gold">
                            Artisan chocolatier · Small batch
                        </span>
                    </motion.div>

                    <motion.h1 className="display-1 mt-7 text-ivory" {...rise(0.22)}>
                        The Art of
                        <br />
                        Pure Indulgence
                    </motion.h1>

                    <motion.p
                        className="prose-body mt-7 text-ivory/70"
                        {...rise(0.36)}>
                        Bean to bar chocolate, crafted in small batches with the world&apos;s finest
                        cacao — then delivered to your door while it is still perfect.
                    </motion.p>

                    <motion.div
                        className="mt-11 flex flex-col items-start gap-7 sm:flex-row sm:items-center sm:gap-10"
                        {...rise(0.5)}>
                        <Link
                            href="/shop"
                            className="group inline-flex items-center gap-4 bg-ivory px-8 py-4 text-cocoa-900 transition-colors hover:bg-beige">
                            <span className="eyebrow">Shop Collection</span>
                            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                        </Link>

                        <Link href="#story" className="eyebrow link-underline text-ivory/80">
                            Discover our story
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
