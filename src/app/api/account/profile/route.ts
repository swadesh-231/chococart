import { eq } from 'drizzle-orm';
import { db } from '@/db/db';
import { user as authUser } from '@/db/schema/auth-schema';
import { users } from '@/db/schema/schema';
import { requireUser } from '@/lib/auth/session';
import { profileSchema } from '@/lib/validators/profileSchema';
import type { Profile } from '@/types';

function toProfile(row: typeof users.$inferSelect): Profile {
    return {
        fname: row.fname,
        lname: row.lname,
        email: row.email,
        address: row.address,
        image: row.image,
        role: row.role,
        createdAt: row.createdAt ? row.createdAt.toISOString() : null,
    };
}

export async function GET() {
    const appUser = await requireUser();
    if (appUser instanceof Response) return appUser;

    return Response.json(toProfile(appUser));
}

/**
 * Updates the parts of an account its owner is allowed to change: their name,
 * their default delivery address and their picture. Email is never touched —
 * it is the identity better-auth authenticates against.
 */
export async function PATCH(request: Request) {
    const appUser = await requireUser();
    if (appUser instanceof Response) return appUser;

    const parsed = profileSchema.safeParse(await request.json().catch(() => null));

    if (!parsed.success) {
        return Response.json({ message: parsed.error.issues[0].message }, { status: 400 });
    }

    const { fname, lname, address, image } = parsed.data;
    // An empty address box means "forget the one I had", not "leave it alone".
    const nextAddress = address?.trim() ? address.trim() : null;
    const nextImage = image === undefined ? appUser.image : image;

    try {
        const [updated] = await db
            .update(users)
            .set({
                fname,
                lname,
                address: nextAddress,
                image: nextImage,
                updatedAt: new Date(),
            })
            .where(eq(users.id, appUser.id))
            .returning();

        // Mirror onto the better-auth row so the session — and therefore the
        // header avatar — shows the same name and picture.
        await db
            .update(authUser)
            .set({ name: `${fname} ${lname}`.trim(), image: nextImage, updatedAt: new Date() })
            .where(eq(authUser.id, appUser.externalId));

        return Response.json(toProfile(updated));
    } catch (err) {
        console.error('PATCH /api/account/profile', err);
        return Response.json({ message: 'Could not save your profile' }, { status: 500 });
    }
}
