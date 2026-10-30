---
type: Guide
title: "Bento Kumiko deployment"
description: "Current Cloudflare release, verification and rollback process with an optional Docker alternative."
tags: [bento-kumiko, cloudflare, deployment, rollback]
timestamp: 2026-10-30T11:41:27+09:00
---

# Deployment

The production site is hosted by the `bento-kumiko` Cloudflare Worker using Workers Static Assets. It serves `bentokumiko.com` and `www.bentokumiko.com`; Cloudflare is authoritative for DNS and DNSSEC, while OVHcloud remains the registrar and renewal provider.

The previous Dokploy site is stopped. The repository's Docker and nginx files remain a tested alternative packaging path, not the active production host.

## Release flow

1. Prepare and review changes on `development`.
2. Run the repository checks and obtain owner acceptance before promoting the exact accepted revision to `main`.
3. From a clean local checkout of that accepted `main` revision, install the pinned dependencies and validate the upload:

   ```sh
   pnpm install --frozen-lockfile
   pnpm test
   pnpm cloudflare:dry-run
   ```

4. Record the accepted commit and current successful Cloudflare deployment for rollback.
5. With explicit release authority and the existing authenticated Wrangler session, deploy locally:

   ```sh
   pnpm cloudflare:deploy
   ```

6. Verify both hostnames over HTTPS, `/`, `/service.html`, `/shopping.html`, `/enquire.html`, `/health`, a known asset and an unknown path that must return the branded 404 with status 404. Confirm the intended trip and shopping form embeds and their direct fallback links without sending customer data.

Pushing `main` does not deploy production. GitHub Actions is configured for pushes and pull requests to `development` and `main`, but the latest release had no observed remote run; check the actual run before relying on it.

## Build configuration

An ordinary build uses the approved public trip form ID `6DDMge`. A different approved trip ID can be supplied with `TALLY_FORM_ID`; an explicit empty value disables only the trip form and leaves the shopping form `Vpp72g` live. These are public build settings, not secrets. See [Tally enquiry activation](/docs/TALLY.md) before changing form configuration.

`dist/` is generated and must not be edited by hand. Wrangler uploads only that directory. The Cloudflare routing and cache behavior are documented in [Cloudflare operations](/docs/CLOUDFLARE.md).

## Application rollback

For a bad application release, use Cloudflare deployment history to restore the recorded known-good deployment, or locally deploy the previously accepted `main` commit with the same public build settings. Re-run the production verification list after rollback.

An application rollback does not require DNS or nameserver changes. Treat any DNS rollback as a separate incident and follow the DNSSEC-safe procedure in [Cloudflare operations](/docs/CLOUDFLARE.md).

## Optional Docker packaging

The Docker image builds the same static output with Node and serves it from nginx on container port `8080`:

```sh
docker build --build-arg TALLY_FORM_ID=6DDMge --tag bento-kumiko .
docker run --rm -p 8080:8080 bento-kumiko
```

Open `http://127.0.0.1:8080` and verify `/health`. Using this image for hosting would require a separately approved infrastructure change; it is not part of the current Cloudflare release flow.
