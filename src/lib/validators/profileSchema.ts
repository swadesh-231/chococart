import { z } from 'zod';
import { addressSchema } from './orderSchema';

/**
 * `lname` is NOT NULL in the database and social sign-ins that supply a single
 * name land there as "-", so one character has to be enough to re-save.
 */
const nameSchema = (label: string, min: number) =>
    z
        .string({ message: `${label} is required` })
        .trim()
        .min(min, `${label} should be at least ${min} character${min === 1 ? '' : 's'}`)
        .max(100, `${label} cannot be longer than 100 characters`);

/**
 * What the profile form holds and what `PATCH /api/account/profile` accepts.
 *
 * Email is deliberately absent: it is the identity better-auth signs people in
 * with, so it is shown read-only and can never be edited from here. The address
 * is optional — an account is perfectly valid without one saved.
 */
export const profileSchema = z.object({
    fname: nameSchema('First name', 2),
    lname: nameSchema('Last name', 1),
    address: z.union([addressSchema, z.literal('')]).optional(),
    image: z.union([z.url({ message: 'Image should be an uploaded image URL' }), z.null()]).optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

/** Avatars pass through the server, so keep them small enough for one request. */
export const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
