import { getUploadAuthParams } from '@imagekit/next/server';
import { requireAdmin } from '@/lib/auth/session';

/**
 * Hands the browser short-lived upload credentials. Admin-only: anyone with
 * these params can upload to the ImageKit account until they expire.
 * The private key never leaves the server.
 */
export async function GET() {
    const admin = await requireAdmin();
    if (admin instanceof Response) return admin;

    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;

    if (!privateKey || !publicKey) {
        console.error('IMAGEKIT_PRIVATE_KEY / NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY are not set');
        return Response.json({ message: 'Image uploads are not configured' }, { status: 500 });
    }

    try {
        const { token, expire, signature } = getUploadAuthParams({ privateKey, publicKey });
        return Response.json({ token, expire, signature, publicKey });
    } catch (err) {
        console.error('GET /api/imagekit/auth', err);
        return Response.json({ message: 'Could not authorise the upload' }, { status: 500 });
    }
}
