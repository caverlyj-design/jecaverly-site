# JECaverly.com

Development foundation for Jonathan Everett (John) Caverly's personal and professional website.

## Build and preview

Use Node 22.12 or newer. Install dependencies with `pnpm install`, build with `pnpm build`, and preview with `pnpm preview`. The deployment output is `dist/`.

## Cloudflare Pages configuration

- Connect the existing GitHub repository `caverlyj-design/jecaverly-site`.
- Production branch: `main`.
- Framework preset: Astro.
- Build command: `pnpm build`.
- Build output directory: `dist`.
- Node version: 22 (see `.node-version`).
- Use the assigned `pages.dev` address until launch review. Do not attach production domains during initial setup.

Routine page content is Markdown in `src/pages/`. Edit the relevant file in GitHub and commit; connected Pages rebuilds automatically. `index.astro` controls the homepage; shared structure and styling live in `src/layouts/` and `src/styles/`.

## Launch checklist

- Verify biography, titles, dates, credentials, affiliations, consulting availability, and contact email with John.
- Approve final colors, typography, and authentic photographs.
- Review keyboard access, contrast, mobile layouts, text enlargement, links, and contact behavior. This foundation is not an accessibility certification.
- Remove the development banner, `noindex` metadata, and robots exclusion when approved for public indexing.
- Set the final Astro `site` URL and add canonical metadata and sitemap at launch.
- Inspect Cloudflare Pages custom domains and existing DNS before any push: if the old repository is connected to a live custom domain, a push to `main` may update it automatically.
- Preserve GoDaddy registration and all Microsoft 365 records and subscriptions.
- Configure `www` redirection only after testing the apex domain and HTTPS.
- Configure the unlisted SharePoint portal only after its destination is verified; leave it out of public navigation and sitemaps.

No CMS, analytics, forms, or SharePoint redirect is configured yet. The site currently collects no visitor submissions. No paid services are required for its static foundation.
