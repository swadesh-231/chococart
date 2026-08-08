/**
 * Server-side ImageKit uploads.
 *
 * Product images go straight from the admin's browser to ImageKit using a
 * short-lived token (see `lib/imagekit.ts`). That is fine for admins, but those
 * tokens are not scoped to a folder — handing one to every signed-in customer
 * would let any of them write anywhere in the account, product images included.
 * Customer avatars therefore pass through this route instead, where the server
 * fixes the folder and the private key never leaves the machine.
 */
const UPLOAD_ENDPOINT = 'https://upload.imagekit.io/api/v1/files/upload';

export class ImageKitNotConfiguredError extends Error {
    constructor() {
        super('IMAGEKIT_PRIVATE_KEY is not set');
        this.name = 'ImageKitNotConfiguredError';
    }
}

export async function uploadToImageKit({
    file,
    fileName,
    folder,
}: {
    file: File;
    fileName: string;
    folder: string;
}): Promise<string> {
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    if (!privateKey) throw new ImageKitNotConfiguredError();

    const form = new FormData();
    form.append('file', file, fileName);
    form.append('fileName', fileName);
    form.append('folder', folder);
    form.append('useUniqueFileName', 'true');

    const response = await fetch(UPLOAD_ENDPOINT, {
        method: 'POST',
        // ImageKit takes the private key as the Basic-auth username, no password.
        headers: { Authorization: `Basic ${Buffer.from(`${privateKey}:`).toString('base64')}` },
        body: form,
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
        const message =
            payload && typeof payload === 'object' && 'message' in payload
                ? String(payload.message)
                : `ImageKit responded ${response.status}`;
        throw new Error(message);
    }

    if (!payload || typeof payload.url !== 'string') {
        throw new Error('ImageKit did not return a URL for the upload');
    }

    return payload.url;
}
