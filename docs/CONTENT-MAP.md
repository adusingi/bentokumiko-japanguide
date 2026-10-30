---
type: Guide
title: "Bento Kumiko content map"
description: "Bilingual ownership map for public pages, shared content, approved commercial copy and pending owner material."
tags: [bento-kumiko, content, website, ownership, french]
timestamp: 2026-10-30T17:10:40+09:00
---

# Content map

| English URL and source | French URL and source | Purpose |
| --- | --- | --- |
| `/`, `/index.html` — `src/pages/index.html` | `/fr/`, `/fr/index.html` — `src/pages/fr/index.html` | Homepage, service overview, pricing, sample trip, testimonial and trip enquiry |
| `/about.html` — `src/pages/about.html` | `/fr/a-propos.html` — `src/pages/fr/a-propos.html` | Kumiko's background, approach and languages |
| `/service.html` — `src/pages/service.html` | `/fr/services.html` — `src/pages/fr/services.html` | Mobile-first service selector with both services available without JavaScript |
| `/shopping.html` — `src/pages/shopping.html` | `/fr/shopping.html` — `src/pages/fr/shopping.html` | Shopping details and the locale’s dedicated shopping Tally journey |
| `/blog.html` — `src/pages/blog.html` | `/fr/blog.html` — `src/pages/fr/blog.html` | Travel notes, guest lessons and personally visited places |
| `/enquire.html` — `src/pages/enquire.html` | `/fr/contact.html` — `src/pages/fr/contact.html` | Trip-planning expectations and the locale’s dedicated trip Tally journey |
| root missing path — `src/pages/404.html` | missing path under `/fr/` — `src/pages/fr/404.html` | Localized branded 404 response |

Shared navigation and footer live in `src/components/layout.mjs`. The compact route, locale and metadata map lives in `src/i18n/site.mjs`. Shared form rendering lives in `src/components/enquiry.mjs`; build modes and external form ownership are documented in [Tally enquiry activation](/docs/TALLY.md). Presentation lives in `src/styles/`, and extracted local photographs live in `src/assets/images/` with localized alternative text in their page sources.

## Keeping both languages current

Treat each row above as one content pair. Any change to English facts, commercial wording, links, image meaning, metadata or interactive labels must review and normally update the corresponding French source and `src/i18n/site.mjs` in the same change. If the owner intentionally postpones a translation, record the exact page and English change in [Owner follow-ups](/docs/TOMORROW.md) before release; do not silently leave a stale translation. Automated checks verify routes, links, metadata relationships, pricing/form invariants and placeholders, but editorial equivalence still needs human review.

## Approved service copy

- Trip planning: `$350` for up to one week, plus `$50` per extra week. This is a planning fee; guests book and pay for hotels and transport separately.
- Shopping assistance: `$200` per day in Kyoto, Osaka, Hiroshima or Tokyo. Kumiko's return transport from Okayama is added at cost for every city.

Historic sample-trip costs remain clearly illustrative and are not current quotes.

## Testimonials

The English homepage publishes the approved Everyln & Fabiola testimonial. The French local-review build shows a labeled proposed translation and preserves the English original for comparison. `FRENCH_TESTIMONIAL_APPROVED=1` must record owner publication approval in the guarded release command; until then, the French page visibly identifies the translation as a local preview. Secondary Heri and Peter cards remain preserved but hidden in English source. Marc Lee wording is still pending owner supply and approval; do not publish an attribution, rating or quote until approved words are available.

Kumiko has chosen not to use a personal portrait, so the site has no portrait or portrait placeholder.

## External content ownership

English trip and shopping submissions occur in separate existing Tally forms. The owner-created French trip form `laaPRo` and shopping form `Z99ple` are now the ordinary defaults for their matching pages; explicit-empty overrides retain noninteractive local-review placeholders. Their public destinations were verified read-only, but recipients, notifications, privacy wording, confirmation behavior and delivery remain external owner checks. Both shopping forms’ transport helper must match the approved all-city surcharge wording. See [owner follow-ups](/docs/TOMORROW.md).
