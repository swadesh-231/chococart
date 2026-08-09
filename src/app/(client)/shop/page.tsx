import type { Metadata } from 'next';

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
            {/* No masthead: someone who has signed in came to buy chocolate, so
                the page opens straight onto the types and the shelf. The
                heading stays for screen readers and search engines, which still
                need to know what the page is. */}
            <h1 className="sr-only">Shop all Chococart chocolate</h1>

            <ShopGrid initialFilters={initialFilters} />
        </>
    );
}
