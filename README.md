# GHALIA

Website for GHALIA, a Luxury Chocolate Maison in Hail, Saudi Arabia. Bilingual (English and Arabic with full RTL), built with React, Three.js and GSAP, with a small Node server that stores enquiries. It is a showcase, not a shop: visitors compose a gift at `/order` and send it to the Maison on WhatsApp.

See [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md) for how each brand requirement maps to the site, and for what still needs the client's input.

## Run it

Needs Node 22.5 or newer (the server uses the built-in `node:sqlite`).

```bash
npm install
cp .env.example .env     # set ADMIN_TOKEN to use the inbox
npm run dev              # site on :5173, API on :8787
```

For the production build on a single port:

```bash
npm run build
npm start                # http://localhost:8787
```

## Where orders and enquiries go

Orders are not taken on the site. The last step at `/order` opens WhatsApp with the chosen collection, format, filling, quantity and gift note already written. The number comes from the WhatsApp entry in `src/content/site.js` (`social`).

Every enquiry form posts to `/api/submissions` and is stored in SQLite (`data/ghalia.db`). The Maison reads them at `/inbox`, using the `ADMIN_TOKEN` from `.env`. The inbox stays locked until that token is set.

To be notified as well, set `NOTIFY_WEBHOOK_URL`. Each new submission is then POSTed there as JSON, which works with Slack, Make, Zapier or a CRM.

Hosting must keep the `data/` folder between deploys, or set `DATABASE_PATH` to a persistent disk. Serverless hosts will not work without swapping the storage layer in `server/db.js`.

## Contact details

Neither source document includes a phone number or email, so none are shown. Set the `VITE_CONTACT_*` values in `.env` and rebuild, and they appear in the footer. The social accounts, supplied by the Maison, are listed in `src/content/site.js` (`social`); an entry without a url stays hidden.

## Project layout

```
server/              API, validation, SQLite storage, static hosting
scripts/             Media pipeline (brand PDF images -> responsive WebP)
public/media/        Generated images
tests/e2e/           Playwright suite
src/
  content/           All copy, in English and Arabic. Edit text here.
  pages/             One file per route
  components/        layout/ (header, menu, footer...), home/, forms/, ui/, brand/
  three/             3D: scenes/, models/ (Halo Tray, roses, ribbon...), quality tiers
  animations/        GSAP setup, Lenis, the data-reveal scroll system
  state/             Language, page transitions, intro
  styles/            Design tokens, base, components, pages
```

### Common edits

- **Text:** `src/content/`. Every string has an `en` and an `ar` value.
- **Collections:** `src/content/collections.js` holds names, colours, images and formats.
- **Colours and type:** `src/styles/tokens.css`.
- **Scroll animation:** add `data-reveal="fade|words|arch|stagger|rule"` or `data-parallax="0.1"` to any element inside a `Page`.

### Regenerating images

`npm run media` rebuilds `public/media` from images extracted from the two brand PDFs. Point `GHALIA_SOURCE` at the extracted folder. Crops and sizes are listed in `scripts/prepare-media.mjs`.

## Tests

```bash
npm test                               # API tests
npm run build && npm run test:e2e      # browser tests, uses your installed Chrome
```

The browser suite takes several minutes, because 3D renders in software when run headless.
