'use client';

import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Check } from 'lucide-react';

import { newsletterSchema, type NewsletterFormValues } from '@/lib/validators/newsletterSchema';

export default function NewsLetter() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitSuccessful, isSubmitting },
    } = useForm<NewsletterFormValues>({
        resolver: zodResolver(newsletterSchema),
        mode: 'onSubmit',
    });

    // No mailing provider is wired up yet, so a valid address is simply
    // acknowledged. Swap this for the real subscribe call when one exists.
    const onSubmit = async () => {};

    return (
        <section className="grain relative isolate overflow-hidden">
            <Image
                src="/assets/choco-bg.jpg"
                alt=""
                fill
                aria-hidden="true"
                sizes="100vw"
                className="object-cover"
            />
            <div className="absolute inset-0 bg-cocoa-950/88" />

            <div className="shell relative py-20 lg:py-24">
                <div className="mx-auto flex max-w-2xl flex-col items-center text-center text-ivory">
                    <span className="eyebrow text-gold">Stay close to the craft</span>
                    <h2 className="display-2 mt-5">Rarely, and Only When It Matters</h2>
                    <p className="prose-body mt-5 text-ivory/70">
                        New collections, limited editions and the occasional recipe. No noise, and
                        never more than once a month.
                    </p>

                    <div className="mt-10 w-full max-w-md">
                        <AnimatePresence mode="wait" initial={false}>
                            {isSubmitSuccessful ? (
                                <motion.p
                                    key="done"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                    className="flex items-center justify-center gap-2.5 border-b border-gold/40 pb-3 text-sm text-gold">
                                    <Check className="size-4" aria-hidden="true" />
                                    You&apos;re on the list. Welcome to the house.
                                </motion.p>
                            ) : (
                                <motion.form
                                    key="form"
                                    noValidate
                                    onSubmit={handleSubmit(onSubmit)}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.25 }}
                                    className="text-left">
                                    <div className="flex items-center gap-4 border-b border-ivory/30 pb-2 focus-within:border-gold/60">
                                        <label htmlFor="newsletter-email" className="sr-only">
                                            Email address
                                        </label>
                                        <input
                                            id="newsletter-email"
                                            type="email"
                                            autoComplete="email"
                                            aria-invalid={Boolean(errors.email)}
                                            aria-describedby={
                                                errors.email ? 'newsletter-error' : undefined
                                            }
                                            placeholder="Enter your email address"
                                            className="min-w-0 flex-1 bg-transparent text-sm text-ivory placeholder:text-ivory/45 focus:outline-none"
                                            {...register('email')}
                                        />
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="eyebrow flex shrink-0 items-center gap-2 text-gold transition-colors hover:text-gold-soft disabled:opacity-60">
                                            Subscribe
                                            <ArrowRight className="size-3.5" />
                                        </button>
                                    </div>
                                    {errors.email && (
                                        <p
                                            id="newsletter-error"
                                            role="alert"
                                            className="mt-2.5 text-[0.75rem] text-gold-soft">
                                            {errors.email.message}
                                        </p>
                                    )}
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
}
