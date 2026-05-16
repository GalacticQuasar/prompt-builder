import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const iconsDir = join(publicDir, 'icons');

const sizes = [
  { name: 'icon-192.png', width: 192, height: 192, input: 'icon.svg' },
  { name: 'icon-512.png', width: 512, height: 512, input: 'icon.svg' },
  { name: 'icon-maskable-512.png', width: 512, height: 512, input: 'icon-maskable.svg' },
];

for (const { name, width, height, input } of sizes) {
  const inputPath = join(publicDir, input);
  const outputPath = join(iconsDir, name);
  await sharp(inputPath)
    .resize(width, height)
    .png()
    .toFile(outputPath);
  console.log(`Generated ${name} (${width}x${height})`);
}

console.log('All icons generated!');