import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, readdir, stat, symlink, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { request } from "node:http";
import { runInNewContext } from "node:vm";
import os from "node:os";
import path from "node:path";
import { planOutputDirectory, prepareOutputDirectory } from "../lib/output-directory.mjs";
import { enquiryFields } from "../src/components/enquiry.mjs";
import { createPreviewServer } from "./serve.mjs";

const root = process.cwd();
const siteOrigin = "https://bentokumiko.com";
const routeMatrix = {
  index: { en: { output: "index.html", route: "/" }, fr: { output: "fr/index.html", route: "/fr/" } },
  about: { en: { output: "about.html", route: "/about.html" }, fr: { output: "fr/a-propos.html", route: "/fr/a-propos.html" } },
  service: { en: { output: "service.html", route: "/service.html" }, fr: { output: "fr/services.html", route: "/fr/services.html" } },
  blog: { en: { output: "blog.html", route: "/blog.html" }, fr: { output: "fr/blog.html", route: "/fr/blog.html" } },
  enquire: { en: { output: "enquire.html", route: "/enquire.html" }, fr: { output: "fr/contact.html", route: "/fr/contact.html" } },
  shopping: { en: { output: "shopping.html", route: "/shopping.html" }, fr: { output: "fr/shopping.html", route: "/fr/shopping.html" } },
  "404": { en: { output: "404.html", route: "/404.html" }, fr: { output: "fr/404.html", route: "/fr/404.html" } },
};
const publicPages = Object.keys(routeMatrix).filter((page) => page !== "404");
let assertions = 0;

function assert(condition, message) {
  assertions += 1;
  if (!condition) throw new Error(message);
}

function build(environment = {}) {
  const isolatedEnvironment = { ...process.env };
  for (const name of [
    "TALLY_FORM_ID",
    "FRENCH_TALLY_FORM_ID",
    "FRENCH_SHOPPING_TALLY_FORM_ID",
    "REQUIRE_PRODUCTION_READY",
    "SITE_OUTPUT_DIR",
  ]) delete isolatedEnvironment[name];
  return spawnSync(process.execPath, ["build.mjs"], {
    cwd: root,
    env: { ...isolatedEnvironment, ...environment },
    encoding: "utf8",
  });
}

async function filesRecursively(directory) {
  const entries = await readdir(directory);
  const files = [];
  for (const entry of entries) {
    const candidate = path.join(directory, entry);
    if ((await stat(candidate)).isDirectory()) files.push(...await filesRecursively(candidate));
    else files.push(candidate);
  }
  return files;
}

async function snapshotDirectory(directory) {
  try {
    const files = await filesRecursively(directory);
    const hash = createHash("sha256");
    for (const file of files.sort()) {
      hash.update(path.relative(directory, file));
      hash.update(await readFile(file));
    }
    return hash.digest("hex");
  } catch (error) {
    if (error.code === "ENOENT") return "missing";
    throw error;
  }
}

async function assertRejects(operation, message) {
  let rejected = false;
  try {
    await operation();
  } catch {
    rejected = true;
  }
  assert(rejected, message);
}

function get(server, requestPath) {
  return new Promise((resolve, reject) => {
    const address = server.address();
    const outgoing = request({ hostname: "127.0.0.1", port: address.port, path: requestPath }, (response) => {
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => resolve({
        status: response.statusCode,
        location: response.headers.location,
        body: Buffer.concat(chunks).toString("utf8"),
      }));
    });
    outgoing.on("error", reject);
    outgoing.end();
  });
}

function outputPathForReference(sourceOutput, rawReference) {
  const [withoutAnchor] = rawReference.split("#");
  const [withoutQuery] = withoutAnchor.split("?");
  let localPath = withoutQuery.startsWith("/")
    ? withoutQuery.slice(1)
    : path.normalize(path.join(path.dirname(sourceOutput), withoutQuery));
  if (!localPath || localPath.endsWith("/")) localPath += "index.html";
  return localPath;
}

