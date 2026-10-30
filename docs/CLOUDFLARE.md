---
type: Guide
title: "Bento Kumiko Cloudflare operations"
description: "Bilingual Workers Static Assets routing, DNS safety, guarded release verification and rollback guidance."
tags: [bento-kumiko, cloudflare, ovh, dns, deployment, french]
timestamp: 2026-10-30T18:05:02+09:00
---

# Cloudflare operations

## Current architecture

The `bento-kumiko` Cloudflare Worker serves the generated `dist/` directory through Workers Static Assets at `bentokumiko.com` and `www.bentokumiko.com`. Cloudflare is authoritative for DNS and DNSSEC. OVHcloud remains the domain registrar and renewal provider.

`wrangler.jsonc` deliberately contains only static-assets configuration: no Worker script, route declaration, database binding or account identifier. Existing English `.html` URLs remain canonical. French pages use `/fr/` plus explicit French `.html` addresses. The generated `_redirects` file narrowly rewrites `/` and `/fr/` to their index files and redirects `/fr` to `/fr/`. Cloudflare’s nearest-directory error handling uses `/404.html` for root paths and `/fr/404.html` for nested French paths. The generated `_headers` file defines security and cache headers.

The site has no database. Configured trip and shopping enquiries are hosted by Tally; adding D1 or another backend requires a separate approved design and privacy review.

## Local validation

Install the lockfile and validate the static output before release:

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm cloudflare:dry-run
```

`pnpm cloudflare:dry-run` rebuilds `dist/` and prepares an upload without deploying it. For local runtime inspection, use `pnpm cloudflare:dev`; the nginx-oriented static preview remains `pnpm preview`.

These local checks cannot prove account permissions, public DNS, certificates, remote headers or Tally delivery settings.

## Production release

Production is deployed with manager-authorized local Wrangler from the accepted `main` revision and the readiness variables documented in [Deployment](/docs/DEPLOYMENT.md):

```sh
pnpm cloudflare:deploy
```

The package command sets `REQUIRE_PRODUCTION_READY=1`, rebuilds the site, and proceeds to Wrangler only after the form-readiness gate passes. Passing the gate does not grant release authority. The command is intentionally separate from `pnpm test` and must not be run without release authority. GitHub pushes do not automatically deploy this Worker. GitHub Actions is configured to check pushes and pull requests, but verify the actual run rather than assuming it passed.

After deployment, verify:

- apex and `www` HTTPS behavior
- all twelve English and French canonical pages, plus the `/fr` redirect
- `/health`, the root branded 404 and nested French branded 404 statuses
- cache and security headers for HTML, styles, scripts and images
- all four Tally embeds and hosted-form fallback links, without submitting real customer data

See the [deployment guide](/docs/DEPLOYMENT.md) for the complete promotion and rollback sequence.

## DNS and registrar safeguards

Routine site releases do not require DNS changes. Preserve mail-related hostnames and administrative hostnames as DNS-only records unless a separate reviewed change explicitly says otherwise. Do not publish zone exports, account identifiers, DS digests, credentials or private keys in this repository.

If a DNS-zone incident ever requires returning authority to OVHcloud:

1. Confirm the OVHcloud zone contains the complete current record set.
2. Disable Cloudflare DNSSEC and remove the active Cloudflare DS record at the registrar.
3. Wait for the DS record's TTL to expire before restoring the OVHcloud nameservers.
4. Re-enable signing only after OVHcloud is authoritative and only with DS information matching the active OVHcloud keys.
5. Recheck apex, `www`, administrative hosts, mail delivery, SPF, DKIM and DMARC.

Do not change nameservers for an ordinary application rollback. Use Cloudflare deployment history or redeploy a known-good accepted revision instead.

## Platform references

- [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [Static Assets routing](https://developers.cloudflare.com/workers/static-assets/routing/)
- [Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
- [Cloudflare DNSSEC](https://developers.cloudflare.com/dns/dnssec/)
- [OVHcloud nameserver changes](https://docs.ovhcloud.com/en/guides/web-cloud/domains/dns-server-edit)
