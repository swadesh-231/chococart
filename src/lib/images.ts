/**
 * Product images come from two eras: legacy uploads stored as a bare filename
 * under /public/assets, and ImageKit uploads stored as an absolute URL.
 */
export function productImageSrc(
    image: string | null | undefined,
    fallback = '/assets/product1.jpg'
): string {
    if (!image) return fallback;
    if (image.startsWith('http://') || image.startsWith('https://')) return image;
    if (image.startsWith('/')) return image;
    return `/assets/${image}`;
}