function verifyServiceLanguageSwitch(siteScript, serviceTabsScript) {
  function classList() {
    const values = new Set();
    return {
      add: (...names) => names.forEach((name) => values.add(name)),
      remove: (...names) => names.forEach((name) => values.delete(name)),
      contains: (name) => values.has(name),
      toggle(name) {
        if (values.has(name)) {
          values.delete(name);
          return false;
        }
        values.add(name);
        return true;
      },
    };
  }

  function element({ dataset = {}, href = "", id = "" } = {}) {
    const attributes = new Map(href ? [["href", href]] : []);
    const listeners = new Map();
    return {
      dataset: { ...dataset },
      id,
      href,
      hidden: false,
      tabIndex: 0,
      textContent: "",
      classList: classList(),
      listeners,
      addEventListener(type, listener) { listeners.set(type, listener); },
      setAttribute(name, value) { attributes.set(name, String(value)); },
      getAttribute(name) { return attributes.get(name) || null; },
      focus() {},
      closest() { return null; },
    };
  }

  const alternateLink = element({ href: "/fr/services.html" });
  const header = element();
  const toggle = element({ dataset: { openLabel: "Open menu", closeLabel: "Close menu" } });
  const nav = element();
  const tablist = element();
  const status = element();
  const selectedService = element();
  const tripTab = element({ dataset: { serviceTab: "trip" }, href: "#service-trip" });
  const shoppingTab = element({ dataset: { serviceTab: "shopping" }, href: "#shopping" });
  const tripPanel = element({ dataset: { servicePanel: "trip" }, id: "service-trip" });
  const shoppingPanel = element({ dataset: { servicePanel: "shopping" }, id: "shopping" });
  const chooser = element({ dataset: { tripLabel: "Trip planning", shoppingLabel: "Shopping assistance" } });
  chooser.querySelector = (selector) => ({
    "[data-service-tabs]": tablist,
    "[data-service-status]": status,
    "[data-selected-service]": selectedService,
  })[selector] || null;
  chooser.querySelectorAll = (selector) => selector === "[data-service-tab]"
    ? [tripTab, shoppingTab]
    : selector === "[data-service-panel]" ? [tripPanel, shoppingPanel] : [];

  const windowListeners = new Map();
  const documentListeners = new Map();
  const location = { hash: "", origin: siteOrigin };
  const window = {
    location,
    scrollY: 0,
    matchMedia: () => ({ matches: true }),
    addEventListener(type, listener) {
      const listeners = windowListeners.get(type) || [];
      listeners.push(listener);
      windowListeners.set(type, listeners);
    },
    dispatchEvent(event) {
      for (const listener of windowListeners.get(event.type) || []) listener(event);
    },
    history: {
      replaceState(_state, _unused, url) { location.hash = url.startsWith("#") ? url : new URL(url, siteOrigin).hash; },
    },
  };
  const document = {
    body: { dataset: { preservedFragments: "service-trip,shopping" } },
    getElementById(id) { return ({ siteHeader: header, navToggle: toggle, mainNav: nav })[id] || null; },
    querySelector(selector) { return selector === "[data-service-chooser]" ? chooser : null; },
    querySelectorAll(selector) { return selector === "[data-language-alternate]" ? [alternateLink] : []; },
    addEventListener(type, listener) { documentListeners.set(type, listener); },
  };
  class MockEvent { constructor(type) { this.type = type; } }
  const context = { document, window, navigator: { languages: ["en"], language: "en" }, Intl, URL, Event: MockEvent };

  runInNewContext(siteScript, context);
  runInNewContext(serviceTabsScript, context);
  shoppingTab.listeners.get("click")({ preventDefault() {} });
  assert(location.hash === "#shopping", "Shopping tab activation did not update the current URL");
  assert(alternateLink.href === "/fr/services.html#shopping", "Language switch lost shopping after client-side tab selection");

  location.hash = "#not-allowlisted";
  window.dispatchEvent(new MockEvent("bento:locationchange"));
  assert(alternateLink.href === "/fr/services.html", "Language switch preserved an arbitrary fragment");
}

function verifyLanguageSuggestion(siteScript) {
  const cases = [
    { label: "exact French", languages: ["fr"], language: "en", visible: true },
    { label: "case-insensitive French region", languages: ["FR-ca"], language: "en", visible: true },
    { label: "valid French numeric region", languages: ["fr-029"], language: "en", visible: true },
    { label: "fallback French region", languages: [], language: "fr-FR", visible: true },
    { label: "secondary French", languages: ["en", "fr"], language: "fr", visible: false },
    { label: "unrelated language", languages: ["de-DE"], language: "fr", visible: false },
    { label: "malformed French", languages: ["fr_FR"], language: "fr", visible: false },
    { label: "French script without region", languages: ["fr-Latn"], language: "fr", visible: false },
    { label: "unknown preference", languages: [], language: undefined, visible: false },
  ];

  for (const testCase of cases) {
    const suggestion = { hidden: true };
    const location = { href: `${siteOrigin}/about.html#history` };
    const emptyClassList = class {
      add() {}
      remove() {}
      contains() { return false; }
      toggle() { return false; }
    };
    const header = { classList: new emptyClassList() };
    const toggle = {
      dataset: { openLabel: "Open menu", closeLabel: "Close menu" },
      classList: new emptyClassList(),
      addEventListener() {},
      setAttribute() {},
    };
    const nav = { classList: new emptyClassList(), addEventListener() {} };
    const context = {
      document: {
        body: { dataset: { preservedFragments: "" } },
        getElementById(id) { return ({ siteHeader: header, navToggle: toggle, mainNav: nav })[id] || null; },
        querySelector: (selector) => selector === "[data-language-suggestion]" ? suggestion : null,
        querySelectorAll: () => [],
        addEventListener() {},
      },
      navigator: { languages: testCase.languages, language: testCase.language },
      window: {
        location: { ...location, hash: "", origin: siteOrigin },
        scrollY: 0,
        matchMedia: () => ({ matches: true }),
        addEventListener() {},
      },
      Intl,
      URL,
    };
    runInNewContext(siteScript, context);
    assert(suggestion.hidden === !testCase.visible, `Language suggestion handled ${testCase.label} incorrectly`);
    assert(context.window.location.href === `${siteOrigin}/about.html#history`, `Language suggestion navigated for ${testCase.label}`);
  }
}

