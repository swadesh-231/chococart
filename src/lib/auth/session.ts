import { headers } from 'next/headers';
import { auth } from './auth';
import { linkAppUser, type AppUser } from './app-user';

export type { AppUser };

/** The raw better-auth session, or null when signed out. */
export async function getSession() {
    return auth.api.getSession({ headers: await headers() });
}

/** Resolves the signed-in better-auth account to its row in `users`. */
export async function getAppUser(): Promise<AppUser | null> {
    const session = await getSession();
    if (!session) return null;

    return linkAppUser(session.user);
}

/** Returns the app user, or a 401/403 Response when not allowed. */
export async function requireUser(): Promise<AppUser | Response> {
    const appUser = await getAppUser();
    if (!appUser) {
        return Response.json({ message: 'Not allowed' }, { status: 401 });
    }
    return appUser;
}

export async function requireAdmin(): Promise<AppUser | Response> {
    const result = await requireUser();
    if (result instanceof Response) return result;
    if (result.role !== 'admin') {
        return Response.json({ message: 'Not allowed' }, { status: 403 });
    }
    return result;
}
