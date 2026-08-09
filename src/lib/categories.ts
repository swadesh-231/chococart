/**
 * The house taxonomy. One list per axis, shared by the products table, the
 * admin form, the shop's filter rail and the seed data, so a value can never be
 * added in one place and go missing in another.
 */

export const PRODUCT_CATEGORIES = ['dark', 'milk', 'white', 'truffle', 'gift-box'] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

/** What products fall back to — matches the column default in the schema. */
export const DEFAULT_CATEGORY: ProductCategory = 'dark';

const CATEGORY_LABELS: Record<ProductCategory, string> = {
    dark: 'Dark',
    milk: 'Milk',
    white: 'White',
    truffle: 'Truffle',
    'gift-box': 'Gift box',
};

export const FLAVOUR_NOTES = [
    'fruity',
    'nutty',
    'caramel',
    'floral',
    'spiced',
    'citrus',
    'roasted',
    'creamy',
] as const;

export type FlavourNote = (typeof FLAVOUR_NOTES)[number];

export const COCOA_RANGE = { min: 30, max: 100 } as const;

export const isProductCategory = (value: unknown): value is ProductCategory =>
    typeof value === 'string' && (PRODUCT_CATEGORIES as readonly string[]).includes(value);

export const isFlavourNote = (value: unknown): value is FlavourNote =>
    typeof value === 'string' && (FLAVOUR_NOTES as readonly string[]).includes(value);

/** Sentence case for any taxonomy value, known or not. */
const titleCase = (value: string) =>
    value
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');

/**
 * Rows written before a column existed carry the default, but a hand-edited row
 * could hold anything — so unknown values are shown as-is rather than dropped,
 * and never crash a card.
 */
export function categoryLabel(value: string | null | undefined): string {
    if (!value) return CATEGORY_LABELS[DEFAULT_CATEGORY];
    return isProductCategory(value) ? CATEGORY_LABELS[value] : titleCase(value);
}

export const noteLabel = (value: string): string => titleCase(value);

/**
 * The house owns eight photographs, so fifty-odd chocolates have to share them.
 * Mapping by category keeps a white chocolate from wearing a dark chocolate's
 * portrait, and every pool is four deep — the widest the shop grid ever gets —
 * so a row need never show the same picture twice.
 */
export const CATEGORY_IMAGES: Record<ProductCategory, string[]> = {
    dark: [
        '/assets/1720608785720.jpg',
        '/assets/product1.jpg',
        '/assets/product3.jpg',
        '/assets/chocolate.jpg',
    ],
    milk: [
        '/assets/1720707243058.jpg',
        '/assets/chocolate.jpg',
        '/assets/product2.jpg',
        '/assets/choco-bg.jpg',
    ],
    white: [
        '/assets/1721119564567.jpg',
        '/assets/choco-bg.jpg',
        '/assets/product2.jpg',
        '/assets/product1.jpg',
    ],
    truffle: [
        '/assets/choco-bg.jpg',
        '/assets/1720707243058.jpg',
        '/assets/product2.jpg',
        '/assets/product1.jpg',
    ],
    'gift-box': [
        '/assets/product1.jpg',
        '/assets/product2.jpg',
        '/assets/choco-bg.jpg',
        '/assets/chocolate.jpg',
    ],
};

/** How many neighbours a picture has to clear before it may appear again. */
const REPEAT_WINDOW = 3;

/**
 * Deals photographs out to a run of chocolates **in the order they will be
 * shown**, which is the only order that matters — walk the shop's featured
 * listing, not the catalogue file, or the spread means nothing.
 *
 * A cursor per category works that type evenly through its own four pictures.
 * The shared window then rejects anything already on screen nearby, which the
 * cursors alone cannot do: the pools overlap, because slate and marble suit
 * more than one type, so two categories can otherwise collide inside a row.
 * Four deep against a window of three means no two of any four consecutive
 * chocolates share a picture.
 */
export function createImageDealer() {
    const cursors: Record<string, number> = {};
    const recent: string[] = [];

    return function nextImage(category: string): string {
        const pool = isProductCategory(category)
            ? CATEGORY_IMAGES[category]
            : CATEGORY_IMAGES[DEFAULT_CATEGORY];
        const cursor = cursors[category] ?? 0;

        let chosen = pool[cursor % pool.length];
        for (let step = 0; step < pool.length; step++) {
            const candidate = pool[(cursor + step) % pool.length];
            if (!recent.includes(candidate)) {
                chosen = candidate;
                cursors[category] = cursor + step + 1;
                break;
            }
            // Every picture this type owns is already showing nearby: keep the
            // cursor's own pick rather than leaving the pool.
            if (step === pool.length - 1) cursors[category] = cursor + 1;
        }

        recent.push(chosen);
        if (recent.length > REPEAT_WINDOW) recent.shift();

        return chosen;
    };
}
