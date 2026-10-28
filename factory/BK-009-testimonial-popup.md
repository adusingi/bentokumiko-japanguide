---
type: Ticket
title: "BK-009 — Apply compact testimonial popup"
description: "User-selected option A promoted into the homepage, with mobile checks and preview restart."
tags: [software-factory, bentokumiko, frontend]
timestamp: 2026-10-28T13:07:20+09:00
---

# BK-009

Approved user request: "Continue with option A. Use the same worker to apply it to the homepage, check it on mobile, then rebuild and restart the app on 4173." Existing delegated acceptance applies. Same GPT-5.6 Sol High Codex worker implements; manager reviews, verifies and owns Git and preview processes.

Implement in /Users/adusingi/Documents/Code/p/software-factory/.factory-bentokumiko-local/workspace, development branch at 17e2356a9f7c397b1c8913f69dc4aa94cdaf7a62. This is a return from the prototype workspace; do not edit ../testimonial-prototype. Prototype primary source: codex/testimonial-prototype commit 64fcb700cb61dac4462edad44ede680ebfd11d4f, files readable in ../testimonial-prototype. Option A chosen because the compact two-line card reveals the complete quote without changing section height. B/C and the switcher remain only on that prototype branch.

Apply only option A as clean production code: same blush/dashed card style, compact two-line quote with visible ellipsis and readable author/trip context, approximately reference card height; mobile stacked cards. Full French quote remains exact, language fr; Everyln & Fabiola quote and Lee placeholder/context unchanged. No rating semantics for decorative stars.

Reveal full Heri quote in an anchored floating white popup on hover anywhere over Heri's card and keyboard focus/activation; click/tap works on mobile. Keep it readable when moving pointer from card into popup. Escape, explicit close and outside interaction dismiss correctly, without immediate focus-triggered reopening. Focus inside popup must not be dismissed merely by pointer leaving. Use suitable accessible trigger/expanded state and dialog semantics; return focus after explicit dismissal. Bound popup to viewport, allow scrolling long text on small screens, preserve card geometry/body scroll position and white appearance. Account for scroll/resize so the floating panel does not become detached or inaccessible. Lee remains noninteractive. Prefer one source of truth for full quote; no dependencies or unnecessary abstraction. Without JavaScript, keep the full quote available rather than inaccessible clipping.

Do not copy prototype controls, headings, runner, variants, styles or files into production. Rewrite the selected behavior in normal page/style/script files. Allowed: src/pages/index.html, src/styles/index.css, src/assets/scripts/testimonial-popup.js (new) or existing site.js if appropriately small, src/components/layout.mjs for homepage-only script inclusion, scripts/check.mjs if meaningful integrity checks are necessary, docs/CONTENT-MAP.md if useful. No other feature/copy/layout changes. Keep separate blog and six-page output inventory.

Run pnpm test, pnpm build, JS syntax/diff checks and report. Do NOT start/stop preview servers or perform browser automation; manager owns browser verification and restarting 4173 to avoid process conflicts. No commits, branch changes, push or deployment. Stop on auth/quota errors.

All meaningfully edited Markdown follows OKF metadata and fresh Asia/Tokyo timestamp +09:00, bundle-root links, validator /Users/adusingi/.claude/skills/okf/scripts/validate-okf.py with zero issues. Assignment manager-owned read-only.
