// One-time helper: converts the old site's heavy images into web-sized assets.
// Run:  node scripts/optimize-source-images.mjs "<folder with old-site-assets>"
// Output goes to src/assets/img/ (already committed; re-run only if you replace originals).
import sharp from "sharp";
import { mkdir, copyFile, stat } from "node:fs/promises";
import path from "node:path";

const srcDir = process.argv[2] || "old-site-assets";
const out = path.resolve("src/assets/img");
const fonts = path.resolve("src/assets/fonts");
await mkdir(out, { recursive: true });
await mkdir(fonts, { recursive: true });

const kb = async (p) => Math.round((await stat(p)).size / 1024);
const log = async (name, p) => console.log(`${name.padEnd(28)} ${String(await kb(p)).padStart(5)} KB`);

// Hero / carousel photos: real JPEGs at 1920 and 960 wide.
for (let i = 1; i <= 5; i++) {
  const input = path.join(srcDir, `carousel${i}.jpg`);
  const img = sharp(input).flatten({ background: "#fdfbd4" });
  const big = path.join(out, `hero-${i}.jpg`);
  const small = path.join(out, `hero-${i}-960.jpg`);
  await img.clone().resize({ width: 1920 }).jpeg({ quality: 78, progressive: true, mozjpeg: true }).toFile(big);
  await img.clone().resize({ width: 960 }).jpeg({ quality: 74, progressive: true, mozjpeg: true }).toFile(small);
  await log(`hero-${i}.jpg`, big);
  await log(`hero-${i}-960.jpg`, small);
}

// Deity images (oval PNGs with transparency): keep PNG, palette-compress, and make 2x versions.
const deities = {
  siddhivinayak: "siddhivinayak.png",
  hanuman: "hanuman.png",
  durga: "durga.png",
  "ram-parivar": "ramparivar.png",
  "ambe-maa": "durga2.png",
};
for (const [name, file] of Object.entries(deities)) {
  const p = path.join(out, `deity-${name}.png`);
  await sharp(path.join(srcDir, file)).png({ palette: true, quality: 90, compressionLevel: 9 }).toFile(p);
  await log(`deity-${name}.png`, p);
}

// Logo: PNG with transparency at 400px, plus a 96px favicon-sized PNG.
await sharp(path.join(srcDir, "logo.png")).resize({ width: 400 }).png({ palette: true, quality: 92, compressionLevel: 9 }).toFile(path.join(out, "logo.png"));
await log("logo.png", path.join(out, "logo.png"));
await sharp(path.join(srcDir, "logo.png")).resize({ width: 192 }).png({ palette: true, quality: 90 }).toFile(path.join(out, "logo-192.png"));
await copyFile(path.join(srcDir, "favicon.ico"), path.join(out, "favicon.ico"));

// Priest photo.
await sharp(path.join(srcDir, "sagar3.jpeg")).resize({ width: 800 }).jpeg({ quality: 80, mozjpeg: true }).toFile(path.join(out, "priest-sagar-pandya.jpg"));
await log("priest-sagar-pandya.jpg", path.join(out, "priest-sagar-pandya.jpg"));

// Zelle QR (placeholder until the temple supplies final codes). Keep crisp: PNG, 600px.
await sharp(path.join(srcDir, "zelle.png")).resize({ width: 600 }).png({ palette: true, quality: 80, compressionLevel: 9 }).toFile(path.join(out, "zelle-qr.png"));
await log("zelle-qr.png", path.join(out, "zelle-qr.png"));

// Background patterns: the cream damask tiles seamlessly at 1080px; a 540px tile at JPEG quality is plenty.
await sharp(path.join(srcDir, "bg.png")).flatten({ background: "#fdfbd4" }).resize({ width: 540 }).jpeg({ quality: 70, mozjpeg: true }).toFile(path.join(out, "pattern-cream.jpg"));
await log("pattern-cream.jpg", path.join(out, "pattern-cream.jpg"));
await sharp(path.join(srcDir, "red_bg.png")).flatten({ background: "#7f1d1d" }).resize({ width: 1124 }).jpeg({ quality: 72, mozjpeg: true }).toFile(path.join(out, "pattern-red.jpg"));
await log("pattern-red.jpg", path.join(out, "pattern-red.jpg"));

// Fonts: woff is enough for every current browser; keep ttf as a fallback.
for (const f of ["SamarkanNormal.woff", "SamarkanNormal.ttf"]) {
  await copyFile(path.join(srcDir, f), path.join(fonts, f));
}
console.log("done");
