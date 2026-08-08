

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { FLAVOUR_NOTES, PRODUCT_CATEGORIES } from '../src/lib/categories';

function rng(seed: number) {
    let a = seed;
    return () => {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

type Note = (typeof FLAVOUR_NOTES)[number];

const ORIGINS: { name: string; notes: Note[]; blurb: string }[] = [
    { name: 'Madagascar', notes: ['fruity', 'citrus'], blurb: 'red berries and a bright, clean acidity' },
    { name: 'Ecuador', notes: ['floral', 'nutty'], blurb: 'jasmine, green almond and a long floral finish' },
    { name: 'Venezuela', notes: ['nutty', 'caramel'], blurb: 'toasted hazelnut and soft butterscotch' },
    { name: 'Peru', notes: ['fruity', 'roasted'], blurb: 'dried plum over a deep, even roast' },
    { name: 'Ghana', notes: ['roasted', 'spiced'], blurb: 'classic cocoa depth with a warm, spiced tail' },
    { name: 'Tanzania', notes: ['citrus', 'fruity'], blurb: 'sharp citrus lifting a dense, fudgy body' },
    { name: 'Vietnam', notes: ['spiced', 'fruity'], blurb: 'black pepper, tamarind and stewed cherry' },
    { name: 'Colombia', notes: ['caramel', 'nutty'], blurb: 'panela sugar, walnut and a rounded finish' },
    { name: 'Brazil', notes: ['roasted', 'nutty'], blurb: 'espresso crema and roasted brazil nut' },
    { name: 'Dominican Republic', notes: ['fruity', 'creamy'], blurb: 'ripe banana and a creamy, low-acid melt' },
    { name: 'Papua New Guinea', notes: ['spiced', 'roasted'], blurb: 'campfire smoke, clove and dark molasses' },
    { name: 'Nicaragua', notes: ['caramel', 'roasted'], blurb: 'burnt caramel and toasted grain' },
    { name: 'Belize', notes: ['spiced', 'citrus'], blurb: 'allspice and candied lime peel' },
    { name: 'Uganda', notes: ['fruity', 'floral'], blurb: 'blackcurrant and dried rose' },
    { name: 'India · Idukki', notes: ['spiced', 'nutty'], blurb: 'cardamom, cashew and monsoon-aged cacao' },
    { name: 'Java', notes: ['roasted', 'caramel'], blurb: 'palm sugar and a slow, smoky roast' },
];

/** Inclusions per category, with what each adds to the price and the notes. */
const INCLUSIONS: Record<string, { name: string; notes: Note[]; premium: number }[]> = {
    dark: [
        { name: '', notes: [], premium: 0 },
        { name: 'Sea Salt', notes: [], premium: 30 },
        { name: 'Cacao Nib', notes: ['roasted'], premium: 40 },
        { name: 'Orange Peel', notes: ['citrus'], premium: 45 },
        { name: 'Roasted Almond', notes: ['nutty'], premium: 55 },
        { name: 'Espresso', notes: ['roasted'], premium: 50 },
        { name: 'Chilli & Cinnamon', notes: ['spiced'], premium: 45 },
        { name: 'Freeze-Dried Raspberry', notes: ['fruity'], premium: 65 },
        { name: 'Candied Ginger', notes: ['spiced'], premium: 50 },
        { name: 'Black Fig', notes: ['fruity'], premium: 60 },
    ],
    milk: [
        { name: '', notes: [], premium: 0 },
        { name: 'Salted Caramel', notes: ['caramel'], premium: 55 },
        { name: 'Hazelnut Praline', notes: ['nutty'], premium: 65 },
        { name: 'Honeycomb', notes: ['caramel'], premium: 50 },
        { name: 'Toasted Rice', notes: ['roasted'], premium: 40 },
        { name: 'Malted Milk', notes: ['creamy'], premium: 45 },
        { name: 'Peanut Butter', notes: ['nutty'], premium: 55 },
        { name: 'Cookie Crumb', notes: ['creamy'], premium: 50 },
    ],
    white: [
        { name: '', notes: [], premium: 0 },
        { name: 'Vanilla Bean', notes: ['creamy'], premium: 45 },
        { name: 'Raspberry Swirl', notes: ['fruity'], premium: 60 },
        { name: 'Matcha', notes: ['floral'], premium: 70 },
        { name: 'Pistachio', notes: ['nutty'], premium: 75 },
        { name: 'Lemon & Poppy', notes: ['citrus'], premium: 55 },
        { name: 'Rose & Cardamom', notes: ['floral', 'spiced'], premium: 65 },
        { name: 'Coconut', notes: ['creamy'], premium: 50 },
    ],
};

const TRUFFLE_FLAVOURS: { name: string; notes: Note[]; blurb: string }[] = [
    { name: 'Dark Ganache', notes: ['roasted'], blurb: 'a bittersweet ganache rolled in cocoa' },
    { name: 'Salted Caramel', notes: ['caramel'], blurb: 'a slow-cooked caramel with flaked salt' },
    { name: 'Champagne', notes: ['fruity'], blurb: 'a light ganache lifted with brut champagne' },
    { name: 'Hazelnut Praline', notes: ['nutty'], blurb: 'crushed praline folded through gianduja' },
    { name: 'Espresso', notes: ['roasted'], blurb: 'a double-shot ganache with a clean, bitter edge' },
    { name: 'Passion Fruit', notes: ['fruity', 'citrus'], blurb: 'sharp passion fruit against white ganache' },
    { name: 'Rose & Raspberry', notes: ['floral', 'fruity'], blurb: 'rose water and freeze-dried raspberry' },
    { name: 'Cardamom', notes: ['spiced'], blurb: 'green cardamom bloomed in warm cream' },
    { name: 'Pistachio Marzipan', notes: ['nutty'], blurb: 'Sicilian pistachio worked into soft marzipan' },
    { name: 'Coconut Rum', notes: ['creamy'], blurb: 'toasted coconut and a measure of aged rum' },
    { name: 'Earl Grey', notes: ['floral', 'citrus'], blurb: 'bergamot steeped overnight in cream' },
    { name: 'Honey & Thyme', notes: ['floral'], blurb: 'wildflower honey with a thread of thyme' },
    { name: 'Burnt Butter', notes: ['caramel', 'nutty'], blurb: 'butter cooked to hazelnut and set with sea salt' },
    { name: 'Blood Orange', notes: ['citrus'], blurb: 'blood orange zest through a dark ganache' },
    { name: 'Miso Caramel', notes: ['caramel', 'roasted'], blurb: 'white miso deepening a dark caramel' },
    { name: 'Salted Pecan', notes: ['nutty', 'caramel'], blurb: 'candied pecan crushed into a butter ganache' },
    { name: 'Sour Cherry', notes: ['fruity'], blurb: 'morello cherry macerated in kirsch' },
    { name: 'Saffron & Pistachio', notes: ['floral', 'nutty'], blurb: 'Kashmiri saffron bloomed in cream with pistachio' },
    { name: 'Peppermint', notes: ['floral'], blurb: 'cold-steeped peppermint against a dark shell' },
    { name: 'Whisky & Oak', notes: ['roasted', 'spiced'], blurb: 'a peated single malt softened with oak sugar' },
    { name: 'Yuzu', notes: ['citrus'], blurb: 'yuzu juice cutting through white ganache' },
    { name: 'Tonka & Vanilla', notes: ['creamy', 'spiced'], blurb: 'tonka bean grated over Tahitian vanilla' },
];

const TRUFFLE_COUNTS = [4, 6, 9, 12, 16, 24];

const BOX_THEMES: { name: string; notes: Note[]; blurb: string }[] = [
    { name: 'Discovery', notes: ['fruity', 'nutty'], blurb: 'a tour of the house, one square per origin' },
    { name: 'Single Origin', notes: ['fruity', 'roasted'], blurb: 'the origin shelf, tasted side by side' },
    { name: 'Truffle', notes: ['caramel', 'creamy'], blurb: 'the full truffle counter in one case' },
    { name: 'Dark Devotee', notes: ['roasted'], blurb: 'nothing under seventy per cent' },
    { name: 'Celebration', notes: ['caramel', 'creamy'], blurb: 'the boxes we send when something has gone right' },
    { name: 'Festive', notes: ['spiced', 'nutty'], blurb: 'spiced bars and gilded truffles for the season' },
    { name: 'Midnight', notes: ['roasted', 'spiced'], blurb: 'the darkest bars we temper, boxed in black' },
    { name: 'Patisserie', notes: ['creamy', 'caramel'], blurb: 'the pastry kitchen, set in chocolate' },
    { name: 'Nut Lover', notes: ['nutty'], blurb: 'praline, gianduja and every nut we roast' },
    { name: 'Citrus Grove', notes: ['citrus', 'fruity'], blurb: 'peel, zest and oil from a season of citrus' },
    { name: 'Spice Route', notes: ['spiced'], blurb: 'cardamom, clove and long pepper, bar by bar' },
    { name: 'Vegan', notes: ['fruity', 'roasted'], blurb: 'the dairy-free shelf, and none the poorer for it' },
    { name: 'Wedding', notes: ['floral', 'creamy'], blurb: 'gilded almonds and rose truffles for the table' },
    { name: 'Diwali', notes: ['spiced', 'nutty'], blurb: 'cardamom, cashew and saffron, boxed in gold' },
    { name: 'Tasting Flight', notes: ['fruity', 'roasted'], blurb: 'five origins at a single strength, to taste the terroir' },
];

const BOX_SIZES = [
    { label: 'Petit', pieces: 6, multiplier: 1 },
    { label: 'Classic', pieces: 12, multiplier: 1.8 },
    { label: 'Grand', pieces: 24, multiplier: 3.2 },
    { label: 'Maison', pieces: 36, multiplier: 4.6 },
];

const IMAGES: Record<string, string[]> = {
    dark: ['/assets/product1.jpg', '/assets/chocolate.jpg', '/assets/choco-bg.jpg'],
    milk: ['/assets/product2.jpg', '/assets/1720608785720.jpg'],
    white: ['/assets/product3.jpg', '/assets/1721119564567.jpg'],
    truffle: ['/assets/1720707243058.jpg', '/assets/product2.jpg'],
    'gift-box': ['/assets/chocolate.jpg', '/assets/product3.jpg'],
};

const WEIGHTS = [45, 70, 85, 100, 120];

type Chocolate = {
    name: string;
    description: string;
    price: number;
    category: string;
    cocoaPercent: number | null;
    flavourNotes: Note[];
    origin: string | null;
    weightGrams: number;
    vegan: boolean;
    glutenFree: boolean;
    slug: string;
    image: string;
};

const slugify = (value: string) =>
    value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

/** Deterministic Fisher–Yates, so category mixes are varied but reproducible. */
function shuffled<T>(items: T[], seed: number): T[] {
    const random = rng(seed);
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

const unique = (notes: Note[]): Note[] => [...new Set(notes)];

/** Bars: one per origin × strength × inclusion, priced off cocoa and weight. */
function bars(category: 'dark' | 'milk' | 'white', cocoaLevels: number[]): Chocolate[] {
    const out: Chocolate[] = [];
    const random = rng(category.length * 7919);

    for (const origin of ORIGINS) {
        for (const cocoa of cocoaLevels) {
            for (const inclusion of INCLUSIONS[category]) {
                const label =
                    category === 'white'
                        ? `${cocoa}% White ${origin.name}`
                        : `${cocoa}% ${category === 'dark' ? 'Dark' : 'Milk'} ${origin.name}`;
                const name = inclusion.name ? `${label} with ${inclusion.name}` : label;
                const weight = WEIGHTS[Math.floor(random() * WEIGHTS.length)];

                // Price tracks what actually drives cost: cacao share and mass.
                const base = category === 'dark' ? 300 : category === 'milk' ? 280 : 320;
                const price =
                    Math.round(
                        (base + cocoa * 2.2 + weight * 1.4 + inclusion.premium) / 5
                    ) * 5;

                out.push({
                    name,
                    description: `Single origin cacao from ${origin.name}, conched for seventy-two hours and tempered in small batches. Tastes of ${origin.blurb}${
                        inclusion.name ? `, finished with ${inclusion.name.toLowerCase()}` : ''
                    }.`,
                    price,
                    category,
                    cocoaPercent: cocoa,
                    flavourNotes: unique([
                        ...origin.notes,
                        ...inclusion.notes,
                        ...(category === 'milk' || category === 'white' ? (['creamy'] as Note[]) : []),
                    ]),
                    origin: origin.name,
                    weightGrams: weight,
                    // Milk and white carry dairy; dark is vegan unless it does not.
                    vegan: category === 'dark' && !/Malted|Cookie/.test(inclusion.name),
                    glutenFree: !/Cookie|Toasted Rice|Malted/.test(inclusion.name),
                    slug: slugify(name),
                    image: IMAGES[category][out.length % IMAGES[category].length],
                });
            }
        }
    }

    return out;
}

function truffles(): Chocolate[] {
    const out: Chocolate[] = [];
    const random = rng(4241);

    for (const flavour of TRUFFLE_FLAVOURS) {
        for (const count of TRUFFLE_COUNTS) {
            const name = `${flavour.name} Truffles · Box of ${count}`;
            const cocoa = 45 + Math.floor(random() * 25);

            out.push({
                name,
                description: `Hand-rolled the morning they ship — ${flavour.blurb}. ${count} pieces to a case, packed in a ribboned box.`,
                price: Math.round((180 + count * 46) / 5) * 5,
                category: 'truffle',
                cocoaPercent: cocoa,
                flavourNotes: unique([...flavour.notes, 'creamy']),
                origin: null,
                weightGrams: count * 12,
                vegan: false,
                glutenFree: !/Marzipan/.test(flavour.name),
                slug: slugify(name),
                image: IMAGES.truffle[out.length % IMAGES.truffle.length],
            });
        }
    }

    return out;
}

function giftBoxes(): Chocolate[] {
    const out: Chocolate[] = [];

    for (const theme of BOX_THEMES) {
        for (const size of BOX_SIZES) {
            const name = `The ${theme.name} Box · ${size.label}`;

            out.push({
                name,
                description: `${theme.blurb.charAt(0).toUpperCase()}${theme.blurb.slice(1)}. ${size.pieces} pieces, presented in a linen-wrapped case with a tasting card.`,
                price: Math.round((640 * size.multiplier) / 10) * 10,
                category: 'gift-box',
                // A mixed box has no single cocoa percentage to quote.
                cocoaPercent: null,
                flavourNotes: unique(theme.notes),
                origin: null,
                weightGrams: size.pieces * 14,
                vegan: false,
                glutenFree: false,
                slug: slugify(name),
                image: IMAGES['gift-box'][out.length % IMAGES['gift-box'].length],
            });
        }
    }

    return out;
}

/** Roughly the share of a real chocolatier's shelf each type takes up. */
const TARGETS: Record<string, number> = {
    dark: 22,
    milk: 14,
    white: 7,
    truffle: 8,
    'gift-box': 5,
};

const pools: Record<string, Chocolate[]> = {
    dark: bars('dark', [55, 62, 66, 70, 72, 75, 78, 82, 85, 88, 90]),
    milk: bars('milk', [34, 38, 42, 45, 50]),
    white: bars('white', [28, 30, 33, 35]),
    truffle: truffles(),
    'gift-box': giftBoxes(),
};

const catalogue: Chocolate[] = [];
const seen = new Set<string>();

for (const category of PRODUCT_CATEGORIES) {
    const pool = shuffled(pools[category], category.length * 104729 + 17);
    let taken = 0;

    for (const item of pool) {
        if (taken >= TARGETS[category]) break;
        // `name` is the seed's identity key and the table's practical unique
        // key, so a collision has to be dropped rather than silently inserted.
        if (seen.has(item.name)) continue;
        seen.add(item.name);
        catalogue.push(item);
        taken += 1;
    }

    if (taken < TARGETS[category]) {
        console.warn(`⚠ ${category}: only ${taken} of ${TARGETS[category]} available`);
    }
}

// Interleaved rather than grouped, so the default "featured" order and any
// unfiltered page show a mix of types instead of four hundred dark bars.
const ordered = shuffled(catalogue, 20260808);

const target = join(import.meta.dirname, '..', 'src', 'data', 'chocolates.json');
writeFileSync(target, `${JSON.stringify(ordered, null, 2)}\n`);

const byCategory = ordered.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] ?? 0) + 1;
    return acc;
}, {});

console.log(`✅ wrote ${ordered.length} chocolates to src/data/chocolates.json`);
console.table(byCategory);
