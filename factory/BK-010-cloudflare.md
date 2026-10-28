---
type: Ticket
title: "BK-010 — GitHub and Cloudflare preparation"
description: "Prepare the accepted static website for GitHub branches and free Cloudflare hosting."
tags: [software-factory, bentokumiko, deployment]
timestamp: 2026-10-28T16:28:40+09:00
---

# BK-010

User approves current UI and requests preparation for GitHub main/development, Cloudflare hosting and advice for an OVH-registered domain and SQLite. Existing delegation authorizes manager acceptance. Same Codex worker GPT-5.6 Sol High implements; manager owns Git and verification. This ticket authorizes local preparation only, not remote repository creation/push, Cloudflare deployment, DNS changes or paid resources.

Work only in /Users/adusingi/Documents/Code/p/software-factory/.factory-bentokumiko-local/workspace on development at b97b52d. Do not edit prototype worktree. No UI/copy changes or database implementation. The current site is static and has no SQLite; Tally handles eventual enquiries externally. Retain Docker/Dokploy compatibility.

Prepare Cloudflare Workers Static Assets deployment: small wrangler config, no Worker script or D1 binding, assets dist, branded 404, preserve explicit .html links and root homepage routing (verify html_handling none and root rewrite if required). Add Cloudflare _headers matching nginx security policy and sensible cache behavior without duplicate Cache-Control values. Build copies deployment files into dist. Use a pinned Wrangler dev dependency and pnpm scripts for local Cloudflare preview, offline deployment dry run and eventual deployment (never invoke actual deployment now). Keep pnpm 12.9.1, update lockfile through pnpm; avoid raising Node requirement unnecessarily. Ignore .wrangler/.dev.vars and other local credentials. Update checks/CI for build/deployment validation as appropriate; retain Docker check.

Update README and docs/DEPLOYMENT.md, or linked focused Cloudflare guide: GitHub push ONLY main and development, main default/production, development previews, recommended private repository, no claims remote configured. Cloudflare Git integration exact build/deploy/preview settings and pnpm version, optional public TALLY_FORM_ID, local dry-run/preview commands, limitations of local verification, rollback. Official current branch docs say new Workers use wrangler preview for preview builds, not older versions upload. Root dist is only upload directory. No config automatically taking over live domains.

Explain OVH registration/renewal remains; Cloudflare free DNS zone with nameservers changed at OVH after full zone export/reconciliation. Preserve all MX, DKIM, TXT incl Zoho verification, SPF/DMARC if present; do not invent keys or assume screenshot full zone. Keep admin subdomain on existing host until separately decided. Existing apex/www A records point 157.245.192.178; replace only during approved web cutover through Cloudflare custom domains. Review DNSSEC/DS migration sequence to avoid resolution failures. Test workers.dev first then apex/www HTTPS, redirects, health, 404, mail delivery. Cite official Cloudflare and OVH sources; no credentials, IDs or screenshot keys copied.

Explain free static assets and D1 SQLite option for future storage, not required today. Current free D1 quotas: 5M rows read/day,100k written/day,5GB account total,500MB per database; backend needs Worker API, browser cannot directly access SQLite. Verify current documentation before writing limits. Domain renewal and external Tally/Zoho plans separate.

Sources verified by manager: https://developers.cloudflare.com/workers/static-assets/ ; https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/ ; https://developers.cloudflare.com/workers/ci-cd/builds/build-branches/ ; https://developers.cloudflare.com/workers/ci-cd/builds/build-image/ (PNPM_VERSION and packageManager pins supported); https://developers.cloudflare.com/workers/configuration/routing/custom-domains/ ; https://developers.cloudflare.com/d1/platform/pricing/ ; https://developers.cloudflare.com/d1/platform/limits/ . Consult official docs for any other platform facts.

Run frozen install, pnpm test/build, Wrangler dry run without login/deploy, local Docker build (available), syntax/diff checks; report evidence and any limitations. Do not start/stop persistent servers or change 4173/4174; manager handles runtime smoke. No commits, branch changes, push/deploy or auth fallback; stop on quota/login failure.

All Markdown follows OKF metadata type/title/description/tags/fresh Asia-Tokyo timestamp +09:00, bundle-root links. Validate changed docs using /Users/adusingi/.claude/skills/okf/scripts/validate-okf.py; require zero reported issues. This assignment is manager-owned read-only.