async function inspectSite(directory, modes) {
  const files = await filesRecursively(directory);
  const relativeFiles = new Set(files.map((file) => path.relative(directory, file)));
  const topLevel = (await readdir(directory)).sort();
  const expectedTopLevel = ["404.html", "_headers", "_redirects", "about.html", "assets", "blog.html", "enquire.html", "fr", "health", "index.html", "robots.txt", "service.html", "shopping.html", "sitemap.xml"].sort();
  assert(JSON.stringify(topLevel) === JSON.stringify(expectedTopLevel), `Unexpected output boundary: ${topLevel.join(", ")}`);
  const htmlByOutput = new Map();

  for (const [page, localeRoutes] of Object.entries(routeMatrix)) {
    for (const [locale, expected] of Object.entries(localeRoutes)) {
      assert(relativeFiles.has(expected.output), `Missing ${expected.output}`);
      const html = await readFile(path.join(directory, expected.output), "utf8");
      htmlByOutput.set(expected.output, html);
      assert(html.includes(`<html lang="${locale}">`), `${expected.output} has the wrong document language`);
      assert(html.includes(`data-locale="${locale}"`), `${expected.output} has the wrong locale marker`);
      assert(/<main(?:\s|>)/.test(html), `${expected.output} has no main landmark`);
      assert(html.includes('class="skip-link"'), `${expected.output} has no skip link`);
      assert(!html.includes("{{"), `${expected.output} contains an unresolved build token`);
      assert(!html.includes("data:image/"), `${expected.output} still embeds a data URI`);
      assert(!html.includes("I've received your enquiry"), `${expected.output} claims receipt without proof`);
      const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
      assert(ids.length === new Set(ids).size, `${expected.output} contains duplicate IDs`);

      if (page === "404") {
        assert(html.includes('<meta name="robots" content="noindex"'), `${expected.output} is not marked noindex`);
        assert(!html.includes('<link rel="canonical"'), `${expected.output} should not be canonicalized`);
      } else {
        const canonical = `${siteOrigin}${expected.route}`;
        const english = `${siteOrigin}${localeRoutes.en.route}`;
        const french = `${siteOrigin}${localeRoutes.fr.route}`;
        assert(html.includes(`<link rel="canonical" href="${canonical}"`), `${expected.output} has the wrong canonical URL`);
        assert(html.includes(`<link rel="alternate" hreflang="en" href="${english}"`), `${expected.output} lacks its English alternate`);
        assert(html.includes(`<link rel="alternate" hreflang="fr" href="${french}"`), `${expected.output} lacks its French alternate`);
        assert(html.includes(`<link rel="alternate" hreflang="x-default" href="${english}"`), `${expected.output} lacks its x-default alternate`);
      }

      const alternateRoute = localeRoutes[locale === "en" ? "fr" : "en"].route;
      const alternateLink = [...html.matchAll(/<a\s+([^>]*data-language-alternate[^>]*)>/g)]
        .map((match) => match[1])
        .find((attributes) => attributes.includes(`href="${alternateRoute}"`));
      assert(alternateLink, `${expected.output} lacks a real equivalent-language link to ${alternateRoute}`);
      assert(!alternateLink.includes("?"), `${expected.output} transfers a query string through its language link`);

      if (locale === "fr") {
        for (const anchor of html.matchAll(/<a\s+([^>]*)>/g)) {
          const attributes = anchor[1];
          const href = attributes.match(/href="([^"]+)"/)?.[1];
          if (!href?.startsWith("/") || href.startsWith("/fr/") || href.startsWith("/assets/")) continue;
          assert(attributes.includes("data-language-alternate") && href === alternateRoute, `${expected.output} contains an unexpected English internal link: ${href}`);
        }
      }

      for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
        const reference = match[1];
        if (/^(?:https?:|mailto:|#)/.test(reference)) continue;
        const localPath = outputPathForReference(expected.output, reference);
        assert(relativeFiles.has(localPath), `${expected.output} references missing ${localPath}`);
        const anchor = reference.includes("#") ? reference.split("#")[1] : "";
        if (anchor && localPath.endsWith(".html")) {
          const targetHtml = htmlByOutput.get(localPath) || await readFile(path.join(directory, localPath), "utf8");
          assert(new RegExp(`id=["']${anchor}["']`).test(targetHtml), `${reference} has no target from ${expected.output}`);
        }
      }

      const tallyWidgetScript = 'src="https://tally.so/widgets/embed.js"';
      const tallyEmbedScript = 'src="/assets/scripts/tally-embed.js"';
      const enquiryPreviewScript = 'src="/assets/scripts/enquiry-preview.js"';
      const formKind = page === "index" || page === "enquire" ? "trip" : page === "shopping" ? "shopping" : null;
      const mode = formKind ? modes[locale][formKind] : null;
      assert((mode === "tally") === html.includes(tallyWidgetScript), `${expected.output} has the wrong Tally widget state`);
      assert((mode === "tally") === html.includes(tallyEmbedScript), `${expected.output} has the wrong Tally initializer state`);
      assert((mode === "preview") === html.includes(enquiryPreviewScript), `${expected.output} has the wrong preview-script state`);
      assert((locale === "en") === html.includes("data-language-suggestion hidden"), `${expected.output} has the wrong French-suggestion markup state`);
      if (locale === "en") {
        assert(html.includes(`<a href="${localeRoutes.fr.route}" lang="fr" hreflang="fr" data-language-alternate>`), `${expected.output} lacks its French suggestion destination`);
      }
      if (mode) assert(html.includes(`data-form-mode="${mode}"`), `${expected.output} did not render ${mode} mode`);
    }
  }

  const englishIndex = htmlByOutput.get("index.html");
  const frenchIndex = htmlByOutput.get("fr/index.html");
  const frenchAbout = htmlByOutput.get("fr/a-propos.html");
  const englishBlog = htmlByOutput.get("blog.html");
  const frenchBlog = htmlByOutput.get("fr/blog.html");
  assert(!englishIndex.includes('id="blog"'), "English homepage still contains the removed blog section");
  assert(englishIndex.includes("Everyln &amp; Fabiola"), "English homepage testimonial changed during the French revision");
  assert(englishBlog.includes("5 things our guests learned in Japan"), "English blog lost the supplied guest tips");
  assert(frenchBlog.includes("5 leçons apprises par mes voyageurs au Japon"), "French blog lost the authored guest lessons");
  const approvedFrenchTestimonial = "Pour notre premier voyage au Japon, nous pensions à un séjour court, fort en souvenirs. Les enfants voulaient de l’aventure, les parents voulaient découvrir les attraits uniques de la culture japonaise. Kumiko nous a préparé soigneusement une sélection d’hôtels, de restaurants ainsi que les principaux sites à visiter. On a découvert un excellent restaurant basque, on s’est amusé à Universal Studios Japan, et on a aimé les hôtels qu’elle a choisis, et bien plus encore. Je recommande !";
  for (const [output, html] of [["fr/index.html", frenchIndex], ["fr/a-propos.html", frenchAbout]]) {
    assert(html.includes(approvedFrenchTestimonial), `${output} lacks the exact approved Heri testimonial`);
    assert(html.includes('<p class="attribution">— Heri. R</p>'), `${output} lacks the exact Heri. R attribution`);
    for (const obsolete of ["Traduction française", "testimonial-original", "Prévisualisation locale", "Everyln &amp; Fabiola"]) {
      assert(!html.includes(obsolete), `${output} retains obsolete testimonial content: ${obsolete}`);
    }
  }
  assert(frenchIndex.includes("Mes offres pour vous accompagner"), "French homepage lacks the approved offers heading");
  assert(frenchIndex.includes("Bento Kumiko · Spécialiste du Japon"), "French homepage lacks the approved specialist wording");
  assert(frenchIndex.includes("<title>Bento Kumiko — Voyage au Japon sur mesure</title>"), "French homepage lacks the approved page title");
  assert(frenchIndex.includes("Un carnet de voyage et une web app"), "French homepage lacks the approved web app heading");
  assert(frenchIndex.includes("<h3>Japon sur mesure</h3>"), "French homepage lacks the approved trip heading");
  assert(frenchIndex.includes("<h3>Faire du shopping avec Kumiko</h3>"), "French homepage lacks the approved shopping heading");
  assert(htmlByOutput.get("fr/services.html").includes("Un carnet de voyage et une web app"), "French service page lacks the duplicated approved web app label");
  assert(!frenchIndex.includes('class="highlights"'), "French Heri testimonial retains E&F-specific highlights");
  assert(!frenchIndex.includes("Une leçon sincère, désormais intégrée à chaque voyage"), "French Heri testimonial retains the E&F-specific lesson");
  assert(frenchIndex.includes("Votre voyage au Japon, <em>sur mesure</em>."), "French homepage lost its mobile-safe hero wording");
  assert(frenchAbout.includes("<h1>Le Japon, pour un voyage mémorable.</h1>"), "French About page lacks the approved heading");
  assert(frenchAbout.includes("Une famille de voyageurs"), "French About page lacks the approved family wording");
  for (const [output, html] of [["fr/index.html", frenchIndex], ["fr/a-propos.html", frenchAbout], ["fr/blog.html", frenchBlog]]) {
    assert(!html.includes("voyageuses"), `${output} guesses the guests' gender`);
    assert(!html.includes("mes voyageuses"), `${output} retains a gendered guest reference`);
  }
  assert(frenchIndex.includes('data-preserved-fragments="pricing,testimonials"'), "Homepage language switch cannot preserve approved fragments");
  assert(htmlByOutput.get("fr/services.html").includes('data-preserved-fragments="service-trip,shopping"'), "Service language switch cannot preserve approved fragments");
  assert(!frenchIndex.includes("https://tally.so/embed/6DDMge"), "French homepage silently embeds the English trip form");
  assert(!htmlByOutput.get("fr/shopping.html").includes("https://tally.so/embed/Vpp72g"), "French shopping page silently embeds the English shopping form");

  const sitemap = await readFile(path.join(directory, "sitemap.xml"), "utf8");
  const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const expectedUrls = publicPages.flatMap((page) => ["en", "fr"].map((locale) => `${siteOrigin}${routeMatrix[page][locale].route}`));
  assert(sitemapUrls.length === 12, `Sitemap contains ${sitemapUrls.length} URLs instead of 12`);
  assert(new Set(sitemapUrls).size === sitemapUrls.length, "Sitemap contains duplicate URLs");
  assert(expectedUrls.every((url) => sitemapUrls.includes(url)), "Sitemap does not match the approved canonical route matrix");
  assert(!sitemap.includes("404"), "Sitemap includes an error page");

  const headers = await readFile(path.join(directory, "_headers"), "utf8");
  const redirects = await readFile(path.join(directory, "_redirects"), "utf8");
  assert(headers.includes("Content-Security-Policy:"), "Cloudflare security headers are missing");
  assert(headers.includes("script-src 'self' https://tally.so"), "Cloudflare CSP does not allow the official Tally widget script");
  assert(redirects.trim() === "/ /index.html 200\n/fr /fr/ 301\n/fr/ /fr/index.html 200", "Cloudflare locale rewrites do not match the approved narrow routes");
  assert(relativeFiles.has("robots.txt") && relativeFiles.has("health"), "Discovery or health output is missing");
}

