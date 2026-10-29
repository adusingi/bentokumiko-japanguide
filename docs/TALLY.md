---
type: Guide
title: "Tally enquiry activation"
description: "Trip and shopping forms, build modes, field mapping and verification steps for the Tally enquiry integration."
tags: [bento-kumiko, tally, forms]
timestamp: 2026-10-29T19:32:58+09:00
---

# Tally enquiry activation

The owner-supplied public trip form ID `6DDMge` is the ordinary-build default. `TALLY_FORM_ID` can override that trip form; an explicit empty value builds its local validation preview, a valid alphanumeric ID builds a Tally iframe and direct `tally.so/r/{ID}` fallback, and a malformed value stops the build. The separate shopping page always uses the approved public form ID `Vpp72g`, with its own iframe title and hosted-form fallback. These IDs are public build configuration, not secrets.

The published trip form view contains all 12 mapped fields and required states, including English/French and the three call choices. This integration work did not submit either form or verify their Tally account recipients, notifications, privacy wording, confirmation behavior or actual delivery; those remain owner checks.

Activating Tally replaces the current custom preview with a Tally iframe. The same fields can be recreated in Tally, but the iframe does not reuse the preview's HTML or styles, so exact visual parity is not automatic. Tally provides embeds for free and includes theme, color and Google Font choices in its free customization options; [custom CSS](https://tally.so/help/add-custom-styles) and [removing Tally branding](https://tally.so/help/embed-your-form) require Tally Pro. See Tally's [customization FAQ](https://tally.so/help/faq) for the current plan distinctions.

## Create and map the published form

Create these fields in Tally with the displayed labels and required state. The keys document the stable website vocabulary; match each key in Tally's internal notes or integration mapping if downstream automation is added later.

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

1. Run `pnpm build` to use the supplied trip form `6DDMge` and shopping form `Vpp72g`.
2. To use a different approved published trip form, build with only its ID, not a URL: `TALLY_FORM_ID=abc123 pnpm build`. This does not change the dedicated shopping form.
3. For explicit local review of the trip preview, run `TALLY_FORM_ID= pnpm build`. The trip preview validates fields locally and sends nothing; the shopping page still uses its approved live Tally form.
4. Run `pnpm test`; its isolated checks cover both separated default forms, the trip override, explicit trip preview and malformed trip configuration without submitting data or changing an existing configured `dist/`.
5. Before production, verify both responsive iframes and hosted-form fallbacks, then confirm the owner-side recipient, notification, privacy and confirmation settings in Tally.

The configured pages use Tally's official widget script and `dynamicHeight=1` embed option so each iframe follows its form across viewport sizes and form pages. The host page does not style the cross-origin forms. See Tally's [embed guide](https://tally.so/help/embed-your-form) and [widget embed documentation](https://developers.tally.so/widgets/embeds).

For Dokploy, leave `TALLY_FORM_ID` unset to use the Docker trip default, set another approved trip ID under Docker **Build Time Arguments** to override it, or set an explicit empty value for trip preview mode. The shopping form remains `Vpp72g`. Changing the trip mode or ID requires a rebuild because the site is static. Do not add a Tally API call or duplicate submission handler; Tally owns submission inside each published form.

## Privacy behavior

In trip preview mode, text controls have no submission names, the form uses non-network `dialog` submission semantics, and JavaScript only reports completeness in the current DOM. It does not use logs, query strings, cookies, local storage or session storage. In configured mode, the visitor submits directly within the relevant Tally form and can open the same published form on Tally when the iframe is unavailable.
