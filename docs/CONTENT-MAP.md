---
type: Guide
title: "Bento Kumiko content map"
description: "Ownership map for pages, shared copy, assets and content awaiting approval."
tags: [bento-kumiko, content, website]
timestamp: 2026-10-28T17:37:35+09:00
---

# Content map

| Public URL | Authored source | Purpose |
|---|---|---|
| `/` and `/index.html` | `src/pages/index.html` | Homepage, sample work, supplied guest stories, Lee's pending story and enquiry seam; Blog remains navigation-only here |
| `/about.html` | `src/pages/about.html` | Kumiko's supplied background, approach and languages |
| `/service.html` | `src/pages/service.html` | Scope, process, illustrative historic sample and Dokomaps examples |
| `/blog.html` | `src/pages/blog.html` | Supplied travel notes, guest tips and personally visited places |
| `/enquire.html` | `src/pages/enquire.html` | Enquiry expectations and shared preview/Tally component |
| any missing path | `src/pages/404.html` | Real 404 response through nginx |

Shared navigation, metadata and footer live in `src/components/layout.mjs`. Shared enquiry fields live in `src/components/enquiry.mjs`; their external mapping is in [Tally activation](/docs/TALLY.md). Extracted photographs are content-addressed in `src/assets/images/` and retain their supplied alternative text in page sources.

## Owner content decisions

Kumiko has chosen not to use a personal portrait on the website, so no portrait or portrait placeholder is planned. Existing Japan travel photographs remain part of the supplied page content.

## Pending owner content

Final service pricing and Lee's approved testimonial wording remain intentionally absent. The public pages label their current state rather than inventing replacements. See the [owner checklist](/docs/TOMORROW.md).
