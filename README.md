---
type: Guide
title: "Bento Kumiko website"
description: "Build, preview, deployment preparation and ownership guide for the Bento Kumiko static website."
tags: [bento-kumiko, website, operations, cloudflare]
timestamp: 2026-10-28T17:18:15+09:00
---

# Bento Kumiko website

A small static build preserving the supplied Bento Kumiko design and copy. Shared layout and form components build six pages into `dist/`; nginx or Cloudflare Workers Static Assets can serve that output.

## Work locally

Requires Node.js 20 or newer and pnpm `12.9.1`, pinned by `package.json`.

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm preview
```

Open `http://127.0.0.1:4173`. The preview serves generated files, so rebuild after content or style changes. Run all integrity and form-mode checks with:

```sh
pnpm test
```

Checks build into disposable directories with explicitly controlled form settings; they do not replace an existing `dist/`, even when `TALLY_FORM_ID` is exported. The normal `pnpm build` replaces only the repository's generated `dist/`. A custom `SITE_OUTPUT_DIR` must be outside the repository and either new or empty; populated paths and symbolic-link targets are rejected rather than erased.

An ordinary `pnpm build` embeds the owner-supplied public Tally form `6DDMge`. Use `TALLY_FORM_ID=abc123 pnpm build` to override it with another approved public form, or `TALLY_FORM_ID= pnpm build` to explicitly produce the non-submitting local preview. The setting is public build configuration, not a secret.

Cloudflare Workers Static Assets preparation can be checked without logging in or deploying:

```sh
pnpm cloudflare:dry-run
```

For local Cloudflare emulation, eventual deployment and the Git/OVH cutover checklist, use the [Cloudflare preparation guide](/docs/CLOUDFLARE.md). The repository contains configuration only; it does not imply that a GitHub repository, Cloudflare project, DNS zone or custom domain has been created.

The live form uses Tally's official responsive embed loader and retains a direct hosted-form fallback. Field mapping, explicit preview mode and the remaining owner-side delivery checks are documented in [Tally activation](/docs/TALLY.md).

## Source map

- `src/pages/`: page-specific semantic HTML content
- `src/components/`: shared layout and enquiry rendering
- `src/styles/base.css`: tokens, navigation, footer, focus, motion and shared form styles
- `src/styles/`: page-specific presentation
- `src/assets/`: local images, favicon and browser scripts
- `cloudflare/`: authored static-asset headers and root rewrite copied into `dist/`
- `build.mjs`: deterministic static build
- `scripts/check.mjs`: output, link, asset and form-state checks
- `wrangler.jsonc`: static-only Cloudflare Workers configuration; no Worker script, database binding or live domain
- `nginx/default.conf`: production routing, caching and security headers

See the [content map](/docs/CONTENT-MAP.md), [deployment guide](/docs/DEPLOYMENT.md), [Cloudflare preparation guide](/docs/CLOUDFLARE.md) and [owner checklist](/docs/TOMORROW.md).

## Boundaries

The site does not book travel or call a Tally submission API. It has no application backend or SQLite database; configured enquiries go to Tally. Historic sample-trip costs are illustrative and are not current quotes. The repository contains no credentials or enquiry answers.
