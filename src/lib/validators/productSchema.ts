import { z } from 'zod';

import { COCOA_RANGE, FLAVOUR_NOTES, PRODUCT_CATEGORIES } from '@/lib/categories';

const productFields = {
    name: z.string({ message: 'Product name should be a string' }).min(4).max(100),
    description: z.string({ message: 'Product description should be a string' }).min(8),
    price: z.number({ message: 'Product price should be a number' }).int().positive(),
    category: z.enum(PRODUCT_CATEGORIES, { message: 'Pick a chocolate type' }),
};

/**
 * The tasting detail the shop's filter rail queries on. All optional: a
 * chocolate can be listed without them, it just won't answer those filters.
 */
const tastingFields = {
    cocoaPercent: z
        .number()
        .int()
        .min(COCOA_RANGE.min, `Cocoa should be at least ${COCOA_RANGE.min}%`)
        .max(COCOA_RANGE.max, `Cocoa cannot exceed ${COCOA_RANGE.max}%`)
        .nullish(),
    flavourNotes: z.array(z.enum(FLAVOUR_NOTES)).nullish(),
    origin: z.string().max(60).nullish(),
    weightGrams: z.number().int().positive().nullish(),
    vegan: z.boolean().optional(),
    glutenFree: z.boolean().optional(),
};

/**
 * What the API receives. The browser uploads the file straight to ImageKit and
 * sends back the hosted URL, so the server never handles the binary — but an
 * absolute URL typed in by hand is equally valid, which is what keeps the admin
 * panel usable on an install with no ImageKit credentials.
 */
export const productApiSchema = z.object({
    ...productFields,
    ...tastingFields,
    image: z.url({ message: 'Product image should be an image URL' }),
});

const fileList = z.custom<FileList>(
    (value) => typeof FileList !== 'undefined' && value instanceof FileList
);

/**
 * What the admin form holds. The picture can arrive either way — an
 * `<input type="file">` gives a FileList, or the URL field takes a link to an
 * image already hosted somewhere. Exactly one of them has to be filled in.
 */
export const productFormSchema = z
    .object({
        ...productFields,
        ...tastingFields,
        image: fileList.optional(),
        imageUrl: z.string().trim().optional(),
    })
    .superRefine((values, ctx) => {
        const hasFile = (values.image?.length ?? 0) > 0;
        const hasUrl = Boolean(values.imageUrl);

        if (!hasFile && !hasUrl) {
            ctx.addIssue({
                code: 'custom',
                path: ['image'],
                message: 'Upload an image or paste an image URL',
            });
            return;
        }

        if (hasFile && !values.image![0]?.type.startsWith('image/')) {
            ctx.addIssue({ code: 'custom', path: ['image'], message: 'That file is not an image' });
        }

        if (!hasFile && hasUrl && !z.url().safeParse(values.imageUrl).success) {
            ctx.addIssue({
                code: 'custom',
                path: ['imageUrl'],
                message: 'That is not a valid URL',
            });
        }
    });

export const productSchema = productFormSchema;

export type ProductApiValues = z.infer<typeof productApiSchema>;
export type ProductFormValues = z.input<typeof productFormSchema>;
