import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { planOutputDirectory, prepareOutputDirectory } from "./lib/output-directory.mjs";
import { renderEnquiry } from "./src/components/enquiry.mjs";
import { renderLayout } from "./src/components/layout.mjs";
import { canonicalFor, pages, publicPageKeys } from "./src/i18n/site.mjs";

const root = path.dirname(fileURLToPath(import.meta.url));
const tallyFormId = process.env.TALLY_FORM_ID ?? "6DDMge";
const shoppingTallyFormId = "Vpp72g";
const frenchTallyFormId = process.env.FRENCH_TALLY_FORM_ID ?? "";
const frenchShoppingTallyFormId = process.env.FRENCH_SHOPPING_TALLY_FORM_ID ?? "";
const productionReadinessRequired = process.env.REQUIRE_PRODUCTION_READY === "1";
const frenchTestimonialApproved = process.env.FRENCH_TESTIMONIAL_APPROVED === "1";

for (const [name, value] of Object.entries({
  TALLY_FORM_ID: tallyFormId,
  FRENCH_TALLY_FORM_ID: frenchTallyFormId,
  FRENCH_SHOPPING_TALLY_FORM_ID: frenchShoppingTallyFormId,
})) {
  if (value && !/^[A-Za-z0-9]+$/.test(value)) {
    throw new Error(`${name} must contain only letters and numbers (for example: wA2xyz). Build stopped.`);
  }
}

const frenchIds = [frenchTallyFormId, frenchShoppingTallyFormId].filter(Boolean);
if (frenchIds.length === 2 && frenchTallyFormId === frenchShoppingTallyFormId) {
  throw new Error("FRENCH_TALLY_FORM_ID and FRENCH_SHOPPING_TALLY_FORM_ID must identify two different forms. Build stopped.");
}
if (frenchIds.some((id) => id === tallyFormId || id === shoppingTallyFormId)) {
  throw new Error("French form IDs must not reuse either English form ID. Build stopped.");
}
if (productionReadinessRequired) {
  const missing = [];
  if (!frenchTallyFormId) missing.push("FRENCH_TALLY_FORM_ID");
  if (!frenchShoppingTallyFormId) missing.push("FRENCH_SHOPPING_TALLY_FORM_ID");
  if (!frenchTestimonialApproved) missing.push("FRENCH_TESTIMONIAL_APPROVED=1");
  if (missing.length) {
    throw new Error(`Production readiness failed: ${missing.join(", ")} ${missing.length === 1 ? "is" : "are"} required. No deployment-ready build was created.`);
  }
}

const outputPlan = await planOutputDirectory({
  repositoryRoot: root,
  requestedOutput: process.env.SITE_OUTPUT_DIR || "dist",
});
const { output } = outputPlan;
await prepareOutputDirectory(outputPlan);
await mkdir(path.join(output, "assets"), { recursive: true });
await cp(path.join(root, "src/assets"), path.join(output, "assets"), { recursive: true });
await mkdir(path.join(output, "assets/styles"), { recursive: true });
await cp(path.join(root, "src/styles"), path.join(output, "assets/styles"), { recursive: true });
await cp(path.join(root, "cloudflare/_headers"), path.join(output, "_headers"));
await cp(path.join(root, "cloudflare/_redirects"), path.join(output, "_redirects"));

for (const [page, definition] of Object.entries(pages)) {
  for (const locale of ["en", "fr"]) {
    let body = await readFile(path.join(root, "src/pages", definition.source[locale]), "utf8");
    const hasEnquiryForm = body.includes("{{ENQUIRY_FORM}}");
    const hasShoppingEnquiryForm = body.includes("{{SHOPPING_ENQUIRY_FORM}}");
    const tripId = locale === "fr" ? frenchTallyFormId : tallyFormId;
    const shoppingId = locale === "fr" ? frenchShoppingTallyFormId : shoppingTallyFormId;
    body = body.replaceAll("{{ENQUIRY_FORM}}", renderEnquiry(tripId, { locale, kind: "trip" }));
    body = body.replaceAll("{{SHOPPING_ENQUIRY_FORM}}", renderEnquiry(shoppingId, { locale, kind: "shopping" }));
    body = body.replaceAll("{{FRENCH_TESTIMONIAL_REVIEW_NOTE}}", frenchTestimonialApproved
      ? ""
      : '<p class="translation-review-note"><strong>Prévisualisation locale :</strong> cette traduction attend encore l’approbation de publication de la propriétaire.</p>');
    const enquiryMode = hasShoppingEnquiryForm
      ? (shoppingId ? "tally" : "placeholder")
      : hasEnquiryForm
        ? (tripId ? "tally" : locale === "en" ? "preview" : "placeholder")
        : null;
    const html = renderLayout({
      page,
      locale,
      body,
      ...definition.metadata[locale],
      style: definition.style,
      fragments: definition.fragments || [],
      enquiryMode,
    });
    const outputFile = path.join(output, definition.output[locale]);
    await mkdir(path.dirname(outputFile), { recursive: true });
    await writeFile(outputFile, html);
  }
}

await writeFile(path.join(output, "robots.txt"), "User-agent: *\nAllow: /\nSitemap: https://bentokumiko.com/sitemap.xml\n");
await writeFile(path.join(output, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${publicPageKeys.flatMap((page) => ["en", "fr"].map((locale) => `  <url><loc>${canonicalFor(locale, page)}</loc></url>`)).join("\n")}
</urlset>
`);
await writeFile(path.join(output, "health"), "ok\n");

const frenchFormState = frenchTallyFormId && frenchShoppingTallyFormId ? "French Tally enabled" : "French placeholders";
console.log(`Built ${Object.keys(pages).length * 2} pages in ${path.relative(root, output) || "."} (${tallyFormId ? "English Tally enabled" : "English preview form"}; ${frenchFormState}).`);
