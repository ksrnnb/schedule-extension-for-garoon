import * as path from 'path';
import * as fs from 'fs';
import sharp from 'sharp';

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src/icon/bell.svg');
const OUT = path.join(ROOT, 'public/icon');

const SIZES = [16, 32, 48, 128] as const;
const VARIANTS: ReadonlyArray<{ suffix: string; color: string }> = [
  { suffix: '', color: '#1B95D5' },
  { suffix: '-gray', color: '#93959C' },
];

async function main(): Promise<void> {
  const template = fs.readFileSync(SRC, 'utf8');
  fs.mkdirSync(OUT, { recursive: true });

  await Promise.all(
    VARIANTS.flatMap(({ suffix, color }) =>
      SIZES.map(async size => {
        const svg = template.replace(/currentColor/g, color);
        const file = path.join(OUT, `icon-${size}${suffix}.png`);
        await sharp(Buffer.from(svg), { density: size * 4 })
          .resize(size, size)
          .png()
          .toFile(file);
        console.info('wrote', path.relative(ROOT, file));
      }),
    ),
  );
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
