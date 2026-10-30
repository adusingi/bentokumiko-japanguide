---
type: Backlog
title: "Bento Kumiko owner follow-ups"
description: "External form, translation and publication approvals required before the bilingual website can launch."
tags: [bento-kumiko, owner-input, tally, testimonials, french]
timestamp: 2026-10-30T17:06:11+09:00
---

# Owner follow-ups

- [ ] Verify delivery, recipient, notification, privacy and confirmation settings for both the trip form `6DDMge` and shopping form `Vpp72g`. Repository checks validate embeds and form modes but do not submit either form or prove Tally-side delivery.
- [ ] Reconcile the shopping form's external transport helper with the approved website wording: return transport from Okayama is added at cost for all four cities. The earlier Tokyo-only helper has not been reverified.
- [ ] Create and publish two distinct French Tally forms, one for trip planning and one for shopping, without asking the repository worker to translate or create their questions. Supply their public IDs for `FRENCH_TALLY_FORM_ID` and `FRENCH_SHOPPING_TALLY_FORM_ID`.
- [ ] Verify each French form’s recipient, notifications, privacy wording, confirmation behavior, responsive embed and direct fallback. Confirm that the French shopping form covers return transport from Okayama at cost in all four cities. Do not approve launch based only on the website placeholder or local embed checks.
- [ ] Review the complete authored French website copy and explicitly approve or correct the labeled Everyln & Fabiola translation against the preserved English original. The guarded deploy requires `FRENCH_TESTIMONIAL_APPROVED=1` only after this approval.
- [ ] Supply and approve any additional public testimonial before publication. Everyln & Fabiola is the approved live testimonial; Heri and Peter remain hidden, and Marc Lee wording remains pending.

Implementation details and safe verification steps are in [Tally enquiry activation](/docs/TALLY.md) and the [content map](/docs/CONTENT-MAP.md).