const wrangler = JSON.parse(await readFile(path.join(root, "wrangler.jsonc"), "utf8"));
assert(wrangler.assets?.directory === "./dist", "Wrangler must upload only dist");
assert(wrangler.assets?.html_handling === "none", "Wrangler must preserve explicit .html paths");
assert(wrangler.assets?.not_found_handling === "404-page", "Wrangler must use nearest branded 404 pages");
assert(!("main" in wrangler), "Static-only deployment unexpectedly has a Worker script");
assert(!("routes" in wrangler), "Wrangler config must not claim live domains");

const testRoot = await mkdtemp(path.join(os.tmpdir(), "bento-check-"));
const distBefore = await snapshotDirectory(path.join(root, "dist"));
const defaultModes = { en: { trip: "tally", shopping: "tally" }, fr: { trip: "tally", shopping: "tally" } };

const defaultDirectory = path.join(testRoot, "default");
const defaultBuild = build({ SITE_OUTPUT_DIR: defaultDirectory });
assert(defaultBuild.status === 0, `Default build failed: ${defaultBuild.stderr}`);
await inspectSite(defaultDirectory, defaultModes);
const defaultEnquire = await readFile(path.join(defaultDirectory, "enquire.html"), "utf8");
const defaultShopping = await readFile(path.join(defaultDirectory, "shopping.html"), "utf8");
const defaultFrenchEnquire = await readFile(path.join(defaultDirectory, "fr/contact.html"), "utf8");
const defaultFrenchShopping = await readFile(path.join(defaultDirectory, "fr/shopping.html"), "utf8");
assert(defaultEnquire.includes("https://tally.so/embed/6DDMge"), "Default English build lacks the approved trip form");
assert(defaultEnquire.includes("https://tally.so/r/6DDMge"), "Default English trip fallback is missing");
assert(defaultShopping.includes("https://tally.so/embed/Vpp72g"), "Default English shopping page lacks its approved form");
assert(defaultShopping.includes("https://tally.so/r/Vpp72g"), "Default English shopping fallback is missing");
assert(defaultShopping.includes('title="Shopping day enquiry"'), "English shopping iframe lacks its accessible title");
assert(!defaultShopping.includes("https://tally.so/embed/6DDMge"), "English shopping page uses the trip form");
assert(!defaultEnquire.includes("https://tally.so/embed/Vpp72g"), "English trip page uses the shopping form");
assert(defaultFrenchEnquire.includes("https://tally.so/embed/laaPRo"), "Default French trip form is missing");
assert(defaultFrenchEnquire.includes("https://tally.so/r/laaPRo"), "Default French trip fallback is missing");
assert(defaultFrenchShopping.includes("https://tally.so/embed/Z99ple"), "Default French shopping form is missing");
assert(defaultFrenchShopping.includes("https://tally.so/r/Z99ple"), "Default French shopping fallback is missing");
assert(!defaultFrenchEnquire.includes("Z99ple"), "Default French trip page uses the shopping form");
assert(!defaultFrenchShopping.includes("laaPRo"), "Default French shopping page uses the trip form");

