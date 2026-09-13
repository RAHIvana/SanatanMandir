# Adding a photo album to the Gallery

Every folder inside `photos/` becomes an album on the Gallery page. The build resizes the photos and makes thumbnails automatically; the originals you put in the folder are never changed.

## The short version

1. Make a folder `photos/2026-10-navratri` (pattern: `YYYY-MM-short-name`, no spaces).
2. Put the photos in it (JPG or PNG; straight from a phone or a Google Photos download is fine).
3. Optionally add `album.json` next to them:

   ```json
   {
     "title": "Navratri 2026",
     "date": "2026-10-11",
     "description": "Nine nights of Garba, Aarti and Durga Puja at the mandir.",
     "cover": "IMG_2041.jpg"
   }
   ```

   Without it, the title comes from the folder name (`2026-10-navratri` → *Navratri*), the date from the `YYYY-MM`, and the first photo is the cover.
4. Commit and push. The album appears under its year, newest first, and the home page shows the two most recent albums.

## Getting photos out of Google Photos

Volunteers can keep dropping pictures into a shared Google Photos album as they do now. When it's time to publish:

1. Open the shared album in Google Photos on a computer.
2. ⋮ (top right) → **Download all**. A zip file lands in Downloads.
3. Extract it, rename the folder to the `YYYY-MM-name` pattern, move it into `photos/`.
4. Delete blurry or duplicate shots — fewer, better photos make a nicer album.
5. Commit and push (see `GITHUB-SETUP.md` → *Making changes later*).

## Sizes and limits

- Phone photos are usually 3–6 MB each. That is fine for the source folder, but keep an eye on the total: the whole repository should stay under about 1 GB. Around 40–80 photos per event is a good number.
- The build creates 1600px web copies (~250 KB) and 480px thumbnails, so visitors never download the originals.
- **HEIC** (iPhone default format) is not supported by the build. On iPhone, Settings → Camera → Formats → *Most Compatible* saves JPG; or convert HEIC files before adding them.
- Very large batches slow the build slightly (about 1 second per 10 photos). It still finishes in a few minutes.

## Removing or renaming

- Delete the folder → the album disappears on the next push.
- Rename the folder → the album's web address changes (old links to it stop working), otherwise harmless.

## Professional albums hosted elsewhere

Albums that live on a photographer's site (like the Lens and Beyond galleries) are listed in `src/_data/external_albums.json` and appear as tiles that open in a new tab. Add an entry with a title, date, the link, and a cover image from `src/assets/img/`.
