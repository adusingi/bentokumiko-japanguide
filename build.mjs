import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderEnquiry } from "./src/components/enquiry.mjs";
import { renderLayout } from "./src/components/layout.mjs";

const root = path.dirname(fileURLToPath(import.meta.url));
const output = path.resolve(root, process.env.SITE_OUTPUT_DIR || "dist");
const tallyFormId = process.env.TALLY_FORM_ID || "";

if (tallyFormId && !/^[A-Za-z0-9]+$/.test(tallyFormId)) {
  throw new Error("TALLY_FORM_ID must contain only letters and numbers (for example: wA2xyz). Build stopped.");
}

const pages = {
  index: {
    title: "Bento Kumiko — Japan Travel Planner",
    description: "Kumiko, a Japan-based travel planner, builds personal day-by-day Japan itineraries with stays, transport and a clear budget, delivered as a travel book and an app.",
  },
  about: {
    title: "About Kumiko | Bento Kumiko — Japan Travel Planner",
    description: "Meet Kumiko, a Japan-based travel planner who creates personal, day-by-day Japan itineraries in English and French.",
  },
  service: {
    title: "Custom Japan Itinerary Service | Bento Kumiko",
    description: "A personal Japan itinerary with stays, transport, day-by-day plans and an illustrative budget, delivered as a travel book and app.",
  },
  testimonials: {
    title: "Guest Stories | Bento Kumiko — Japan Travel Planner",
    description: "Real guest feedback from a Japan trip planned by Kumiko, with honest notes about what she learned and improved.",
  },
  blog: {
    title: "Blog | Bento Kumiko — Japan Travel Planner",
    description: "Personal Japan travel notes, practical guest lessons and places Kumiko has visited in Kyoto, Osaka, Kumamoto and Nagano.",
  },
  enquire: {
    title: "Enquire | Bento Kumiko — Japan Travel Planner",
    description: "Share your Japan travel timing, party, interests, pace and rough budget with Kumiko in English or French.",
  },
  "404": {
    title: "Page not found | Bento Kumiko",
    description: "The requested Bento Kumiko page could not be found.",
  },
};

await rm(output, { recursive: true, force: true });
await mkdir(path.join(output, "assets"), { recursive: true });
await cp(path.join(root, "src/assets"), path.join(output, "assets"), { recursive: true });
await mkdir(path.join(output, "assets/styles"), { recursive: true });
await cp(path.join(root, "src/styles"), path.join(output, "assets/styles"), { recursive: true });

for (const [page, metadata] of Object.entries(pages)) {
  let body = await readFile(path.join(root, `src/pages/${page}.html`), "utf8");
  body = body.replaceAll("{{ENQUIRY_FORM}}", renderEnquiry(tallyFormId));
  const html = renderLayout({ page, body, ...metadata, tallyEnabled: Boolean(tallyFormId) });
  await writeFile(path.join(output, `${page}.html`), html);
}

await writeFile(path.join(output, "robots.txt"), "User-agent: *\nAllow: /\nSitemap: https://bentokumiko.com/sitemap.xml\n");
await writeFile(path.join(output, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Object.keys(pages).filter((page) => page !== "404").map((page) => `  <url><loc>https://bentokumiko.com/${page === "index" ? "" : `${page}.html`}</loc></url>`).join("\n")}
</urlset>
`);
await writeFile(path.join(output, "health"), "ok\n");

console.log(`Built ${Object.keys(pages).length} pages in ${path.relative(root, output) || "."} (${tallyFormId ? "Tally enabled" : "preview form"}).`);
