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
        <section className="relative isolate overflow-hidden bg-ivory">
            {/* A warm bloom behind the copy keeps the flat ivory from going dead. */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-40 -left-40 size-[36rem] rounded-full bg-beige/45 blur-3xl"
            />

            <div className="relative grid lg:min-h-[42rem] lg:grid-cols-[1.02fr_1fr]">
                <div className="order-2 flex flex-col justify-center px-5 pt-4 pb-16 md:px-8 lg:order-1 lg:py-24 lg:pr-14 lg:pl-[max(2rem,calc((100vw-80rem)/2+2rem))]">
                    <motion.div className="flex items-center gap-3" {...rise(0.1)}>
                        <BrandMark className="h-5 text-gold" />
                        <span className="eyebrow text-[0.5625rem] text-cocoa-500 sm:text-[0.625rem]">
                            Artisan chocolatier · Made in India
                        </span>
                    </motion.div>

                    <motion.h1 className="display-1 mt-7 text-cocoa-800" {...rise(0.22)}>
                        The Art of
                        <br />
                        Pure Indulgence
                    </motion.h1>

                    <motion.p className="prose-body mt-7 text-cocoa-600" {...rise(0.36)}>
                        Bean to bar chocolate, tempered by hand in small batches with the
                        world&apos;s finest cacao — then delivered to your door while it is still
                        perfect.
                    </motion.p>

                    <motion.div
                        className="mt-10 flex flex-col items-start gap-7 sm:flex-row sm:items-center sm:gap-10"
                        {...rise(0.5)}>
                        <Link
                            href="/shop"
                            className="group inline-flex items-center gap-4 bg-cocoa-800 px-9 py-4.5 text-ivory transition-colors hover:bg-cocoa-900">
                            <span className="eyebrow">Shop Collection</span>
                            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                        </Link>

                        <Link href="#story" className="eyebrow link-underline text-cocoa-700">
                            Discover our story
                        </Link>
                    </motion.div>

                    <motion.dl
                        className="mt-14 flex flex-wrap gap-x-12 gap-y-6 border-t border-border pt-8"
                        {...rise(0.62)}>
                        {[
                            { value: '10 min', label: 'Average delivery' },
                            { value: '72%', label: 'Single origin cacao' },
                            { value: '4.9/5', label: 'From 2,400 boxes' },
                        ].map((stat) => (
                            <div key={stat.label}>
                                <dt className="tnum font-heading text-2xl font-medium text-cocoa-800">
                                    {stat.value}
                                </dt>
                                <dd className="eyebrow mt-1.5 text-[0.5rem] text-cocoa-500">
                                    {stat.label}
                                </dd>
                            </div>
                        ))}
                    </motion.dl>
                </div>

                {/* The photograph bleeds to the right edge, as in the reference. */}
                <motion.div
                    className="relative order-1 min-h-[22rem] overflow-hidden sm:min-h-[28rem] lg:order-2 lg:min-h-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: reduced ? 0.3 : 1, ease }}>
                    <motion.div
                        className="absolute inset-0"
                        initial={{ scale: reduced ? 1 : 1.08 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: reduced ? 0 : 2.4, ease }}>
                        <Image
                            src="/assets/product2.jpg"
                            alt="A black box of hand-finished pralines beside a gilded cup"
                            fill
                            priority
                            sizes="(min-width: 1024px) 50vw, 100vw"
                            className="object-cover object-[50%_38%]"
                        />
                    </motion.div>

                    {/* Feathers the photograph into the ivory panel beside it. */}
                    <div
                        aria-hidden="true"
                        className="absolute inset-y-0 -left-px hidden w-32 bg-linear-to-r from-ivory to-transparent lg:block"
                    />
                    <div
                        aria-hidden="true"
                        className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-ivory to-transparent lg:hidden"
                    />
                </motion.div>
            </div>
        </section>
    );
}
