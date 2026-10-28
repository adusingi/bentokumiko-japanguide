---
type: Ticket
title: "BK-012 — Remove portrait expectations"
description: "Respect Kumiko's preference by removing portrait placeholders from the homepage and About page."
tags: [software-factory, bentokumiko, content]
timestamp: 2026-10-28T17:37:05+09:00
---

# BK-012

User: Kumiko does not want her photograph on the website; remove the placeholder or avoid wording that makes visitors expect a photo. Manager chooses removal of the placeholder. Same Codex worker GPT-5.6 Sol High implements; manager verifies and accepts under existing delegation.

Work in /Users/adusingi/Documents/Code/p/software-factory/.factory-bentokumiko-local/workspace on development at f6c442a. Remove the entire personal-photo placeholder from BOTH src/pages/index.html and src/pages/about.html, including image role/aria-label, photo promise and placeholder decorations. Keep existing biographical copy and chips. Reflow introduction into a deliberate readable text-first layout with a bounded line length and no blank grid column or large empty box. Maintain existing white theme, spacing style and mobile-first layout. No substitute person image, fictional quotation or public privacy explanation. Preserve actual Japan travel photos, forms, testimonials and blog.

Clean up exclusively unused .photo-slot rules and obsolete two-column .meet styles in corresponding index.css/about.css. Update docs/TOMORROW.md to remove the portrait procurement task, and docs/CONTENT-MAP.md to record that no personal portrait is planned per owner choice rather than pending. Keep any historic factory tickets immutable. Allowed scope: those two page files, two stylesheets, and two docs; do not add tests for this low-impact content/layout change. Run existing pnpm test and pnpm build plus diff check; manager owns browser acceptance, Git and preview restart. No commits, branch changes, push, deploy or servers. Stop on auth/quota failure.

All edited Markdown uses OKF metadata and fresh Asia/Tokyo timestamp +09:00, bundle-root links; validate changed docs with /Users/adusingi/.claude/skills/okf/scripts/validate-okf.py and require zero reported issues. Assignment read-only.