const frenchPlaceholderDirectory = path.join(testRoot, "french-placeholder");
const frenchPlaceholderBuild = build({
  FRENCH_TALLY_FORM_ID: "",
  FRENCH_SHOPPING_TALLY_FORM_ID: "",
  SITE_OUTPUT_DIR: frenchPlaceholderDirectory,
});
assert(frenchPlaceholderBuild.status === 0, `Explicit French placeholder build failed: ${frenchPlaceholderBuild.stderr}`);
await inspectSite(frenchPlaceholderDirectory, { en: { trip: "tally", shopping: "tally" }, fr: { trip: "placeholder", shopping: "placeholder" } });
const frenchPlaceholder = await readFile(path.join(frenchPlaceholderDirectory, "fr/contact.html"), "utf8");
assert(!frenchPlaceholder.includes("tally.so/"), "Explicit-empty French trip output contains a Tally destination");
assert(!frenchPlaceholder.includes("<form"), "French placeholder unexpectedly contains an interactive form");

const previewDirectory = path.join(testRoot, "preview");
const previewBuild = build({ TALLY_FORM_ID: "", SITE_OUTPUT_DIR: previewDirectory });
assert(previewBuild.status === 0, `English preview build failed: ${previewBuild.stderr}`);
await inspectSite(previewDirectory, { ...defaultModes, en: { trip: "preview", shopping: "tally" } });
const preview = await readFile(path.join(previewDirectory, "enquire.html"), "utf8");
assert(preview.includes('method="dialog"'), "English preview form can submit over the network without JavaScript");
for (const [key] of enquiryFields) assert(preview.includes(`data-field="${key}"`), `English preview form lacks ${key}`);

