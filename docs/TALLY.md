---
type: Guide
title: "Tally enquiry activation"
description: "English and French trip and shopping form build modes, ownership, readiness gates and verification steps."
tags: [bento-kumiko, tally, forms, french]
timestamp: 2026-10-30T17:06:11+09:00
---

# Tally enquiry activation

The owner-supplied public trip form ID `6DDMge` is the ordinary-build default. `TALLY_FORM_ID` can override that trip form; an explicit empty value builds its local validation preview, a valid alphanumeric ID builds a Tally iframe and direct `tally.so/r/{ID}` fallback, and a malformed value stops the build. The separate shopping page always uses the approved public form ID `Vpp72g`, with its own iframe title and hosted-form fallback. These IDs are public build configuration, not secrets.

The published trip form view contains all 12 mapped fields and required states, including English/French and the three call choices. This integration work did not submit either form or verify their Tally account recipients, notifications, privacy wording, confirmation behavior or actual delivery; those remain owner checks.

The owner creates and translates two separate French Tally forms. `FRENCH_TALLY_FORM_ID` configures the French trip form used by `/fr/` and `/fr/contact.html`; `FRENCH_SHOPPING_TALLY_FORM_ID` configures the French shopping form used by `/fr/shopping.html`. When either value is absent, only that French journey shows a disclosed, noninteractive placeholder. The repository does not contain, translate or imitate the owner’s French Tally questions.

Activating Tally replaces the current custom preview with a Tally iframe. The same fields can be recreated in Tally, but the iframe does not reuse the preview's HTML or styles, so exact visual parity is not automatic. Tally provides embeds for free and includes theme, color and Google Font choices in its free customization options; [custom CSS](https://tally.so/help/add-custom-styles) and [removing Tally branding](https://tally.so/help/embed-your-form) require Tally Pro. See Tally's [customization FAQ](https://tally.so/help/faq) for the current plan distinctions.

## Existing English trip mapping

This table documents the existing English trip form and stable website vocabulary. It is not a brief for translating or creating the French forms; the owner owns their questions, choices and messages.

| Website key | Tally label | Tally type | Required |
|---|---|---|---|
| `name` | Your name | Short answer | Yes |
| `email` | Your email | Email | Yes |
| `language` | Preferred language | Multiple choice: English, French | Yes |
| `travel_when` | When would you like to travel? | Short answer | Yes |
| `days` | How many days? | Number or short answer | Yes |
| `who` | Who is travelling? | Short answer | Yes |
| `where` | Where in Japan do you want to go? | Short answer | No |
| `loves` | What do you love? | Long answer | Yes |
| `travel_style` | How do you like to travel? | Long answer | No |
| `budget` | Rough budget | Short answer | No |
| `anything_else` | Anything else I should know? | Long answer | No |
| `call_preference` | Would you like a call to talk it through? | Multiple choice | No |

## Build modes and verification

1. Run `pnpm build` to use the supplied English trip form `6DDMge` and English shopping form `Vpp72g`; both French journeys remain safe placeholders while their IDs are unavailable.
2. To use a different approved published trip form, build with only its ID, not a URL: `TALLY_FORM_ID=abc123 pnpm build`. This does not change the dedicated shopping form.
3. For explicit local review of the trip preview, run `TALLY_FORM_ID= pnpm build`. The trip preview validates fields locally and sends nothing; the shopping page still uses its approved live Tally form.
4. To review owner-supplied French forms locally, pass both published IDs: `FRENCH_TALLY_FORM_ID=<trip-id> FRENCH_SHOPPING_TALLY_FORM_ID=<shopping-id> pnpm build`. Values must be alphanumeric, distinct from each other and distinct from both English IDs. A single supplied French ID activates only its matching journey.
5. Run `pnpm test`; its isolated checks cover the separated English defaults, trip override, explicit English preview, independent French placeholders/configuration, malformed or reused IDs, hosted fallbacks and the production gate without submitting data or changing an existing configured `dist/`. Synthetic French IDs exist only in these isolated temporary test outputs.
6. Before production or after any Tally-side edit, verify all four responsive iframes and hosted-form fallbacks, then confirm the owner-side recipient, delivery, notification, privacy and confirmation settings in Tally. The shopping forms’ transport helper must state that return transport from Okayama is charged at cost for all four cities.

## Production-readiness gate

Ordinary `pnpm build`, `pnpm test` and `pnpm cloudflare:dry-run` remain available while French forms are pending. The authorized production deploy must set `REQUIRE_PRODUCTION_READY=1` together with both real French IDs and `FRENCH_TESTIMONIAL_APPROVED=1`. The build stops before upload when an ID is missing, malformed, reused or shared between the two French journeys, or when testimonial approval has not been recorded for that release command. The exact release command is maintained in [Deployment](/docs/DEPLOYMENT.md).

The testimonial flag records owner approval of the website translation only. It does not approve, create or change anything in Tally.

The configured pages use Tally's official widget script and `dynamicHeight=1` embed option so each iframe follows its form across viewport sizes and form pages. The host page does not style the cross-origin forms. See Tally's [embed guide](https://tally.so/help/embed-your-form) and [widget embed documentation](https://developers.tally.so/widgets/embeds).

For the optional Docker build, leave `TALLY_FORM_ID` unset to use the English trip default, pass another approved public trip ID as a build argument to override it, or pass an explicit empty value for English trip preview mode. The English shopping form remains `Vpp72g`. French values use the two build arguments named above. A production-ready container also passes `REQUIRE_PRODUCTION_READY=1` and the testimonial approval flag. Changing any mode or ID requires a rebuild because the site is static. Do not add a Tally API call or duplicate submission handler; Tally owns submission inside each published form.

## Privacy behavior

In English trip preview mode, text controls have no submission names, the form uses non-network `dialog` submission semantics, and JavaScript only reports completeness in the current DOM. French placeholders contain no controls at all. Neither mode uses logs, query strings, cookies, local storage or session storage. In configured mode, the visitor submits directly within the relevant Tally form and can open the same published form on Tally when the iframe is unavailable.
