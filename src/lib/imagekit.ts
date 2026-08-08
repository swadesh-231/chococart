import { upload } from '@imagekit/next';

export interface UploadAuth {
    token: string;
    expire: number;
    signature: string;
    publicKey: string;
}

async function getUploadAuth(): Promise<UploadAuth> {
    const response = await fetch('/api/imagekit/auth');

    if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(
            payload && typeof payload === 'object' && 'message' in payload
                ? String(payload.message)
                : 'Could not authorise the upload'
        );
    }

    return response.json();
}

/**
 * Uploads straight from the browser to ImageKit and returns the hosted URL.
 * Files never pass through the Next server, so this works on serverless hosts
 * where the filesystem is ephemeral.
 */
export async function uploadProductImage(
    file: File,
    onProgress?: (percent: number) => void
): Promise<string> {
    const auth = await getUploadAuth();

    const result = await upload({
        file,
        fileName: file.name,
        folder: '/chococart/products',
        useUniqueFileName: true,
        publicKey: auth.publicKey,
        token: auth.token,
        expire: auth.expire,
        signature: auth.signature,
        onProgress: (event) => {
            if (onProgress && event.total) {
                onProgress(Math.round((event.loaded / event.total) * 100));
            }
        },
    });

    if (!result.url) {
        throw new Error('ImageKit did not return a URL for the upload');
    }

    return result.url;
}
