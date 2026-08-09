import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import sharp from 'sharp';

/**
 * Renders the browser and home-screen icons from `src/app/icon.svg`, so the
 * mark only ever has to be drawn once.
 *
 * `icon.svg` is what modern browsers actually use; `favicon.ico` is the
 * fallback they probe for at the site root, and Safari on iOS wants a square
 * PNG it can mask itself. Run `bun run icons` after editing the mark.
 */
const appDir = join(import.meta.dirname, '..', 'src', 'app');
const source = readFileSync(join(appDir, 'icon.svg'));

/** Sizes to pack into the .ico, smallest first. */
const ICO_SIZES = [16, 32, 48];

const render = (size: number, svg: Buffer = source) =>
    sharp(svg, { density: 384 }).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

/**
 * Packs PNGs into an .ico. Every icon directory entry is 16 bytes, and the
 * payload may be a PNG rather than a BMP for anything past Windows Vista —
 * which is every browser that still asks for this file.
 */
function packIco(images: { size: number; png: Buffer }[]): Buffer {
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0); // reserved
    header.writeUInt16LE(1, 2); // 1 = icon
    header.writeUInt16LE(images.length, 4);

    const directory = Buffer.alloc(16 * images.length);
    let offset = header.length + directory.length;

    images.forEach((image, index) => {
        const at = index * 16;
        // 0 means 256 in this field; nothing here is that large.
        directory.writeUInt8(image.size >= 256 ? 0 : image.size, at);
        directory.writeUInt8(image.size >= 256 ? 0 : image.size, at + 1);
        directory.writeUInt8(0, at + 2); // palette size
        directory.writeUInt8(0, at + 3); // reserved
        directory.writeUInt16LE(1, at + 4); // colour planes
        directory.writeUInt16LE(32, at + 6); // bits per pixel
        directory.writeUInt32LE(image.png.length, at + 8);
        directory.writeUInt32LE(offset, at + 12);
        offset += image.png.length;
    });

    return Buffer.concat([header, directory, ...images.map((image) => image.png)]);
}

const ico = packIco(
    await Promise.all(ICO_SIZES.map(async (size) => ({ size, png: await render(size) })))
);
writeFileSync(join(appDir, 'favicon.ico'), ico);
console.log(`favicon.ico    ${ICO_SIZES.join(', ')}px · ${(ico.length / 1024).toFixed(1)} kB`);

// iOS applies its own rounded mask, so the touch icon is drawn square and
// full-bleed — corners rounded twice look pinched on the home screen.
const appleSvg = Buffer.from(
    source.toString().replace('<rect width="32" height="32" rx="6"', '<rect width="32" height="32"')
);
const apple = await render(180, appleSvg);
writeFileSync(join(appDir, 'apple-icon.png'), apple);
console.log(`apple-icon.png 180px · ${(apple.length / 1024).toFixed(1)} kB`);
