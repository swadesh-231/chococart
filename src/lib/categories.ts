/**
 * The house's chocolate types. One list, shared by the products table's
 * `category` column, the admin create form, and the shop's filter bar, so a
 * type can never be added in one place and go missing in another.
 */
export const PRODUCT_CATEGORIES = ['dark', 'milk', 'white', 'truffle', 'gift-box'] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

/** What products fall back to — matches the column default in the schema. */
export const DEFAULT_CATEGORY: ProductCategory = 'dark';

const LABELS: Record<ProductCategory, string> = {
    dark: 'Dark',
    milk: 'Milk',
    white: 'White',
    truffle: 'Truffle',
    'gift-box': 'Gift box',
};

export const isProductCategory = (value: unknown): value is ProductCategory =>
    typeof value === 'string' && (PRODUCT_CATEGORIES as readonly string[]).includes(value);

/**
 * Rows written before the column existed carry the default, but a hand-edited
 * row could hold anything — so unknown values are shown as-is rather than
 * dropped, and never crash a card.
 */
export function categoryLabel(value: string | null | undefined): string {
    if (!value) return LABELS[DEFAULT_CATEGORY];
    return isProductCategory(value) ? LABELS[value] : value;
}
