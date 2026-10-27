---
type: Ticket
title: "BK-005 — Keep the website white"
description: "User-approved light-only appearance on all screen sizes and browser color preferences."
tags: [software-factory, bentokumiko, appearance]
timestamp: 2026-10-28T00:31:34+09:00
---

# BK-005

Status: approved by the user's instruction "keep white", following diagnosis of automatic dark styles. Existing delegation applies: same Codex worker GPT-5.6 Sol High implements; manager reviews and accepts. Base: 264f4045764c7df3af56f1d3ce4f7d9c602ecbf2.

Remove automatic dark appearance from all pages. Preserve the existing light palette, mobile layouts and deliberately contrasting content sections. Set the document/browser color-scheme to light only and remove dark-preferring overrides. Keep form controls light. Do not change copy, layout, pnpm tooling or form behavior.

Allowed implementation paths: src/styles/*.css and src/components/layout.mjs. No new dependencies or permanent tests for this low-impact CSS change. Run pnpm test and pnpm build; inspect that no dark preference overrides remain. Manager will verify computed styles with dark preference at mobile and desktop sizes. Do not commit, change branches, push or deploy. Use existing subscription authentication; stop on auth/quota errors.

Markdown changes, if necessary, require OKF metadata (type, title, description, tags and fresh Asia/Tokyo timestamp +09:00), bundle-root links and validation with /Users/adusingi/.claude/skills/okf/scripts/validate-okf.py. This assignment is manager-owned and read-only for the worker.
