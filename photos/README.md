# Photo albums

One folder per album. Name folders `YYYY-MM-event-name` (for example `2026-10-navratri`) so they sort by date.
Drop the photos in (JPG or PNG straight from a phone is fine) and optionally an `album.json`:

```json
{ "title": "Navratri 2026", "date": "2026-10-11", "description": "Nine nights of Garba and Aarti.", "cover": "IMG_0012.jpg" }
```

The build makes web-sized copies and thumbnails automatically; originals here are never modified.
See docs/ADDING-PHOTOS.md for the full walkthrough.