const configuredDirectory = path.join(testRoot, "configured");
const configuredBuild = build({
  TALLY_FORM_ID: "abc123",
  FRENCH_TALLY_FORM_ID: "frTrip123",
  FRENCH_SHOPPING_TALLY_FORM_ID: "frShop456",
  SITE_OUTPUT_DIR: configuredDirectory,
});
assert(configuredBuild.status === 0, `Configured build failed: ${configuredBuild.stderr}`);
await inspectSite(configuredDirectory, { en: { trip: "tally", shopping: "tally" }, fr: { trip: "tally", shopping: "tally" } });
const configuredEnglish = await readFile(path.join(configuredDirectory, "enquire.html"), "utf8");
const configuredFrench = await readFile(path.join(configuredDirectory, "fr/contact.html"), "utf8");
const configuredFrenchShopping = await readFile(path.join(configuredDirectory, "fr/shopping.html"), "utf8");
assert(configuredEnglish.includes("https://tally.so/embed/abc123"), "English override was ignored");
assert(configuredEnglish.includes("https://tally.so/r/abc123"), "English override fallback is missing");
assert(configuredEnglish.includes("dynamicHeight=1"), "Configured Tally embed does not request dynamic height");
assert(configuredEnglish.includes('height="200"'), "Configured Tally embed lacks the initial widget height");
assert(!/<iframe[^>]*\ssrc="https:\/\/tally\.so\/embed\/abc123/.test(configuredEnglish), "Configured Tally iframe bypasses the widget loader");
assert(configuredFrench.includes("https://tally.so/embed/frTrip123"), "French trip form was not integrated");
assert(configuredFrench.includes("https://tally.so/r/frTrip123"), "French trip fallback is missing");
assert(configuredFrenchShopping.includes("https://tally.so/embed/frShop456"), "French shopping form was not integrated");
assert(configuredFrenchShopping.includes("https://tally.so/r/frShop456"), "French shopping fallback is missing");
assert(!configuredFrench.includes("frShop456"), "French trip page uses the shopping form");
assert(!configuredFrenchShopping.includes("frTrip123"), "French shopping page uses the trip form");

const mixedDirectory = path.join(testRoot, "mixed");
const mixedBuild = build({ FRENCH_TALLY_FORM_ID: "frTripOnly", FRENCH_SHOPPING_TALLY_FORM_ID: "", SITE_OUTPUT_DIR: mixedDirectory });
assert(mixedBuild.status === 0, `Mixed French form build failed: ${mixedBuild.stderr}`);
const mixedTrip = await readFile(path.join(mixedDirectory, "fr/contact.html"), "utf8");
const mixedShopping = await readFile(path.join(mixedDirectory, "fr/shopping.html"), "utf8");
assert(mixedTrip.includes('data-form-mode="tally"'), "Configured French trip form did not activate independently");
assert(mixedShopping.includes('data-form-mode="placeholder"'), "Missing French shopping form did not remain a placeholder");

for (const [name, value] of [["TALLY_FORM_ID", "not/a/form"], ["FRENCH_TALLY_FORM_ID", "bad-id"], ["FRENCH_SHOPPING_TALLY_FORM_ID", "bad/id"]]) {
  const invalidBuild = build({ [name]: value, SITE_OUTPUT_DIR: path.join(testRoot, `invalid-${name}`) });
  assert(invalidBuild.status !== 0, `${name} accepted an invalid ID`);
  assert(invalidBuild.stderr.includes(name), `${name} produced an unclear error`);
}
const duplicateFrench = build({ FRENCH_TALLY_FORM_ID: "same123", FRENCH_SHOPPING_TALLY_FORM_ID: "same123", SITE_OUTPUT_DIR: path.join(testRoot, "duplicate") });
assert(duplicateFrench.status !== 0 && duplicateFrench.stderr.includes("two different forms"), "French trip and shopping forms can be interchanged");
const reusedEnglish = build({ FRENCH_TALLY_FORM_ID: "6DDMge", SITE_OUTPUT_DIR: path.join(testRoot, "reused") });
assert(reusedEnglish.status !== 0 && reusedEnglish.stderr.includes("must not reuse"), "French configuration accepted an English form ID");

const productionMissingIds = build({
  REQUIRE_PRODUCTION_READY: "1",
  FRENCH_TALLY_FORM_ID: "",
  FRENCH_SHOPPING_TALLY_FORM_ID: "",
  SITE_OUTPUT_DIR: path.join(testRoot, "production-missing-ids"),
});
assert(productionMissingIds.status !== 0, "Production readiness accepted explicit-empty French forms");
for (const dependency of ["FRENCH_TALLY_FORM_ID", "FRENCH_SHOPPING_TALLY_FORM_ID"]) {
  assert(productionMissingIds.stderr.includes(dependency), `Production readiness did not identify ${dependency}`);
}
const productionReadyDirectory = path.join(testRoot, "production-ready");
const productionReady = build({
  REQUIRE_PRODUCTION_READY: "1",
  SITE_OUTPUT_DIR: productionReadyDirectory,
});
assert(productionReady.status === 0, `Complete production configuration was rejected: ${productionReady.stderr}`);

const tallyInitializer = await readFile(path.join(root, "src/assets/scripts/tally-embed.js"), "utf8");
assert(tallyInitializer.includes("Tally?.loadEmbeds()"), "Tally initializer does not call the official embed loader");
const siteScript = await readFile(path.join(root, "src/assets/scripts/site.js"), "utf8");
const serviceTabsScript = await readFile(path.join(root, "src/assets/scripts/service-tabs.js"), "utf8");
verifyServiceLanguageSwitch(siteScript, serviceTabsScript);
verifyLanguageSuggestion(siteScript);
const baseStyles = await readFile(path.join(root, "src/styles/base.css"), "utf8");
assert(!/\.tally-frame\s*\{[^}]*min-height/s.test(baseStyles), "Tally frame CSS blocks dynamic-height shrinking");
const indexStyles = await readFile(path.join(root, "src/styles/index.css"), "utf8");
assert(/\.hero-grid\s*>\s*\*\s*\{\s*min-width:\s*0\s*\}/.test(indexStyles), "Hero grid children can force horizontal overflow");
assert(/grid-template-columns:\s*minmax\(0,\s*1fr\)/.test(indexStyles), "Mobile hero grid retains an auto min-content track");
const blogStyles = await readFile(path.join(root, "src/styles/blog.css"), "utf8");
assert(/\.places-foot\s*>\s*\*\s*\{\s*min-width:\s*0\s*\}/.test(blogStyles), "Blog footer flex children cannot shrink");
assert(/\.places-foot a\s*\{[^}]*white-space:\s*normal[^}]*overflow-wrap:\s*anywhere/.test(blogStyles), "Long blog map links cannot wrap safely");
const dockerfile = await readFile(path.join(root, "Dockerfile"), "utf8");
for (const variable of ["TALLY_FORM_ID", "FRENCH_TALLY_FORM_ID", "FRENCH_SHOPPING_TALLY_FORM_ID", "REQUIRE_PRODUCTION_READY"]) {
  assert(dockerfile.includes(`ARG ${variable}`), `Docker build does not expose ${variable}`);
}
assert(dockerfile.includes('ARG FRENCH_TALLY_FORM_ID="laaPRo"'), "Docker does not default to the published French trip form");
assert(dockerfile.includes('ARG FRENCH_SHOPPING_TALLY_FORM_ID="Z99ple"'), "Docker does not default to the published French shopping form");
const nginx = await readFile(path.join(root, "nginx/default.conf"), "utf8");
const frenchLocationIndex = nginx.indexOf("location ^~ /fr/");
const genericHtmlIndex = nginx.indexOf("location ~* \\.html$");
assert(frenchLocationIndex !== -1 && frenchLocationIndex < genericHtmlIndex, "nginx lets the generic HTML regex win over French routing");
const frenchLocation = nginx.slice(frenchLocationIndex, genericHtmlIndex);
assert(frenchLocation.includes("error_page 404 /fr/404.html"), "nginx does not use the nested French 404 page");
assert(frenchLocation.includes('add_header Cache-Control "no-cache"'), "nginx French routes lost HTML cache headers");
assert(frenchLocation.includes("include /etc/nginx/snippets/security-headers.conf"), "nginx French routes lost security headers");
const french404Location = nginx.match(/location = \/fr\/404\.html \{([\s\S]*?)\n  \}/)?.[1] || "";
assert(french404Location.includes('add_header Cache-Control "no-cache"'), "nginx French 404 lost HTML cache headers");
assert(french404Location.includes("include /etc/nginx/snippets/security-headers.conf"), "nginx French 404 lost security headers");

