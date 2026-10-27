---
type: Ticket
title: "BK-001–003 — Bento Kumiko website delivery"
description: "Approved isolated Codex implementation, review and delegated local acceptance."
tags: [software-factory, bentokumiko, website]
timestamp: 2026-10-27T23:24:25+09:00
---

# Bento Kumiko delivery assignment

Status: approved by Codex under the user's explicit request to prepare tickets, manage/review, use a GPT-5.6 Sol High Codex worker and perform acceptance on their behalf. Local acceptance is delegated; public GitHub creation/push, DNS changes and deployment are outside this preparation request.

## Scope and fixed reference

Source: `/Users/adusingi/Documents/Code/p/bentokumiko-japanguide`. Five HTML design artifacts exist: index, about, service, blog and enquire. The requested homepage-preview.html is absent; index.html is the homepage reference. The source has no Git repository. Original files remain intact. A dedicated `.factory-bentokumiko-local/workspace` repository holds exact copies and the implementation. Use only this workspace for implementation. Manager owns commits and acceptance. Existing `.factory`, other projects and source folder are outside worker writes. Use subscription login only; stop on auth/quota errors without substituting models/providers or API keys.

## BK-001 — maintainable travel planner site

Preserve supplied warm ivory/burgundy editorial design, typography, imagery, actual copy and responsive layout. Build a small static site with shared layout/components, design tokens, readable page content and a deterministic build. Prefer dependency-free Node static templates over a heavy application framework for this brochure site. Extract and deduplicate embedded base64 images into local assets. All five original .html URLs must work. Add the missing testimonials.html using only actual supplied quote(s); pending testimonials must not look like published ratings. Fix broken links/anchors and mobile navigation. Accessible landmarks, skip link, labels, visible focus, reduced-motion behavior. No invented prices, biographies, testimonials or integration capabilities. Preserve real Dokomaps links. Sample historic costs must be labelled illustrative, not current guaranteed quotes.

## BK-002 — enquiry form and Tally seam

Provide a styled, accessible trip enquiry form with name/email, preferred English/French, travel timing, duration, party, destinations, interests, pace, rough budget, extra notes and optional call preference. Validate required fields. Existing form falsely reports receipt; remove that behavior. Until Tally is configured, conspicuously identify this as a preview that sends nothing; allow validating/previewing answers, never claim enquiry delivery. Keep personal answers out of logs, URLs and persistent browser storage. One clearly documented Tally form-ID setting switches to a real published Tally embed with direct hosted-form fallback and usable no-JS behavior. Do not invent or call a Tally submission API. Document exact field mapping and activation steps using https://tally.so/help/embed-your-form. Test unconfigured, configured-render and invalid configuration states without sending real data. No public technical setup instructions in visitor flow beyond honest availability messaging.

## BK-003 — deployment and GitHub preparation

Deliver Dockerfile and nginx config to serve production static output, health endpoint, real 404, appropriate asset caching and security headers that permit configured Tally and fonts. Keep reproducible build and dependencies minimal. Add local preview scripts and meaningful checks for page/link/asset integrity and form configuration, GitHub Actions checks on main/development, ignore rules and Docker context exclusions. Domain/canonicals/sitemap/robots for https://bentokumiko.com. Document Dokploy Dockerfile build, container port, domain/HTTPS, branch choices, environment/config build-time behavior and rollback. Official references https://docs.dokploy.com/docs/core/domains and https://docs.dokploy.com/docs/core/dockerfile. Provide concise README, AGENTS.md, content map and tomorrow checklist (Tally ID, photo, final pricing, pending testimonials/content, GitHub remote and hosting/DNS). Manager will create main and development refs after verification. No publishing or remote creation.

## Verification and handoff

Worker may execute local checks/builds but manager independently reruns them. Include meaningful tests for navigation/page/assets, output boundaries, form validation and Tally rendering. Manager performs browser checks at desktop/mobile, reviews exact candidate and records acceptance. Do not commit or change branches. Report changed files, commands/results, limitations and remaining owner inputs. Implementation fixes are returned to the worker.

## Markdown conventions

Every created or meaningfully edited Markdown concept has YAML frontmatter with nonempty type, title, short description, tags and current Asia/Tokyo timestamp including +09:00 (generate with TZ=Asia/Tokyo date). Use types AgentInstructions, Guide, Ticket, Review, Delegation, Backlog or Convention where suitable. index.md/log.md are reserved navigation/history files. Use repository-root document links. Include concise AGENTS instructions pointing to the actual content/config/build paths. Avoid duplicating facts discoverable in package scripts. Validate every Markdown file with `/Users/adusingi/.claude/skills/okf/scripts/validate-okf.py`; the validator may return zero despite issues, so inspect output and require no issues. Read the provided conventions and writing guidance before creating docs.
