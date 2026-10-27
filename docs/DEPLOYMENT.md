---
type: Guide
title: "Bento Kumiko deployment"
description: "Dokploy Dockerfile deployment, domain, configuration and rollback guide."
tags: [bento-kumiko, dokploy, deployment]
timestamp: 2026-10-27T23:29:33+09:00
---

# Deployment

The production image builds the static site with Node and serves it from nginx on container port `8080`. `/health` returns `200 ok`; missing paths return the branded `404.html` with status 404.

## Dokploy application

1. Create an Application from the GitHub repository and select the intended branch: `development` for a review environment, `main` for production.
2. Choose **Dockerfile** build type. Set Dockerfile Path to `Dockerfile` and Docker Context Path to `.`. Leave Docker Build Stage empty so the final nginx stage is used. These fields follow Dokploy's current [Build Type guidance](https://docs.dokploy.com/docs/core/applications/build-type).
3. Add the public build-time argument `TALLY_FORM_ID` only after the published form passes the [activation checklist](/docs/TALLY.md). Keep it empty for an honest preview deployment. A change requires a rebuild/redeploy.
4. Deploy, then configure the domain host `bentokumiko.com`, path `/`, container port `8080`, and HTTPS with Let's Encrypt. Dokploy distinguishes this internal routing port from a publicly exposed host port; see [Domains](https://docs.dokploy.com/docs/core/domains).
5. Point the domain's DNS record to the Dokploy server, enable HTTPS, and verify `/health`, a known page and a deliberately missing path.

The nginx Content Security Policy permits the configured Tally frame and Google Fonts while denying framing of this site, plugins, cameras, microphones and geolocation. HTML revalidates; extracted content-addressed images cache for one year; CSS and JavaScript cache for one hour.

## Branch and release flow

Use `development` for owner review and Tally/photo/content checks. Promote the accepted commit to `main`, then deploy production from `main`. GitHub Actions runs static and Docker builds on both branches.

## Rollback

Record the last accepted commit or successful Dokploy deployment before promotion. If verification fails, redeploy that known-good deployment in Dokploy or select its commit and rebuild. Recheck `/health`, homepage, enquiry mode and a 404 after rollback. Configuration is baked into the image, so roll back the image/deployment and its matching build arguments together.