const packageManifest = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
assert(packageManifest.scripts["cloudflare:deploy"].startsWith("REQUIRE_PRODUCTION_READY=1 pnpm build"), "Normal Cloudflare deploy bypasses production readiness");
assert(!packageManifest.scripts["cloudflare:dry-run"].includes("REQUIRE_PRODUCTION_READY"), "Cloudflare dry-run unexpectedly requires publication readiness");

const populatedDirectory = path.join(testRoot, "populated");
await mkdir(populatedDirectory);
const sentinel = path.join(populatedDirectory, "keep.txt");
await writeFile(sentinel, "keep me\n");
const populatedBuild = build({ SITE_OUTPUT_DIR: populatedDirectory });
assert(populatedBuild.status !== 0, "A populated custom output directory was accepted");
assert(await readFile(sentinel, "utf8") === "keep me\n", "A populated custom output directory was modified");

const symlinkTarget = path.join(testRoot, "symlink-target");
const symlinkOutput = path.join(testRoot, "symlink-output");
await mkdir(symlinkTarget);
await writeFile(path.join(symlinkTarget, "keep.txt"), "keep me too\n");
await symlink(symlinkTarget, symlinkOutput, "dir");
const symlinkBuild = build({ SITE_OUTPUT_DIR: symlinkOutput });
assert(symlinkBuild.status !== 0, "A symbolic-link output directory was accepted");
assert(await readFile(path.join(symlinkTarget, "keep.txt"), "utf8") === "keep me too\n", "A symbolic-link target was modified");
await assertRejects(() => planOutputDirectory({ repositoryRoot: root, requestedOutput: "src" }), "A source directory was accepted as output");
await assertRejects(() => planOutputDirectory({ repositoryRoot: root, requestedOutput: path.dirname(root) }), "A repository ancestor was accepted as output");

