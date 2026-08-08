import { z } from 'zod';

const credentials = {
    email: z.email({ message: 'Enter a valid email address' }),
    password: z.string().min(8, 'Password should be at least 8 chars long'),
};

/** Sign-in does not collect a name, so it stays optional in that mode. */
export const signInSchema = z.object({
    ...credentials,
    name: z.string().optional(),
});

export const signUpSchema = z.object({
    ...credentials,
    name: z.string().min(2, 'Name should be at least 2 chars long'),
});

export type AuthFormValues = z.infer<typeof signInSchema>;
