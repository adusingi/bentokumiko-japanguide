---
type: Ticket
title: "BK-006 — Add supplied guest testimonials"
description: "Approved attribution correction and French testimonial, retaining Lee as pending."
tags: [software-factory, bentokumiko, content]
timestamp: 2026-10-28T08:46:57+09:00
---

# BK-006

Status: approved by the user's supplied testimonial and request to add it. Same GPT-5.6 Sol High Codex worker implements; manager reviews and accepts under existing delegation. Base: c612dc654fdf984ad8f9ac8dbe5b4e9581c9422c.

Replace the anonymous attribution on the existing quote with exactly `Everyln & Fabiola` (user spelling) on homepage, about and testimonials pages. Preserve the existing quote and trip context. Add the following complete French quote attributed to `Heri R.` to the homepage testimonial section and dedicated testimonials page. Preserve supplied wording exactly; use lang="fr" on the French quote. No translation or invented rating. User screenshot supplies Canada and travelled with wife and two kids as optional factual context.

> Pour notre premier voyage au Japon, nous pensions à un séjour court, fort en souvenirs. Les enfants voulaient de l'aventure, les parents voulaient découvrir les uniques attraits de la culture Japonaise. Kumiko nous a préparé soigneusement une sélection d'hotels, de restaurants ainsi que les sites principaux à visiter. On a découvert un excellent restaurant basque, on s'est amusé à Universal Studios Japan, et on a aimé les hotels qu'ils ont choisi, et plus. Je recommande!

Lee's words have not arrived. Keep a concise honest pending note for Lee (screenshot names Marc Lee A., Australia); never create a quote or stars/rating. Update singular/one-trip copy and stale pending notes as needed now there are two supplied testimonials. Keep changes confined to testimonial-related content. Preserve mobile-first styling, white appearance, separate blog and existing forms. Use existing card styles or minimal responsive CSS if necessary. Update content map and owner checklist to reflect Heri received / Lee pending.

Allowed paths: src/pages/index.html, src/pages/about.html, src/pages/testimonials.html, src/styles/index.css, src/styles/testimonials.css, docs/CONTENT-MAP.md, docs/TOMORROW.md; build.mjs only if testimonial metadata needs adjusting. No dependencies or permanent tests for simple content edits. Run pnpm test, pnpm build and diff checks. Manager validates exact quote and browser layout. Do not commit/change branches/push/deploy, stop on auth/quota errors. Assignment is read-only for worker.

Every meaningfully edited Markdown requires existing OKF fields and fresh Asia/Tokyo timestamp +09:00, bundle-root links, and validation with /Users/adusingi/.claude/skills/okf/scripts/validate-okf.py. Use existing project conventions and inspect zero validator issues.
