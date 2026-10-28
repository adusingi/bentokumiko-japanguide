---
type: Guide
title: "Bento Kumiko Cloudflare and OVH preparation"
description: "Static Workers setup, Git branch settings, OVH DNS migration, cutover, rollback and future D1 guidance."
tags: [bento-kumiko, cloudflare, github, ovh, dns, d1]
timestamp: 2026-10-28T17:08:37+09:00
---

# Cloudflare and OVH preparation

This is a preparation and owner checklist, not evidence of a configured remote service. The repository does not create a GitHub repository, Cloudflare account, Worker, DNS zone, custom domain or database. Nothing here transfers domain registration away from OVHcloud or changes its renewal.

## Current architecture

The website is static. `wrangler.jsonc` points Cloudflare Workers Static Assets at `dist/`, disables automatic HTML URL rewriting so existing `.html` links remain canonical, and uses `404.html` for missing assets. The build copies `_headers` and a root-only `/` to `/index.html` proxy into `dist/`. There is no Worker script, route, custom domain or D1 binding.

Cloudflare documents static asset requests and asset storage as free, with no Worker invocation needed for matched files. This project deliberately stays on that static path; review current [Static Assets billing and limitations](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/) before activation.

## Local preparation checks

Install exactly what the lockfile records and run the full checks:

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm cloudflare:dry-run
```

`pnpm cloudflare:dry-run` rebuilds `dist/` and asks the pinned Wrangler version to prepare an upload without logging in or sending a deployment. It validates packaging, not live routing, TLS, DNS, email or account permissions.

To inspect Cloudflare routing locally, run `pnpm cloudflare:dev`. This rebuilds the site and starts Wrangler's local server; stop it with Ctrl-C. The existing nginx-oriented preview remains `pnpm preview`.

`pnpm cloudflare:deploy` is the eventual authenticated production command. It is intentionally not part of tests and must not be run until the owner approves a remote deployment. `dist/` is the only upload directory.

## GitHub and Workers Builds

Use a private GitHub repository unless the owner explicitly wants the source public. Push only `main` and `development`; make `main` the GitHub default and Cloudflare production branch, and use `development` for previews and owner acceptance. Where the GitHub plan supports branch protection for this repository, protect `main` so production promotion is reviewed. Otherwise, keep promotion manual and merge only after the manager's review and accepted checks.

When the owner connects the repository in Workers Builds, use these settings:

| Setting | Value |
| --- | --- |
| Root directory | Repository root; leave the field blank |
| Production branch | `main` |
| Preview builds | Enabled; `development` is the review branch |
| Build command | `pnpm test && pnpm build` |
| Deploy command | `pnpm exec wrangler deploy` |
| Preview command | `pnpm exec wrangler preview` |
| Build variable | `PNPM_VERSION=12.9.1` |
| Build variable | `NODE_VERSION=22` |
| Optional public build variable | `TALLY_FORM_ID=<approved published form ID>` |

Including `pnpm test` in Cloudflare's build command makes a failing site check stop that build before deployment instead of relying on the timing of GitHub Actions.

The exact pnpm version is also pinned by `packageManager` in `package.json`. Cloudflare's current build image supports that field and `PNPM_VERSION`; see [build image tool versions](https://developers.cloudflare.com/workers/ci-cd/builds/build-image/). New Workers use `wrangler preview` for non-production builds, not the older `wrangler versions upload` model; see [build branch control](https://developers.cloudflare.com/workers/ci-cd/builds/build-branches/) and [build command settings](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/).

`TALLY_FORM_ID` is a public build setting, not a secret. Leave it unset for the honest non-submitting preview form, and add it only after the [Tally activation checklist](/docs/TALLY.md) is complete. Preview and production settings are independent in Cloudflare, so verify both deliberately.

Do not add `routes` or custom domains to `wrangler.jsonc`. That keeps a repository build from automatically taking over live hostnames.

## OVHcloud DNS migration

OVHcloud remains the registrar and renewal provider. Cloudflare becomes authoritative DNS only after the owner changes the domain's nameservers at OVHcloud. OVHcloud warns that changing nameservers does not copy the old zone automatically, so the new zone must be reconciled first; use the official [OVHcloud nameserver guide](https://docs.ovhcloud.com/en/guides/web-cloud/domains/dns-server-edit) alongside Cloudflare's [full-zone setup](https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/).

1. Export or otherwise record the complete active OVHcloud DNS zone. Do not treat one screenshot as a complete inventory and do not copy credentials or private keys into this repository.
2. Add `bentokumiko.com` to a Cloudflare Free DNS zone. Reconcile every record before delegation. Preserve all MX, DKIM and TXT records, including Zoho verification, SPF and DMARC if present. Preserve service subdomains and keep all hostnames used for mail DNS-only. Do not proxy a hostname merely because Cloudflare offers to do so.
3. Preserve the existing apex and `www` web records pointing to `157.245.192.178`, plus the existing `admin.bentokumiko.com` A record, as DNS-only records during the DNS-provider move. This prevents the authority change from also changing the old hosting path or Cloudflare TLS behavior. Nameserver migration and website cutover are separate changes.
4. Check DNSSEC and the parent-zone DS record before changing nameservers. The straightforward sequence is to disable the old DNSSEC/DS configuration at OVHcloud, wait for its TTL to expire, then replace the OVHcloud nameservers with the two nameservers assigned by Cloudflare. Changing nameservers while the old DS chain remains can make the domain return `SERVFAIL`. After Cloudflare reports the zone active, enable DNSSEC in Cloudflare and publish its new DS information at OVHcloud. Cloudflare documents this sequence in its [DNSSEC migration guidance](https://developers.cloudflare.com/dns/dnssec/) and [full-zone setup](https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/).
5. Verify delegation and every imported record before changing web hosting. Confirm the website still reaches the old host, `admin` still reaches its existing host, Zoho verification remains present, and inbound/outbound mail plus SPF, DKIM and DMARC checks still pass.

## Website cutover

First deploy and test the generated `workers.dev` hostname. A successful local dry run cannot verify Cloudflare account configuration, edge headers, certificates, custom domains or public DNS.

Only during an approved web cutover:

1. Record the last accepted Worker deployment and the current apex/`www` A-record values for rollback.
2. Add `bentokumiko.com` as a Worker Custom Domain. Replace the old apex web record only as part of this step; Cloudflare creates the Worker-facing DNS record and certificate. Custom Domains require an active Cloudflare zone and are exact-hostname routes, as described in the [Custom Domains guide](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/).
3. Handle `www.bentokumiko.com` deliberately. Add it as a second Custom Domain if both hostnames should serve the site, or create Cloudflare's documented proxied `www` record plus an HTTPS redirect rule to the apex. Replace the existing `www` A record only when that choice is approved. Do not touch `admin` or mail records.
4. Test the `workers.dev` URL and then apex/`www`: HTTPS, the chosen canonical redirect, `/`, `/about.html`, `/health`, an unknown path returning the branded 404 with status 404, security/cache headers, assets and the intended enquiry mode. Retest mail delivery after cutover.

The site keeps explicit `.html` links. `html_handling: "none"` prevents Cloudflare from redirecting those URLs, while the root-only proxy makes `/` serve `index.html`; review [Cloudflare HTML handling](https://developers.cloudflare.com/workers/static-assets/routing/advanced/html-handling/), [custom 404 handling](https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/) and [static redirects/proxying](https://developers.cloudflare.com/workers/static-assets/redirects/).

## Rollback

For a bad application release, use Cloudflare's deployment history to roll back to the recorded known-good deployment, or redeploy that accepted commit. Recheck the full website list above.

For a web-domain cutover failure, remove the affected Custom Domain/redirect and restore only the recorded apex/`www` web records to `157.245.192.178`; leave mail and `admin` records untouched. DNS caches and certificates may take time to converge.

Roll back nameservers only for a DNS-zone failure, not an ordinary site release. First ensure the OVHcloud zone still contains the complete reconciled record set. If Cloudflare DNSSEC is active, disable it and remove its DS record at the OVHcloud registrar, then wait for the DS record's TTL to expire before restoring the OVHcloud nameservers. Re-enable signing only after OVHcloud is authoritative and only with DS information that matches the active OVHcloud keys; never reuse Cloudflare's DS information. Test web, admin and mail again.

## SQLite and D1 later

No database is required today: the website is static and Tally handles configured enquiries externally. Domain renewal, Tally and Zoho plans remain separate from Cloudflare hosting.

Cloudflare D1 is a managed SQLite option if a future approved feature genuinely needs storage. It would require a Worker API with authorization, validation, privacy and retention design; browser JavaScript must not connect directly to a database. Do not add a D1 binding or collect enquiry data without a separate ticket and owner decision.

As verified against Cloudflare's current [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/) and [D1 limits](https://developers.cloudflare.com/d1/platform/limits/) on 2026-10-28, the Free plan includes 5 million rows read per day, 100,000 rows written per day, 5 GB total account storage and a 500 MB maximum per database. These are platform limits, not a capacity promise; recheck them before designing or launching a backend.
