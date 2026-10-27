---
type: Guide
title: "Bento Kumiko website"
description: "Build, preview and ownership guide for the Bento Kumiko static website."
tags: [bento-kumiko, website, operations]
timestamp: 2026-10-27T23:46:03+09:00
---

# Bento Kumiko website

A dependency-free static build preserving the supplied Bento Kumiko design and copy. Shared layout and form components build seven pages into `dist/`; nginx serves that output in production.

## Work locally

Requires Node.js 20 or newer.

```sh
npm run build
npm run preview
```

Open `http://127.0.0.1:4173`. Run all integrity and form-mode checks with:

```sh
npm test
```

Checks build into disposable directories with explicitly controlled form settings; they do not replace an existing `dist/`, even when `TALLY_FORM_ID` is exported. The normal `npm run build` replaces only the repository's generated `dist/`. A custom `SITE_OUTPUT_DIR` must be outside the repository and either new or empty; populated paths and symbolic-link targets are rejected rather than erased.

The default build is deliberately non-submitting. It presents an honest preview form that validates in the browser and retains answers only in the current page. Configure the live form through the single `TALLY_FORM_ID` build-time setting described in [Tally activation](/docs/TALLY.md).

## Source map

- `src/pages/`: page-specific semantic HTML content
- `src/components/`: shared layout and enquiry rendering
- `src/styles/base.css`: tokens, navigation, footer, focus, motion and shared form styles
- `src/styles/`: page-specific presentation
- `src/assets/`: local images, favicon and browser scripts
- `build.mjs`: deterministic static build
- `scripts/check.mjs`: output, link, asset and form-state checks
- `nginx/default.conf`: production routing, caching and security headers

See the [content map](/docs/CONTENT-MAP.md), [deployment guide](/docs/DEPLOYMENT.md) and [owner checklist](/docs/TOMORROW.md).

## Boundaries

The site does not book travel or call a Tally submission API. Historic sample-trip costs are illustrative and are not current quotes. The repository contains no credentials or enquiry answers.
