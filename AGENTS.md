---
type: AgentInstructions
title: "Bento Kumiko agent instructions"
description: "Pointers and completion checks for agents changing the static website."
tags: [bento-kumiko, agents, website]
timestamp: 2026-10-28T00:15:27+09:00
---

# Bento Kumiko agent instructions

Edit authored content in `src/pages/`, shared chrome/forms in `src/components/`, and presentation in `src/styles/`; `dist/` is generated.

For enquiry fields or activation behavior, read [Tally activation](/docs/TALLY.md). For Docker, nginx, domains, branches or rollback, read [deployment](/docs/DEPLOYMENT.md). For copy and pending owner material, read the [content map](/docs/CONTENT-MAP.md) and [owner checklist](/docs/TOMORROW.md).

Preserve real Dokomaps URLs and distinguish historic illustrative costs from current quotes. Publish testimonials only from supplied, approved words. Use the pnpm version declared in `package.json`, install with `pnpm install --frozen-lockfile`, and complete every change with `pnpm test`; changes to deployment behavior also require a local Docker build when Docker is available.
