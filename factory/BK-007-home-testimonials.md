---
type: Ticket
title: "BK-007 — Homepage testimonial cards"
description: "Remove the separate testimonials page and restore the user's supplied card layout on the homepage."
tags: [software-factory, bentokumiko, design]
timestamp: 2026-10-28T09:06:10+09:00
---

# BK-007

Approved user request: "no need of a page for Testimonial keep on the home page and keep the attached design". Base: bfeebe4099129f07c4446825f592bc77bb909375. Same GPT-5.6 Sol High Codex worker implements; manager reviews and accepts.

Read the screenshot at ../evidence/BK-007/reference.png with the image viewer. Preserve the existing main Everyln & Fabiola quote, highlights and lesson panel on the homepage. Under that lesson panel restore two equal-width cards on desktop, stacked on mobile: soft blush background, rounded corners, thin dashed border, generous padding, small orange outline-star decoration, italic serif quote text, dark author line and smaller subdued trip context. Decorative stars must be aria-hidden with no numeric rating or rating schema.

Left card: Heri R.'s entire exact French quote from BK-006, lang=fr, readable dark text (not disabled/pending). Name Heri R. · Canada; context Travelled with his wife and their 2 kids. Right card: pending text "Their words are on their way — this space is saved for them." with Marc Lee A. · Australia and context "Came back twice — first trip with his son, second trip with his daughter". Do not invent Lee's testimonial. Equal card heights may accommodate the longer real quote; no truncation/fixed heights. Use restrained quote sizing close to reference, not large feature-quote sizing.

Remove standalone testimonials source and CSS and its build registry/sitemap entry. Update header/footer Testimonials links and about-page link to /index.html#testimonials. Keep an About excerpt if present; no standalone testimonial page. Remove obsolete homepage page links and superseded testimonial styles. Update existing integrity tests for the six-output-page inventory (five public plus 404) and verify homepage anchor navigation; no unnecessary new tests for text literals. Update README/content map for changed page structure. Blog stays separate; white theme, form, pnpm and deployment configuration unchanged.

Allowed paths: src/pages/index.html, src/pages/about.html, src/pages/testimonials.html (delete), src/styles/index.css, src/styles/testimonials.css (delete), src/components/layout.mjs, build.mjs, scripts/check.mjs, README.md, docs/CONTENT-MAP.md. No extra dependencies. Run pnpm test, pnpm build, diff check, and validate Markdown. Do not commit/change branches/push/deploy. Stop on auth/quota errors. Manager verifies mobile/desktop rendering and local preview on 4173.

All meaningfully edited Markdown needs existing OKF fields, fresh Asia/Tokyo timestamp +09:00 and bundle-root links. Validate with /Users/adusingi/.claude/skills/okf/scripts/validate-okf.py and inspect zero issues. Assignment is read-only for worker.
