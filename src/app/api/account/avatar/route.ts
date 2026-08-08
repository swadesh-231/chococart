import { requireUser } from '@/lib/auth/session';
import { ImageKitNotConfiguredError, uploadToImageKit } from '@/lib/imagekit-server';
import { MAX_AVATAR_BYTES } from '@/lib/validators/profileSchema';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];

/**
 * Takes the picture a customer picked and stores it on ImageKit, returning the
 * hosted URL for the profile form to save. Nothing is written to the database
 * here — the URL only sticks once the profile itself is saved.
 */
export async function POST(request: Request) {
    const appUser = await requireUser();
    if (appUser instanceof Response) return appUser;

    const form = await request.formData().catch(() => null);
    const file = form?.get('file');

    if (!(file instanceof File) || file.size === 0) {
        return Response.json({ message: 'Choose an image to upload' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
        return Response.json({ message: 'That file is not an image' }, { status: 400 });
    }

    if (file.size > MAX_AVATAR_BYTES) {
        return Response.json(
            { message: `Pictures must be under ${MAX_AVATAR_BYTES / (1024 * 1024)}MB` },
            { status: 413 }
        );
    }

    try {
        const url = await uploadToImageKit({
            file,
            // ImageKit adds its own suffix, so this only has to be recognisable.
            fileName: `user-${appUser.id}`,
            folder: '/chococart/avatars',
        });

        return Response.json({ url });
    } catch (err) {
        if (err instanceof ImageKitNotConfiguredError) {
            console.error('POST /api/account/avatar', err);
            return Response.json(
                { message: 'Image uploads are not configured' },
                { status: 500 }
            );
        }

        console.error('POST /api/account/avatar', err);
        return Response.json({ message: 'Could not upload your picture' }, { status: 500 });
    }
}
