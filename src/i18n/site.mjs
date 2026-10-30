export const siteOrigin = "https://bentokumiko.com";

export const locales = {
  en: {
    htmlLang: "en",
    name: "English",
    brandSubtitle: "Japan Travel Planner",
    skipLink: "Skip to main content",
    menuOpen: "Open menu",
    menuClose: "Close menu",
    mainNavigation: "Main",
    footerNavigation: "Footer",
    languageNavigation: "Website language",
    navigation: {
      about: "About",
      service: "Service",
      pricing: "Pricing",
      testimonials: "Testimonials",
      blog: "Blog",
      enquire: "Enquire",
    },
    maps: "My Japan maps",
    footerNote: "Bento Kumiko · Japan Travel Planner — planned personally in Japan, in English, French and Japanese. Every place I recommend is one I know and love; no paid placements, ever.",
  },
  fr: {
    htmlLang: "fr",
    name: "Français",
    brandSubtitle: "Organisation de voyages au Japon",
    skipLink: "Aller au contenu principal",
    menuOpen: "Ouvrir le menu",
    menuClose: "Fermer le menu",
    mainNavigation: "Navigation principale",
    footerNavigation: "Pied de page",
    languageNavigation: "Langue du site",
    navigation: {
      about: "À propos",
      service: "Services",
      pricing: "Tarifs",
      testimonials: "Témoignages",
      blog: "Carnet",
      enquire: "Contact",
    },
    maps: "Mes cartes du Japon (en anglais)",
    footerNote: "Bento Kumiko · Organisation de voyages au Japon — préparés personnellement au Japon, en français, en anglais et en japonais. Chaque adresse que je recommande est un lieu que je connais et que j’aime ; jamais de placement rémunéré.",
  },
};

export const pages = {
  index: {
    source: { en: "index.html", fr: "fr/index.html" },
    output: { en: "index.html", fr: "fr/index.html" },
    route: { en: "/", fr: "/fr/" },
    explicitRoute: { en: "/index.html", fr: "/fr/index.html" },
    style: "index",
    fragments: ["pricing", "testimonials"],
    metadata: {
      en: {
        title: "Bento Kumiko — Japan Travel Planner",
        description: "Kumiko, a Japan-based travel planner, builds personal day-by-day Japan itineraries with stays, transport and a clear budget, delivered as a travel book and an app.",
      },
      fr: {
        title: "Bento Kumiko — Organisation de voyages au Japon",
        description: "Kumiko prépare au Japon des itinéraires sur mesure, jour par jour, avec hébergements, transports et budget clair, livrés sous forme de carnet de voyage et d’application.",
      },
    },
  },
  about: {
    source: { en: "about.html", fr: "fr/a-propos.html" },
    output: { en: "about.html", fr: "fr/a-propos.html" },
    route: { en: "/about.html", fr: "/fr/a-propos.html" },
    style: "about",
    metadata: {
      en: {
        title: "About Kumiko | Bento Kumiko — Japan Travel Planner",
        description: "Meet Kumiko, a Japan-based travel planner who creates personal, day-by-day Japan itineraries in English and French.",
      },
      fr: {
        title: "À propos de Kumiko | Bento Kumiko",
        description: "Découvrez Kumiko, organisatrice de voyages installée au Japon, qui crée en français et en anglais des itinéraires personnels, jour par jour.",
      },
    },
  },
  service: {
    source: { en: "service.html", fr: "fr/services.html" },
    output: { en: "service.html", fr: "fr/services.html" },
    route: { en: "/service.html", fr: "/fr/services.html" },
    style: "service-offers",
    fragments: ["service-trip", "shopping"],
    metadata: {
      en: {
        title: "Japan Trip Planning & Shopping Assistance | Bento Kumiko",
        description: "Choose personal Japan trip planning or a guided shopping day in Kyoto, Osaka, Hiroshima or Tokyo with Kumiko.",
      },
      fr: {
        title: "Voyage sur mesure et shopping au Japon | Bento Kumiko",
        description: "Choisissez un itinéraire au Japon sur mesure ou une journée shopping avec Kumiko à Kyoto, Osaka, Hiroshima ou Tokyo.",
      },
    },
  },
  blog: {
    source: { en: "blog.html", fr: "fr/blog.html" },
    output: { en: "blog.html", fr: "fr/blog.html" },
    route: { en: "/blog.html", fr: "/fr/blog.html" },
    style: "blog",
    metadata: {
      en: {
        title: "Blog | Bento Kumiko — Japan Travel Planner",
        description: "Personal Japan travel notes, practical guest lessons and places Kumiko has visited in Kyoto, Osaka, Kumamoto and Nagano.",
      },
      fr: {
        title: "Carnet de voyage au Japon | Bento Kumiko",
        description: "Conseils pratiques, retours de voyageurs et lieux visités personnellement par Kumiko à Kyoto, Osaka, Kumamoto et Nagano.",
      },
    },
  },
  enquire: {
    source: { en: "enquire.html", fr: "fr/contact.html" },
    output: { en: "enquire.html", fr: "fr/contact.html" },
    route: { en: "/enquire.html", fr: "/fr/contact.html" },
    style: "enquire",
    metadata: {
      en: {
        title: "Enquire | Bento Kumiko — Japan Travel Planner",
        description: "Share your Japan travel timing, party, interests, pace and rough budget with Kumiko in English or French.",
      },
      fr: {
        title: "Votre voyage au Japon | Contacter Bento Kumiko",
        description: "Parlez à Kumiko de vos dates, des voyageurs, de vos envies, de votre rythme et de votre budget indicatif pour votre voyage au Japon.",
      },
    },
  },
  shopping: {
    source: { en: "shopping.html", fr: "fr/shopping.html" },
    output: { en: "shopping.html", fr: "fr/shopping.html" },
    route: { en: "/shopping.html", fr: "/fr/shopping.html" },
    style: "shopping",
    metadata: {
      en: {
        title: "Shopping Day in Japan | Bento Kumiko",
        description: "Book a personal shopping day with Kumiko in Kyoto, Osaka, Hiroshima or Tokyo, with translation and local guidance.",
      },
      fr: {
        title: "Journée shopping au Japon avec Kumiko | Bento Kumiko",
        description: "Passez une journée shopping personnalisée avec Kumiko à Kyoto, Osaka, Hiroshima ou Tokyo, avec traduction et conseils locaux.",
      },
    },
  },
  "404": {
    source: { en: "404.html", fr: "fr/404.html" },
    output: { en: "404.html", fr: "fr/404.html" },
    route: { en: "/404.html", fr: "/fr/404.html" },
    style: "404",
    metadata: {
      en: {
        title: "Page not found | Bento Kumiko",
        description: "The requested Bento Kumiko page could not be found.",
      },
      fr: {
        title: "Page introuvable | Bento Kumiko",
        description: "La page demandée sur Bento Kumiko est introuvable.",
      },
    },
  },
};

export const publicPageKeys = Object.keys(pages).filter((page) => page !== "404");

export function routeFor(locale, page, { explicitHome = false } = {}) {
  const definition = pages[page];
  if (!definition) throw new Error(`Unknown page: ${page}`);
  return explicitHome && definition.explicitRoute?.[locale]
    ? definition.explicitRoute[locale]
    : definition.route[locale];
}

export function canonicalFor(locale, page) {
  return `${siteOrigin}${routeFor(locale, page)}`;
}
