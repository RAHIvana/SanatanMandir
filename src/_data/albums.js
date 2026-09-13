// Builds the photo gallery from the /photos folder.
//
// HOW ALBUMS WORK
//   photos/
//     2026-10-navratri/          <- one folder per album (any name; keep it simple, no spaces)
//       album.json               <- optional: { "title": "Navratri 2026", "date": "2026-10-11", "description": "...", "cover": "IMG_0012.jpg" }
//       IMG_0001.jpg ...         <- photos straight from a phone/camera are fine (jpg, jpeg, png, webp, heic is NOT supported)
//
// At build time every photo is resized to a 1600px "web" copy and a 480px thumbnail inside _site/photos/<album>/.
// Originals in /photos are never modified. Nothing else needs to change for a new album to appear on the Gallery page.

import { readdir, readFile, stat, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const PHOTOS_DIR = path.resolve("photos");
const OUT_DIR = path.resolve("_site/photos");
const IMAGE_RE = /\.(jpe?g|png|webp)$/i;

const titleFromSlug = (slug) =>
  slug
    .replace(/^\d{4}-\d{2}(-\d{2})?-?/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim() || slug;

const dateFromSlug = (slug) => {
  const m = slug.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?/);
  return m ? `${m[1]}-${m[2]}-${m[3] || "01"}` : null;
};

async function isNewer(src, dest) {
  try {
    const [s, d] = await Promise.all([stat(src), stat(dest)]);
    return s.mtimeMs > d.mtimeMs;
  } catch {
    return true; // dest missing
  }
}

async function processPhoto(slug, file) {
  const src = path.join(PHOTOS_DIR, slug, file);
  const base = file.replace(/\.[^.]+$/, "").replace(/[^\w-]+/g, "_");
  const webDir = path.join(OUT_DIR, slug, "web");
  const thumbDir = path.join(OUT_DIR, slug, "thumbs");
  await mkdir(webDir, { recursive: true });
  await mkdir(thumbDir, { recursive: true });
  const web = path.join(webDir, `${base}.jpg`);
  const thumb = path.join(thumbDir, `${base}.jpg`);

  const image = sharp(src, { failOn: "none" }).rotate(); // .rotate() honours the phone's orientation tag
  const meta = await image.metadata();
  const rotated = (meta.orientation || 1) >= 5;
  const width = rotated ? meta.height : meta.width;
  const height = rotated ? meta.width : meta.height;

  if (await isNewer(src, web)) {
    await image.clone().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 80, progressive: true, mozjpeg: true }).toFile(web);
  }
  if (await isNewer(src, thumb)) {
    await image.clone().resize({ width: 480, height: 480, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 74, mozjpeg: true }).toFile(thumb);
  }
  const ratio = width && height ? width / height : 1.5;
  return {
    name: file,
    web: `photos/${slug}/web/${base}.jpg`,
    thumb: `photos/${slug}/thumbs/${base}.jpg`,
    width,
    height,
    ratio,
  };
}

export default async function () {
  let entries = [];
  try {
    entries = await readdir(PHOTOS_DIR, { withFileTypes: true });
  } catch {
    return [];
  }

  const albums = [];
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith(".") || entry.name.startsWith("_")) continue;
    const slug = entry.name;
    const dir = path.join(PHOTOS_DIR, slug);
    let meta = {};
    try {
      meta = JSON.parse(await readFile(path.join(dir, "album.json"), "utf8"));
    } catch {
      /* album.json is optional */
    }
    const files = (await readdir(dir)).filter((f) => IMAGE_RE.test(f) && !f.startsWith(".")).sort();
    if (files.length === 0) continue;

    const photos = [];
    for (const file of files) {
      try {
        photos.push(await processPhoto(slug, file));
      } catch (err) {
        console.warn(`[albums] skipped ${slug}/${file}: ${err.message}`);
      }
    }
    if (photos.length === 0) continue;

    const coverPhoto = photos.find((p) => p.name === meta.cover) || photos[0];
    const date = meta.date || dateFromSlug(slug) || new Date().toISOString().slice(0, 10);
    albums.push({
      slug,
      title: meta.title || titleFromSlug(slug),
      date,
      year: Number(String(date).slice(0, 4)),
      description: meta.description || "",
      sample: Boolean(meta.sample),
      cover: coverPhoto.thumb,
      coverWeb: coverPhoto.web,
      count: photos.length,
      photos,
    });
  }

  albums.sort((a, b) => (a.date < b.date ? 1 : -1));
  return albums;
}
