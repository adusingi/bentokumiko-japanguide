const navigation = [
  ["/about.html", "About", "about"],
  ["/service.html", "Service", "service"],
  ["/index.html#testimonials", "Testimonials"],
  ["/blog.html", "Blog", "blog"],
];

function navLink([href, label, page], current, footer = false) {
  const selected = page === current ? ' aria-current="page"' : "";
  const className = !footer && selected ? ' class="current"' : "";
  return `<a href="${href}"${className}${selected}>${label}</a>`;
}

export function renderLayout({ page, title, description, body, enquiryMode = null }) {
  const canonical = page === "index" ? "https://bentokumiko.com/" : `https://bentokumiko.com/${page}.html`;
  const enquiryCurrent = page === "enquire" ? ' current" aria-current="page' : "";
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="description" content="${description}" />
  <meta name="color-scheme" content="light" />
  <link rel="canonical" href="${canonical}" />
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Shippori+Mincho+B1:wght@500;600;700;800&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/assets/styles/base.css" />
  <link rel="stylesheet" href="/assets/styles/${page}.css" />
  <title>${title}</title>
</head>
<body data-page="${page}">
  <a class="skip-link" href="#main-content">Skip to main content</a>
  <header class="site" id="siteHeader">
    <div class="wrap header-in">
      <a class="brand" href="/index.html" aria-label="Bento Kumiko — home">
        <span class="hanko" aria-hidden="true">久</span>
        <span><span class="brand-name">Bento Kumiko</span><br /><span class="brand-sub">Japan Travel Planner</span></span>
      </a>
      <button class="nav-toggle" id="navToggle" type="button" aria-expanded="false" aria-controls="mainNav" aria-label="Open menu">☰</button>
      <nav class="main" id="mainNav" aria-label="Main">
        ${navigation.map((item) => navLink(item, page)).join("\n        ")}
        <a class="btn btn-red btn-small${enquiryCurrent}" href="/enquire.html">Enquire</a>
      </nav>
    </div>
  </header>
  <div id="main-content" tabindex="-1">${body}</div>
  <footer class="site">
    <div class="wrap foot-in">
      <div class="foot-brand">
        <span class="hanko" aria-hidden="true">久</span>
        <span><span class="brand-name foot-brand-name">Bento Kumiko</span><br /><span class="brand-sub">Japan Travel Planner</span></span>
      </div>
      <nav class="foot-links" aria-label="Footer">
        ${navigation.map((item) => navLink(item, page, true)).join("\n        ")}
        <a href="/enquire.html"${page === "enquire" ? ' aria-current="page"' : ""}>Enquire</a>
        <a href="https://dokomaps.com/bentokumiko" target="_blank" rel="noopener">My Japan maps</a>
      </nav>
      <p class="foot-note">Bento Kumiko · Japan Travel Planner — planned personally in Japan, in English, French and Japanese. Every place I recommend is one I know and love; no paid placements, ever.</p>
    </div>
  </footer>
  <script src="/assets/scripts/site.js" defer></script>
  ${page === "index" ? '<script src="/assets/scripts/testimonial-popup.js" defer></script>' : ""}
  ${enquiryMode === "tally" ? '<script src="https://tally.so/widgets/embed.js" defer></script>\n  <script src="/assets/scripts/tally-embed.js" defer></script>' : ""}
  ${enquiryMode === "preview" ? '<script src="/assets/scripts/enquiry-preview.js" defer></script>' : ""}
</body>
</html>\n`;
}
