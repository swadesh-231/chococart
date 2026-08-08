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
 * The house owns eight photographs, so a hundred chocolates have to share them.
 * Mapping by category at least keeps a white chocolate from wearing a dark
 * chocolate's portrait, and indexing by id keeps a product's picture stable
 * between renders and page loads.
 */
const CATEGORY_IMAGES: Record<ProductCategory, string[]> = {
    dark: ['/assets/product1.jpg', '/assets/chocolate.jpg', '/assets/choco-bg.jpg'],
    milk: ['/assets/product2.jpg', '/assets/1720608785720.jpg'],
    white: ['/assets/product3.jpg', '/assets/1721119564567.jpg'],
    truffle: ['/assets/1720707243058.jpg', '/assets/product2.jpg'],
    'gift-box': ['/assets/chocolate.jpg', '/assets/product3.jpg'],
};

export function imageForCategory(category: string, seed: number): string {
    const pool = isProductCategory(category) ? CATEGORY_IMAGES[category] : CATEGORY_IMAGES.dark;
    return pool[Math.abs(seed) % pool.length];
}