const fixtureRepository = path.join(testRoot, "fixture-repository");
const fixtureDist = path.join(fixtureRepository, "dist");
await mkdir(fixtureDist, { recursive: true });
await writeFile(path.join(fixtureDist, "stale.txt"), "stale\n");
const fixturePlan = await planOutputDirectory({ repositoryRoot: fixtureRepository });
await prepareOutputDirectory(fixturePlan);
assert((await readdir(fixtureDist)).length === 0, "The known generated output was not replaced during a normal rebuild");

console.log(`Static checks passed: ${assertions} assertions before preview routing.`);
const server = createPreviewServer(defaultDirectory);
await new Promise((resolve, reject) => {
  server.once("error", reject);
  server.listen(0, "127.0.0.1", resolve);
});
try {
  const frenchRedirect = await get(server, "/fr");
  assert(frenchRedirect.status === 308 && frenchRedirect.location === "/fr/", "Preview does not redirect /fr to /fr/");
  const frenchHome = await get(server, "/fr/");
  assert(frenchHome.status === 200 && frenchHome.body.includes('<html lang="fr">'), "Preview does not serve the French home route");
  for (const missingPath of ["/fr/missing", "/fr/missing.html", "/fr/nested/missing", "/fr/nested/missing.html"]) {
    const missing = await get(server, missingPath);
    assert(missing.status === 404 && missing.body.includes('<html lang="fr">'), `${missingPath} does not return the nested French 404`);
  }
  const englishMissing = await get(server, "/missing");
  assert(englishMissing.status === 404 && englishMissing.body.includes('<html lang="en">'), "Root missing path does not return the English 404");
  const malformed = await get(server, "/%ZZ");
  assert(malformed.status === 400, `Malformed URL returned ${malformed.status} instead of 400`);
  const traversal = await get(server, "/fr/%2e%2e%2fpackage.json");
  assert(traversal.status === 404 && !traversal.body.includes('"scripts"'), "Traversal response exposed a repository file");
  const health = await get(server, "/health");
  assert(health.status === 200 && health.body === "ok\n", "Preview server did not remain healthy");
} finally {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
}

const distAfter = await snapshotDirectory(path.join(root, "dist"));
assert(distAfter === distBefore, "pnpm test changed the configured dist directory");
const sourceImages = (await readdir(path.join(root, "src/assets/images"))).filter((file) => /\.(?:jpg|png|webp)$/.test(file));
assert(sourceImages.length === 8, `Expected 8 deduplicated images, found ${sourceImages.length}`);

console.log(`Checks passed: ${assertions} assertions; bilingual routes, locale SEO, form separation, production gates and safe output handling verified.`);
