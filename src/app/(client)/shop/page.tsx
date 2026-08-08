import type { Metadata } from 'next';
import Image from 'next/image';

import { Reveal } from '@/components/motion/reveal';
import { BrandMark } from '../_components/brand-mark';
import { filtersFromSearchParams } from './_components/filters';
import ShopGrid from './_components/shop-grid';

export const metadata: Metadata = {
    description:
        'Every Chococart bar, tempered in small batches. Choose your flavour and add it to your cart.',
};

export default async function ShopPage({ searchParams }: PageProps<'/shop'>) {
    // Resolved here rather than in the grid: a client-side read of the query
    // string disagrees with what the server rendered, and the mismatch stops
    // the boundary from ever hydrating.
    const initialFilters = filtersFromSearchParams(await searchParams);

    return (
        <>
            <section className="relative isolate overflow-hidden border-b border-border bg-background">
                <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
                    <div className="shell flex flex-col justify-center py-16 lg:py-24">
                        <Reveal className="max-w-xl">
                            <div className="flex items-center gap-3">
                                <BrandMark className="h-5 text-gold" />
                                <span className="eyebrow text-cocoa-500">Our Collection</span>
                            </div>
                            <h1 className="display-1 mt-6 text-cocoa-800">
                                Timeless Flavors.
                                <br />
                                Crafted to Perfection.
                            </h1>
                            <p className="prose-body mt-7 text-cocoa-600">
                                Every bar we temper, in small batches with the world&apos;s finest
                                cacao and nothing artificial. Narrow by type, strength or
                                tasting note.
                            </p>
                        </Reveal>
                    </div>

                    <div className="relative min-h-[16rem] lg:min-h-[26rem]">
                        <Image
                            src="/assets/chocolate.jpg"
                            alt="Chococart bars with roasted cacao beans on slate"
                            fill
                            priority
                            sizes="(min-width: 1024px) 52vw, 100vw"
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-linear-to-r from-background via-transparent to-transparent lg:from-background/90" />
                    </div>
                </div>
            </section>

            <ShopGrid initialFilters={initialFilters} />
        </>
    );
}
