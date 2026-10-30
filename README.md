---
type: Guide
title: "Bento Kumiko website"
description: "Project overview, local workflow, architecture and release documentation for the Bento Kumiko website."
tags: [bento-kumiko, website, github, cloudflare]
timestamp: 2026-10-30T11:44:23+09:00
---

# Bento Kumiko

[Bento Kumiko](https://bentokumiko.com) is a Japan travel-planning website for personal itineraries and guided shopping days with Kumiko. The site is a small, maintainable static build designed for mobile use and hosted with Cloudflare Workers Static Assets.

## Current site

- Personal Japan trip planning with day-by-day plans, stays, transport and budgets
- Shopping assistance in Kyoto, Osaka, Hiroshima and Tokyo
- Dedicated Tally enquiry forms for trip planning and shopping
- A mobile-first service selector that remains usable without JavaScript
- Travel notes and destination content in the blog
- The approved Everyln & Fabiola homepage testimonial
- Seven generated HTML pages, including the branded `404.html`

## Quick start

Requires Node.js 20 or newer and pnpm `12.9.1`, pinned in `package.json`.

```sh
git clone https://github.com/adusingi/bentokumiko-japanguide.git
cd bentokumiko-japanguide
pnpm install --frozen-lockfile
pnpm build
pnpm preview
```

Open `http://127.0.0.1:4173`. Rebuild after changing source content or styles.

## Useful commands

| Command | Purpose |
| --- | --- |
| `pnpm test` | Build and run output, link, asset and form-mode checks |
| `pnpm build` | Generate the production-ready static site in `dist/` |
| `pnpm preview` | Serve the current `dist/` locally on port 4173 |
| `pnpm cloudflare:dev` | Build and run the site in the local Wrangler runtime |
| `pnpm cloudflare:dry-run` | Build and validate the Cloudflare upload without deploying |
| `pnpm cloudflare:deploy` | Build and deploy through authenticated Wrangler; release authority required |

An ordinary build uses the approved trip form `6DDMge` and shopping form `Vpp72g`. `TALLY_FORM_ID` can override or explicitly disable only the trip form; see [Tally enquiry activation](/docs/TALLY.md).

## Architecture

The project has no application backend or SQLite database. `build.mjs` combines authored pages and shared components, copies local assets and Cloudflare routing files, and writes deterministic static output to `dist/`. Configured enquiries are submitted inside Tally's hosted forms.

- `src/pages/`: page-specific semantic HTML
- `src/components/`: shared layout and enquiry rendering
- `src/styles/`: shared and page-specific presentation
- `src/assets/`: local images, favicon and browser scripts
- `build.mjs`: static build and page metadata
- `scripts/check.mjs`: output and configuration checks
- `cloudflare/`: static headers and the root rewrite copied into the build
- `wrangler.jsonc`: Cloudflare Workers Static Assets configuration
- `Dockerfile` and `nginx/`: optional container-hosting alternative, not the active host

## Documentation

- [Contributing](/CONTRIBUTING.md)
- [Deployment and rollback](/docs/DEPLOYMENT.md)
- [Cloudflare operations](/docs/CLOUDFLARE.md)
- [Content map](/docs/CONTENT-MAP.md)
- [Tally enquiry activation](/docs/TALLY.md)
- [Owner follow-ups](/docs/TOMORROW.md)

## Release flow

Changes are reviewed on `development` before an accepted revision is promoted to `main`. Production deployment is a separate, manager-authorized local Wrangler action from the accepted `main` revision; pushing to GitHub does not deploy the website. GitHub Actions is configured to run repository checks, but its presence is not evidence that a particular release passed remotely.

Cloudflare currently serves `bentokumiko.com` and `www.bentokumiko.com`. OVHcloud remains the registrar and renewal provider. Operational details and rollback steps are maintained in the [deployment guide](/docs/DEPLOYMENT.md).

## License and content rights

The repository's source code is available under the [MIT License](/LICENSE).

The Bento Kumiko brand identity, photographs, testimonials and third-party content retain their respective rights. The software license grants no rights to those materials.
