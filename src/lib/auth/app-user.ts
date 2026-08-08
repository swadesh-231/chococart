import { desc, eq } from 'drizzle-orm';
import { db } from '@/db/db';
import { account } from '@/db/schema/auth-schema';
import { users } from '@/db/schema/schema';

export type AppUser = typeof users.$inferSelect;

function splitName(name: string) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return {
        fname: parts[0] ?? 'User',
        lname: parts.slice(1).join(' ') || '-',
    };
}

/**
 * better-auth owns the `user` table; the application owns `users`, which every
 * business table (orders, ...) points at. This links the two, creating the app
 * row the first time it is needed.
 *
 * Called from a better-auth create hook at sign-up, and lazily by getAppUser()
 * for accounts that predate the hook.
 */
export async function linkAppUser(authUser: {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
}): Promise<AppUser> {
    const existing = await db
        .select()
        .from(users)
        .where(eq(users.externalId, authUser.id))
        .limit(1);

    if (existing.length) return existing[0];

    const [linkedAccount] = await db
        .select({ providerId: account.providerId })
        .from(account)
        .where(eq(account.userId, authUser.id))
        .orderBy(desc(account.createdAt))
        .limit(1);

    const { fname, lname } = splitName(authUser.name || authUser.email);

    // Conflict target is `email` so an account created before this bridge
    // existed is adopted rather than duplicated.
    const [appUser] = await db
        .insert(users)
        .values({
            fname,
            lname,
            email: authUser.email,
            image: authUser.image ?? null,
            provider: linkedAccount?.providerId ?? 'credential',
            externalId: authUser.id,
        })
        .onConflictDoUpdate({
            target: users.email,
            set: {
                externalId: authUser.id,
                image: authUser.image ?? null,
                updatedAt: new Date(),
            },
        })
        .returning();

    return appUser;
}
