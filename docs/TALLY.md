---
type: Guide
title: "Tally enquiry activation"
description: "Field mapping, build setting and verification steps for the live Tally enquiry form."
tags: [bento-kumiko, tally, forms]
timestamp: 2026-10-28T00:15:27+09:00
---

# Tally enquiry activation

The single integration setting is `TALLY_FORM_ID`. An empty value builds the local validation preview; a valid alphanumeric ID builds a Tally iframe and a direct `tally.so/r/{ID}` fallback. A malformed value stops the build. This is build-time public configuration, not a secret.

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

## Activate

1. Complete the form's recipient, privacy wording and confirmation message in Tally, then publish it.
2. In Tally's **Share** tab, select a standard embed and copy the form ID from the published URL or embed. Tally documents the current flow in [Embed your form](https://tally.so/help/embed-your-form).
3. Build with only the ID, not a URL: `TALLY_FORM_ID=abc123 pnpm build`.
4. Run `pnpm test`; its isolated configured-render test uses a harmless fixture ID, never submits data and leaves any existing configured `dist/` unchanged. An exported `TALLY_FORM_ID` does not alter the test fixtures.
5. Preview the real configured build and verify both the iframe and hosted-form fallback before deployment.

For Dokploy, set `TALLY_FORM_ID` under Docker **Build Time Arguments** and redeploy. Changing the ID requires a rebuild because the site is static. Do not add a Tally API call or duplicate submission handler; Tally owns submission inside the published form.

## Privacy behavior

In preview mode, text controls have no submission names, the form uses non-network `dialog` submission semantics, and JavaScript only reports completeness in the current DOM. It does not use logs, query strings, cookies, local storage or session storage. In configured mode, the visitor submits directly within Tally's form and can open the same published form on Tally when the iframe is unavailable.
