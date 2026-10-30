---
type: Guide
title: "Bento Kumiko content map"
description: "Ownership map for public pages, shared content, approved commercial copy and pending owner material."
tags: [bento-kumiko, content, website, ownership]
timestamp: 2026-10-30T11:41:27+09:00
---

# Content map

| Public URL | Authored source | Purpose |
| --- | --- | --- |
| `/` and `/index.html` | `src/pages/index.html` | Homepage, service overview, pricing, sample trip, approved testimonial and trip enquiry |
| `/about.html` | `src/pages/about.html` | Kumiko's background, approach and languages |
| `/service.html` | `src/pages/service.html` | Mobile-first trip-planning and shopping selector with both services available without JavaScript |
| `/shopping.html` | `src/pages/shopping.html` | Shopping service details and dedicated shopping Tally form |
| `/blog.html` | `src/pages/blog.html` | Travel notes, guest lessons and personally visited places |
| `/enquire.html` | `src/pages/enquire.html` | Trip-planning expectations and dedicated trip Tally form |
| any missing path | `src/pages/404.html` | Branded 404 response |

Shared navigation, metadata and footer live in `src/components/layout.mjs`. Shared form rendering lives in `src/components/enquiry.mjs`; build modes and external form ownership are documented in [Tally enquiry activation](/docs/TALLY.md). Presentation lives in `src/styles/`, and extracted local photographs live in `src/assets/images/` with alternative text in their page sources.

## Approved service copy

- Trip planning: `$350` for up to one week, plus `$50` per extra week. This is a planning fee; guests book and pay for hotels and transport separately.
- Shopping assistance: `$200` per day in Kyoto, Osaka, Hiroshima or Tokyo. Kumiko's return transport from Okayama is added at cost for every city.

Historic sample-trip costs remain clearly illustrative and are not current quotes.

## Testimonials

The homepage publishes the approved Everyln & Fabiola testimonial. Secondary Heri and Peter cards remain preserved but hidden in source. Marc Lee wording is still pending owner supply and approval; do not publish an attribution, rating or quote until approved words are available.

Kumiko has chosen not to use a personal portrait, so the site has no portrait or portrait placeholder.

## External content ownership

Trip and shopping submissions occur in separate Tally forms. Their recipient, notification, privacy and confirmation settings are managed outside this repository and still require owner verification. The shopping form's transport helper must match the approved all-city surcharge wording; its previous Tokyo-only wording has not been reverified. See [owner follow-ups](/docs/TOMORROW.md).
