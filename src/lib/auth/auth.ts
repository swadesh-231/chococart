import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { nextCookies } from 'better-auth/next-js';
import { db } from '@/db/db';
import { authSchema } from '@/db/schema/auth-schema';
import { linkAppUser } from './app-user';

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

/**
 * Registered only when both credentials exist. Handing better-auth an
 * undefined clientId makes the whole sign-in endpoint throw a 500; leaving the
 * provider out instead produces a clean "provider not found" the UI can show.
 */
export const isGoogleEnabled = Boolean(googleClientId && googleClientSecret);

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: 'pg',
        schema: authSchema,
    }),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL ?? process.env.APP_BASE_URL,
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: isGoogleEnabled
        ? {
              google: {
                  clientId: googleClientId as string,
                  clientSecret: googleClientSecret as string,
              },
          }
        : {},
    databaseHooks: {
        user: {
            create: {
                // Mirror every new account into the app's `users` table right
                // away, so `orders.userId` has something to point at.
                after: async (user) => {
                    await linkAppUser(user);
                },
            },
        },
    },
    // Must be last: lets better-auth set cookies from server actions / route handlers.
    plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
