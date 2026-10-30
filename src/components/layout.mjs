import { canonicalFor, locales, routeFor } from "../i18n/site.mjs";

function navLink([href, label, page], current, footer = false) {
  const selected = page === current ? ' aria-current="page"' : "";
  const className = !footer && selected ? ' class="current"' : "";
  return `<a href="${href}"${className}${selected}>${label}</a>`;
}

function languageSwitch(locale, page, location) {
  return `<nav class="language-switch" aria-label="${location.languageNavigation}">
          ${Object.entries(locales).map(([candidate, strings]) => {
            const current = candidate === locale ? ' aria-current="true"' : ' data-language-alternate';
            return `<a href="${routeFor(candidate, page)}" lang="${strings.htmlLang}" hreflang="${strings.htmlLang}"${current}>${strings.name}</a>`;
          }).join("\n          ")}
        </nav>`;
}

export function renderLayout({ page, locale, title, description, style, fragments, body, enquiryMode = null }) {
  const strings = locales[locale];
  const home = routeFor(locale, "index", { explicitHome: locale === "en" });
  const homeForAnchors = locale === "en" ? routeFor(locale, "index", { explicitHome: true }) : routeFor(locale, "index");
  const navigation = [
    [routeFor(locale, "about"), strings.navigation.about, "about"],
    [routeFor(locale, "service"), strings.navigation.service, "service"],
    [`${homeForAnchors}#pricing`, strings.navigation.pricing],
    [`${homeForAnchors}#testimonials`, strings.navigation.testimonials],
    [routeFor(locale, "blog"), strings.navigation.blog, "blog"],
  ];
  const canonical = canonicalFor(locale, page);
  const enquiryCurrent = page === "enquire" ? ' current" aria-current="page' : "";
  return `<!doctype html>
<html lang="${strings.htmlLang}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="description" content="${description}" />
  <meta name="color-scheme" content="light" />
  ${page === "404" ? '<meta name="robots" content="noindex" />' : `<link rel="canonical" href="${canonical}" />
  <link rel="alternate" hreflang="en" href="${canonicalFor("en", page)}" />
  <link rel="alternate" hreflang="fr" href="${canonicalFor("fr", page)}" />
  <link rel="alternate" hreflang="x-default" href="${canonicalFor("en", page)}" />`}
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Shippori+Mincho+B1:wght@500;600;700;800&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/assets/styles/base.css" />
  <link rel="stylesheet" href="/assets/styles/${style}.css" />
  <title>${title}</title>
</head>
<body data-page="${page}" data-locale="${locale}" data-preserved-fragments="${fragments.join(",")}">
  <a class="skip-link" href="#main-content">${strings.skipLink}</a>
  <header class="site" id="siteHeader">
    <div class="wrap header-in">
      <a class="brand" href="${home}" aria-label="Bento Kumiko — ${locale === "fr" ? "accueil" : "home"}">
        <span class="hanko" aria-hidden="true">久</span>
        <span><span class="brand-name">Bento Kumiko</span><br /><span class="brand-sub">${strings.brandSubtitle}</span></span>
      </a>
      <button class="nav-toggle" id="navToggle" type="button" aria-expanded="false" aria-controls="mainNav" aria-label="${strings.menuOpen}" data-open-label="${strings.menuOpen}" data-close-label="${strings.menuClose}">☰</button>
      <nav class="main" id="mainNav" aria-label="${strings.mainNavigation}">
        ${navigation.map((item) => navLink(item, page)).join("\n        ")}
        <a class="btn btn-red btn-small${enquiryCurrent}" href="${routeFor(locale, "enquire")}">${strings.navigation.enquire}</a>
        ${languageSwitch(locale, page, strings)}
      </nav>
    </div>
  </header>
  <div id="main-content" tabindex="-1">${body}</div>
  <footer class="site">
    <div class="wrap foot-in">
      <div class="foot-brand">
        <span class="hanko" aria-hidden="true">久</span>
        <span><span class="brand-name foot-brand-name">Bento Kumiko</span><br /><span class="brand-sub">${strings.brandSubtitle}</span></span>
      </div>
      <nav class="foot-links" aria-label="${strings.footerNavigation}">
        ${navigation.map((item) => navLink(item, page, true)).join("\n        ")}
        <a href="${routeFor(locale, "enquire")}"${page === "enquire" ? ' aria-current="page"' : ""}>${strings.navigation.enquire}</a>
        <a href="https://dokomaps.com/bentokumiko" target="_blank" rel="noopener">${strings.maps}</a>
      </nav>
      ${languageSwitch(locale, page, strings)}
      <p class="foot-note">${strings.footerNote}</p>
    </div>
  </footer>
  <script src="/assets/scripts/site.js" defer></script>
  ${page === "index" && locale === "en" ? '<script src="/assets/scripts/testimonial-popup.js" defer></script>' : ""}
  ${page === "service" ? '<script src="/assets/scripts/service-tabs.js" defer></script>' : ""}
  ${enquiryMode === "tally" ? '<script src="https://tally.so/widgets/embed.js" defer></script>\n  <script src="/assets/scripts/tally-embed.js" defer></script>' : ""}
  ${enquiryMode === "preview" ? '<script src="/assets/scripts/enquiry-preview.js" defer></script>' : ""}
</body>
</html>\n`;
}
