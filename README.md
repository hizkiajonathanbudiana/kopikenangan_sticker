## LINE Sticker Template UI Kit

Interactive LINE sticker mockups powered by Next.js + Tailwind. Toggle between the **Ka-Kun (Kawung)** and **Mega-Miu (Mega Mendung)** templates on the landing page, flip the copy between 繁中 / English, and preview the final LINE Store layout plus the sticker filename checklist in one place.

### Run locally

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to play with the flow.

### Customize stickers & copy

- Update `src/data/stickerLab.ts` to tweak locale copy, add themes, or change sticker filenames.
- Drop PNG/JPG assets into `public/stickers/kawung/` or `public/stickers/mega/` (filenames must match the entries in the data file). The preview + checklist load straight from those folders.
- To support additional locales, extend the `languageOptions`, `localeDisplayName`, and `uiCopy` maps.

### Deploy

Any static-friendly host works. For a quick GitHub deployment:

1. Commit this folder to your repo.
2. Enable the Next.js build pipeline on Vercel, Netlify, or set up GitHub Actions running `npm run build` followed by `npm run start` (or export via `next export`).

Happy shipping!  
