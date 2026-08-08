import { z } from 'zod';

import { PRODUCT_CATEGORIES } from '@/lib/categories';

const productFields = {
    name: z.string({ message: 'Product name should be a string' }).min(4),
    description: z.string({ message: 'Product description should be a string' }).min(8),
    price: z.number({ message: 'Product price should be a number' }).int().positive(),
    category: z.enum(PRODUCT_CATEGORIES, { message: 'Pick a chocolate type' }),
};

/**
 * What the API receives. The browser uploads the file straight to ImageKit and
 * sends back the hosted URL, so the server never handles the binary.
 */
export const productApiSchema = z.object({
    ...productFields,
    image: z.url({ message: 'Product image should be an uploaded image URL' }),
});

/** What the admin form holds — an `<input type="file">` gives a FileList. */
export const productFormSchema = z.object({
    ...productFields,
    image: z
        .custom<FileList>((value) => typeof FileList !== 'undefined' && value instanceof FileList, {
            message: 'Product image should be an image',
        })
        .refine((files) => files.length > 0, { message: 'Product image is required' })
        .refine((files) => files[0]?.type.startsWith('image/'), {
            message: 'That file is not an image',
        }),
});

export const productSchema = productFormSchema;

export type ProductApiValues = z.infer<typeof productApiSchema>;
export type ProductFormValues = z.input<typeof productFormSchema>;
