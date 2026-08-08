import { z } from 'zod';

export const newsletterSchema = z.object({
    email: z
        .email({ message: 'Enter a valid email address' })
        .max(254, 'That email address is too long'),
});

export type NewsletterFormValues = z.infer<typeof newsletterSchema>;
