# Template thumbnails

Catalog preview images shown on `/admin/catalog`. One PNG per template,
filename matches the template `key` from the seed migrations (V2-V4):

- `beauty-salon.png`
- `restaurant.png`
- `sto.png`

The DB-stored `thumbnail_url` points to `/templates/<key>.png` — Next.js
serves this directory at the platform root, so the same URL works in dev
(`localhost:3000`) and prod (`storinka.com`).

## Replacing a thumbnail

1. Drop the new file in here with the same name.
2. Commit. The next deploy picks it up — no DB changes needed.

## Recommended specs

- **Format:** PNG (or JPG if size matters more than transparency).
- **Aspect:** 16:10 — matches the `aspect-[16/10]` card wrapper. 1280×800
  is a good source size; the browser scales down cleanly.
- **Weight:** under ~300 KB per file. Use tinypng.com or `cwebp` if larger.
