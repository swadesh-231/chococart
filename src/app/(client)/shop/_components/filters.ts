/**
 * The shop's filter vocabulary.
 *
 * Deliberately not a `'use client'` module: the shop page reads the query
 * string on the server and passes the resulting filters down as a prop, and a
 * server component cannot call a function exported from a client module — those
 * exports arrive as client references, not callable code.
 */

import { isFlavourNote, isProductCategory } from '@/lib/categories';

/**
 * Cocoa is offered as bands rather than a slider: a shopper thinks "dark, but
 * not punishing", not "seventy-two per cent". Bands also map cleanly onto the
 * endpoint's min/max, which ignores a bound left at the range's edge.
 */
export const COCOA_BANDS = {
    any: { label: 'Any', minCocoa: undefined, maxCocoa: undefined },
    mild: { label: 'Under 50%', minCocoa: undefined, maxCocoa: 50 },
    medium: { label: '50 – 70%', minCocoa: 50, maxCocoa: 70 },
    dark: { label: '70 – 85%', minCocoa: 70, maxCocoa: 85 },
    intense: { label: '85% and over', minCocoa: 85, maxCocoa: undefined },
} satisfies Record<string, { label: string; minCocoa?: number; maxCocoa?: number }>;

export type CocoaBand = keyof typeof COCOA_BANDS;

/** Sort keys the endpoint understands, with the wording shoppers read. */
export const SORTS: Record<string, string> = {
    featured: 'Featured',
    'price-asc': 'Price: low to high',
    'price-desc': 'Price: high to low',
    name: 'Alphabetical',
    'cocoa-desc': 'Cocoa: strongest first',
};

export type ShopFilters = {
    q: string;
    category: string;
    notes: string[];
    cocoa: CocoaBand;
    vegan: boolean;
    glutenFree: boolean;
    sort: string;
};

export const DEFAULT_FILTERS: ShopFilters = {
    q: '',
    category: 'all',
    notes: [],
    cocoa: 'any',
    vegan: false,
    glutenFree: false,
    sort: 'featured',
};

/**
 * Seeds the rail from the query string, so `/shop?category=truffle` from the
 * landing page (or a shared link) opens already narrowed. Anything unrecognised
 * falls back to its default rather than putting the rail in a state its own
 * controls cannot represent.
 */
export function filtersFromParams(params: URLSearchParams): ShopFilters {
    const category = params.get('category');
    const cocoa = params.get('cocoa');
    const sort = params.get('sort');

    return {
        ...DEFAULT_FILTERS,
        q: params.get('q') ?? '',
        category: isProductCategory(category) ? category : 'all',
        notes: (params.get('notes') ?? '').split(',').filter(isFlavourNote),
        cocoa: cocoa && cocoa in COCOA_BANDS ? (cocoa as CocoaBand) : 'any',
        vegan: params.get('vegan') === '1',
        glutenFree: params.get('glutenFree') === '1',
        sort: sort && sort in SORTS ? sort : DEFAULT_FILTERS.sort,
    };
}

/** Accepts Next's `searchParams` shape, which allows repeated keys. */
export function filtersFromSearchParams(
    params: Record<string, string | string[] | undefined>
): ShopFilters {
    const search = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
        const first = Array.isArray(value) ? value[0] : value;
        if (first !== undefined) search.set(key, first);
    }

    return filtersFromParams(search);
}

/** How many narrowings are in play — drives the mobile button's badge. */
export function activeFilterCount(filters: ShopFilters): number {
    return (
        (filters.category !== 'all' ? 1 : 0) +
        filters.notes.length +
        (filters.cocoa !== 'any' ? 1 : 0) +
        (filters.vegan ? 1 : 0) +
        (filters.glutenFree ? 1 : 0)
    );
}
