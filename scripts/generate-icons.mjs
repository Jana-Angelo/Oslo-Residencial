// Generates the PWA app icons from the official artwork (iconeoficialpwa.png).
// Falls back to a procedural brand mark if the source file is missing.
//
// Usage: node scripts/generate-icons.mjs
import {existsSync, writeFileSync, mkdirSync} from 'node:fs';
import {deflateSync} from 'node:zlib';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'public', 'icons');
const SOURCE = join(ROOT, 'iconeoficialpwa.png');

const BG = [0, 48, 73].join(', '); // #003049

const CREAM = '#FFFFFF';
const RADIUS_RATIO = 0.225;

async function svgCanvas(size, radius) {
  return Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
       <rect width="100%" height="100%" rx="${radius}" fill="${CREAM}"/>
     </svg>`
  );
}

async function compose(size, radius, contentSize) {
  // Artwork is a stroke logo on a transparent background — keep the whole
  // (portrait) logo, letterboxed inside the content box, over the brand cream.
  const content = await sharp(SOURCE)
    .resize(contentSize, contentSize, {fit: 'contain', background: {r: 0, g: 0, b: 0, alpha: 0}})
    .png()
    .toBuffer();
  const canvas = await svgCanvas(size, radius); // rx=0 → full square

  return sharp(canvas)
    .composite([{input: content, gravity: 'center'}])
    .png()
    .toBuffer();
}

async function generateFromOfficial() {
  // 'any' icons: rounded corners on the brand cream background.
  writeFileSync(
    join(OUT_DIR, 'icon-192.png'),
    await compose(192, Math.round(192 * RADIUS_RATIO), 154)
  );
  writeFileSync(
    join(OUT_DIR, 'icon-512.png'),
    await compose(512, Math.round(512 * RADIUS_RATIO), 410)
  );

  // maskable: full-bleed opaque square, content centered inside the safe zone (~80%).
  writeFileSync(join(OUT_DIR, 'icon-512-maskable.png'), await compose(512, 0, 410));

  // apple-touch-icon: rounded corners (iOS keeps the transparency exposed).
  writeFileSync(join(OUT_DIR, 'apple-touch-icon.png'), await compose(180, Math.round(180 * RADIUS_RATIO), 144));

  console.log('icons generated from official artwork (sharp).');
}

// ---------------------------------------------------------------------------
// Procedural fallback (private): simple PNG encoder + rounded-square brand mark.
// Kept so the repo stays functional if the source artwork is ever removed.
// ---------------------------------------------------------------------------

const crcTable = (() => {
  const t = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePNG(size, px) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    px.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

function inRoundRect(x, y, x0, y0, x1, y1, r) {
  if (x < x0 || x > x1 || y < y0 || y > y1) return false;
  const cx = x < x0 + r ? x0 + r : x > x1 - r ? x1 - r : x;
  const cy = y < y0 + r ? y0 + r : y > y1 - r ? y1 - r : y;
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= r * r;
}

function render(size, round) {
  const px = Buffer.alloc(size * size * 4);
  const cream = [250, 237, 205];
  const tan = [140, 115, 100];
  const bg = [0, 48, 73];
  const ringOuter = size * 0.23;
  const ringInner = ringOuter - size * 0.062;
  const barY0 = size * 0.585;
  const barY1 = size * 0.665;
  const barR = size * 0.014;
  const cornerR = size * 0.225;
  const cx = size / 2;
  const cy = size / 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      if (round && !inRoundRect(x, y, 0, 0, size - 1, size - 1, cornerR)) continue;
      let col = bg;
      const d = Math.hypot(x - cx, y - cy);
      if (d <= ringOuter && d >= ringInner) col = cream;
      if (inRoundRect(x, y, size * 0.24, barY0, size * 0.76, barY1, barR)) col = tan;
      px[i] = col[0];
      px[i + 1] = col[1];
      px[i + 2] = col[2];
      px[i + 3] = 255;
    }
  }
  return encodePNG(size, px);
}

function generateProcedural() {
  const targets = [
    ['icon-192.png', 192, true],
    ['icon-512.png', 512, true],
    ['icon-512-maskable.png', 512, false],
    ['apple-touch-icon.png', 180, false],
  ];
  for (const [name, size, round] of targets) {
    writeFileSync(join(OUT_DIR, name), render(size, round));
  }
  console.log('icons generated from procedural fallback.');
}

mkdirSync(OUT_DIR, {recursive: true});
if (existsSync(SOURCE)) {
  await generateFromOfficial();
} else {
  generateProcedural();
  console.log(`(source artwork not found at ${SOURCE} — using fallback)`);
}