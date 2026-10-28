---
type: Ticket
title: "BK-011 — Connect published Tally enquiry form"
description: "Integrate the owner-supplied Tally form and verify responsive embedding locally."
tags: [software-factory, bentokumiko, tally]
timestamp: 2026-10-28T17:23:09+09:00
---

# BK-011

The user supplied https://tally.so/r/6DDMge after discussing Tally integration. Interpret as the requested form for this website. Existing delegation: same Codex worker GPT-5.6 Sol High implements, manager verifies/accepts and owns Git and servers. Local integration only; no hosting deployment, DNS changes, editing Tally account, or test submissions.

Implement in /Users/adusingi/Documents/Code/p/software-factory/.factory-bentokumiko-local/workspace on development at 9badffd. Manager inspected the actual published form in browser: all 12 requested fields and required states are present, including French/English and three call options. Public form display works; recipient/notification/privacy/confirmation configuration and actual delivery are not verified. Do not claim these are verified.

Make the supplied public form ID 6DDMge the persistent default for ordinary pnpm build and Docker builds, retain TALLY_FORM_ID override, and retain explicit empty-string preview mode for fixtures/local review. Keep the implementation small (nullish fallback in build and matching Docker ARG default are acceptable); document public default and overrides honestly in README, TALLY and deployment guidance. No secrets or dependencies required. Update obsolete statements that an ordinary build defaults to non-submitting preview, including owner checklist if needed.

Fix/embed responsive height correctly: current iframe has dynamicHeight=1 but no host integration and fixed min-height. Prefer official Tally embed mechanism with narrowly scoped CSP changes in both nginx and Cloudflare if needed. Alternatively a small local resize listener using Tally's verified message contract must validate exact origin, source frame and numeric sane height and handle ready timing; do not invent protocol. Full form must fit without nested vertical scrolling on mobile and desktop; retain white surrounding design, title, fallback link to the supplied hosted form, and no-JS usable fallback. Do not attempt to style the cross-origin form from host CSS or remove Tally branding. No unrelated content/testimonial/blog changes. Form scripts only where embed exists. Official resources https://tally.so/help/embed-your-form and https://developers.tally.so/ . Do not copy private field response data or submit the form.

Run pnpm test/build and Docker build if changed. Include meaningful checks default ID/override/empty preview and integration inclusion. Manager handles live browser testing and rebuild/restart4173; worker must not start/stop servers or run submissions. No commit, branch changes, push, external deployment or auth fallback. Stop on login/quota error.

Every Markdown file edited must follow OKF metadata with fresh Asia/Tokyo timestamp +09:00 and bundle-root links. Validate with /Users/adusingi/.claude/skills/okf/scripts/validate-okf.py and require zero reported issues. Assignment read-only.

## User correction during acceptance

Remove the live-form banner saying “Enquiry form: your answers are sent securely through Tally when you submit.” from both homepage and enquiry page. Preserve the embed and hosted-form fallback link. The user supplied this correction while reviewing the local Cloudflare preview.
