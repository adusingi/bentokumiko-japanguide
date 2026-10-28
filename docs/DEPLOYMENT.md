---
type: Guide
title: "Bento Kumiko deployment"
description: "Dokploy and Cloudflare deployment paths, branch ownership, configuration and rollback guide."
tags: [bento-kumiko, dokploy, cloudflare, deployment]
timestamp: 2026-10-28T16:32:33+09:00
---

# Deployment

The site supports two independent hosting paths. The existing Docker image builds with Node and serves from nginx on container port `8080`. The prepared Cloudflare Workers path uploads only generated static assets from `dist/`; it has no Worker script or database binding. Both preserve `/health`, explicit `.html` links and the branded 404 response.

## Dokploy application

1. Create an Application from the GitHub repository and select the intended branch: `development` for a review environment, `main` for production.
2. Choose **Dockerfile** build type. Set Dockerfile Path to `Dockerfile` and Docker Context Path to `.`. Leave Docker Build Stage empty so the final nginx stage is used. These fields follow Dokploy's current [Build Type guidance](https://docs.dokploy.com/docs/core/applications/build-type).
3. Add the public build-time argument `TALLY_FORM_ID` only after the published form passes the [activation checklist](/docs/TALLY.md). Keep it empty for an honest preview deployment. A change requires a rebuild/redeploy.
4. Deploy, then configure the domain host `bentokumiko.com`, path `/`, container port `8080`, and HTTPS with Let's Encrypt. Dokploy distinguishes this internal routing port from a publicly exposed host port; see [Domains](https://docs.dokploy.com/docs/core/domains).
5. Point the domain's DNS record to the Dokploy server, enable HTTPS, and verify `/health`, a known page and a deliberately missing path.

The nginx Content Security Policy permits the configured Tally frame and Google Fonts while denying framing of this site, plugins, cameras, microphones and geolocation. HTML revalidates; extracted content-addressed images cache for one year; CSS and JavaScript cache for one hour.

## Branch and release flow

Use only `development` and `main` on GitHub. Keep a private repository unless the owner deliberately chooses otherwise, make `main` the default and production branch, and use `development` for owner review and preview builds. Promote an accepted `development` commit to `main`; do not deploy an unreviewed development commit. GitHub Actions runs static checks, an offline Wrangler deployment dry run and the Docker build on both branches.

## Cloudflare Workers Static Assets

The local Wrangler configuration is preparation only: it contains no routes or custom domains and cannot take over `bentokumiko.com` by itself. Before any remote setup or DNS change, follow the [Cloudflare and OVH preparation guide](/docs/CLOUDFLARE.md). That guide records the exact Git integration settings, local checks, DNS/mail preservation sequence, domain cutover and optional future D1 limits.

## Rollback

Record the last accepted commit and successful deployment before promotion. For Dokploy, redeploy the known-good deployment or rebuild its commit with the matching build arguments. For Cloudflare, roll back to the prior Worker deployment or redeploy the known-good commit; DNS rollback is a separate, deliberately reviewed operation described in the [Cloudflare guide](/docs/CLOUDFLARE.md). Recheck `/health`, homepage, explicit page URLs, enquiry mode and a 404 after either rollback.
