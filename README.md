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

- Completed: `contact@jecaverly.com` exists in GoDaddy as an alias to John's private mailbox, confirmed from John's supplied screenshot. Still pending: test delivery and replies before launch. Publish only the alias, never the private destination. The alias can be replaced or disabled if spam becomes a problem.
- At go-live, add public phone `253-302-7144` (`tel:+12533027144`) and email `contact@jecaverly.com` (`mailto:contact@jecaverly.com`) to the Contact Me page, then verify both links on mobile. Keep these details off the development preview until launch.

- Verify biography, titles, dates, credentials, affiliations, consulting availability, and contact email with John.
- Approve final colors, typography, and authentic photographs.
- Review keyboard access, contrast, mobile layouts, text enlargement, links, and contact behavior. This foundation is not an accessibility certification.
- Remove the development banner, `noindex` metadata, and robots exclusion when approved for public indexing.
- Set the final Astro `site` URL and add canonical metadata and sitemap at launch.
- Inspect Cloudflare Pages custom domains and existing DNS before any push: if the old repository is connected to a live custom domain, a push to `main` may update it automatically.
- Preserve GoDaddy registration and all Microsoft 365 records and subscriptions.
- Configure `www` redirection only after testing the apex domain and HTTPS.
- Configure the unlisted SharePoint portal only after its destination is verified; leave it out of public navigation and sitemaps.

No CMS, analytics, or SharePoint redirect is configured. Consultation and training inquiry forms store submissions in a private Cloudflare D1 database; no email notifications are configured. Static pages and inquiry handling use Cloudflare's free allowances.

## Inquiry handling

- `wrangler.jsonc` binds the private D1 database `jecaverly-inquiries` as `INQUIRIES_DB`. The schema in `migrations/0001_inquiries.sql` has been applied through the authenticated Cloudflare console. Deployment configuration is portable; migrating providers also requires exporting private inquiry data separately from source code.
- Review submissions in Cloudflare → D1 → `jecaverly-inquiries` → Console: `SELECT * FROM inquiries ORDER BY created_at DESC LIMIT 50;`. The `type` distinguishes consulting and training; `payload` contains path-specific answers. There is no public read endpoint.
- The forms accept only same-origin POST requests, use bounded server-side validation and parameterized SQL, a honeypot, and a five-inquiries-per-hour connection limit. Rate records use a daily IP-derived hash, not raw IP addresses. A shared network can hit the connection limit.
- Confirmation is returned only after an atomic database write. No email is sent or implied. Cloudflare account access is needed to review inquiries.
- Launch: confirm current American Red Cross instructor authorizations for each advertised course, certification requirements, course availability, and service scope. Add stronger bot protection if abuse occurs; confirm inquiry monitoring, response process, privacy notice, and retention schedule before public launch. Review and remove outdated inquiries regularly using the authenticated dashboard; no automatic inquiry deletion is configured.
- Keep phone/email publication and alias setup on the existing go-live checklist. Preserve GoDaddy registration and Microsoft 365 DNS.
- The preview archive contains only static assets. Functional forms require the deployed Pages Functions and D1 binding, or a local Workers emulator with that binding.

## SharePoint destination setup

A private Website Inquiries list has been created in John's Microsoft Lists. Private destination URLs and resource identifiers are kept outside this public repository. Fields are Title, InquiryType, and InquiryDetails (plain multiline text containing the complete request and reference).

The website supports an optional direct Microsoft Graph destination through server/sharepoint.js. Activation requires a dedicated single-tenant Entra app, Lists.SelectedOperations.Selected application permission, admin consent, and an explicit write grant restricted to the one inquiry list. This role includes reading and modifying that list. Do not grant access to unrelated sites, files, or mail.

Store SP_CLIENT_SECRET only as an encrypted Pages secret, never in source, browser code, logs, or chat. Configure SP_TENANT_ID, SP_CLIENT_ID, SP_SITE_ID, and SP_LIST_ID privately. Set INQUIRY_DESTINATION=sharepoint only after authorization, credential setup, and live tests. D1 remains responsible for rate-limit bookkeeping; inquiry contents then go to SharePoint. Missing configuration or failed Graph writes return an error without success confirmation or fallback storage. This mode is not active yet. Include credential renewal, retention, and inquiry monitoring in the launch checklist.
## Blog publishing

The blog at `/blog/` lists Markdown posts automatically, newest first. John can supply a post in ChatGPT for publication, or create a file in `src/pages/blog/` through GitHub. Use a descriptive filename, such as `preparedness-starts-at-home.md`, and this frontmatter:

```yaml
---
layout: ../../layouts/BlogPost.astro
title: Your post title
description: A short summary
date: '2026-10-08'
---
```

Write the post below the frontmatter and commit to publish. Keep unpublished drafts outside `src/pages/`; a `draft` flag only hides a post from the listing and does not make its URL private. No posts or comments have been fabricated, and no visitor login is required.
