---
type: Ticket
title: "BK-004 — Standardize Bento Kumiko on pnpm"
description: "Approved pnpm migration using the existing GPT-5.6 Sol High worker, with delegated acceptance."
tags: [software-factory, bentokumiko, tooling]
timestamp: 2026-10-28T00:13:09+09:00
---

# BK-004 — pnpm migration

Status: approved. The user explicitly requested the same Codex worker, Docker and GitHub Actions updates, checks and acceptance on their behalf. They also requested the local start command. Implementation uses the existing worker session `01a17dc0-20ef-7853-8b0c-46b922c0da6c`, GPT-5.6 Sol High, subscription authentication only. Stop on auth/quota errors.

Base: `5246448a4faead48a49572af9f393b1eb342181c`. Workspace: `/Users/adusingi/Documents/Code/p/software-factory/.factory-bentokumiko-local/workspace`. Read its AGENTS.md and prior assignment. Manager owns commits, branch updates, review and acceptance. Source designs and other projects remain outside worker writes. No push, GitHub repository creation, deployment or model substitution.

## Deliverable

Use pnpm as the project package manager, pinned to the installed `12.9.1` unless a verified compatibility blocker requires discussion. Add the generated pnpm lockfile. Keep the application dependency-free and Node-based; preserve mobile layouts, standalone blog, form behavior, domain and runtime nginx behavior.

Update package scripts to remove nested npm execution. Configure Docker and GitHub Actions to provision the pinned pnpm version and use frozen-lockfile installation and pnpm build/test commands. Use package.json as the version authority where practical; avoid unnecessary unrelated runtime/image changes. Use current official pnpm documentation for provisioning compatibility. Update README, AGENTS.md, Tally instructions and any affected operator docs or assertion messages to pnpm. Historical acceptance logs need not be rewritten.

Give a verified copy-paste local launch sequence (workspace path, frozen install if needed, build, preview) and URL. The preview is a static server; be clear if content edits require rebuilding.

Allowed paths: package.json, pnpm-lock.yaml, Dockerfile, .github/workflows/checks.yml, .gitignore, .dockerignore, AGENTS.md, README.md, docs/, scripts/check.mjs, and factory/BK-004-pnpm.md (manager-owned assignment; read only). Additional implementation paths require a concrete reason in the handoff.

## Checks and acceptance

Run pnpm install --frozen-lockfile, pnpm test (including exported TALLY_FORM_ID fixture), pnpm build, and verify pnpm preview serves the homepage and enquiry page. Build the Docker image and smoke-check health, pages, real 404 and configured Tally rendering without real form submissions. Keep checks proportional: no new app features or new tests just asserting textual npm/pnpm replacement. Manager independently reruns relevant checks and reviews the candidate before accepting and moving local main/development refs.

## Documentation rules

Use the existing OKF conventions: each created or meaningfully edited Markdown concept includes type, title, description, tags, and fresh Asia/Tokyo timestamp with +09:00. Follow writing-for-agents for AGENTS.md, keeping pointers concise. Read ../OKF-CONVENTIONS.md and ../writing-for-agents.md if needed. Validate changed Markdown with python3 /Users/adusingi/.claude/skills/okf/scripts/validate-okf.py and inspect for zero issues. Keep links repository-root relative. Report changes, checks, limitations and exact launch command; do not commit or change branches.
