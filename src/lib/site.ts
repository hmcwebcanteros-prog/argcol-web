export const SITE = {
  name: "Argcol Capital",
  short: "Argcol",
  title: "Argcol Capital — Family Office",
  description:
    "Family office dedicado a la gestión patrimonial, la estrategia de inversión y el acompañamiento de familias e inversores.",
  url: "https://argcol.com.ar",
  author: "Argcol Capital",
  authorPhoto: "/art/autor/argcol-foto.webp",
  location: "",
  locale: "es_AR",
  // Google Apps Script para formularios: newsletter, contacto y lista privada.
  // El script se despliega como aplicación web y se obtiene la URL /exec.
  // URL completada después del despliegue:
  newsletter:
    "https://script.google.com/macros/s/AKfycbxqGZydGL6ttvuPmc8QS9RCtm8eqSOMvrUDQ_9LmzHKa9LYYJ2i6telRYAQbToxOzBR/exec",
  contactForm:
    "https://script.google.com/macros/s/AKfycbxqGZydGL6ttvuPmc8QS9RCtm8eqSOMvrUDQ_9LmzHKa9LYYJ2i6telRYAQbToxOzBR/exec",
  // Alternativa Web3Forms (dejar vacío porque el script de Google ya funciona)
  web3forms: "",
  perPage: 20,
  tagPerPage: 30,
};

/** Secciones con lugar en el menú principal. */
export const SECTIONS = {
  mercado: {
    label: "Mercado",
    kicker: "Finanzas e inversión",
    tagline: "Cierres y resúmenes diarios",
    description:
      "Cierre diario de mercados, resúmenes semanales e informes sobre acciones, bonos, dólar y economía global.",
    lead: "El pulso de la rueda, todos los días. Cierres, informes mensuales y lecturas de largo plazo sobre acciones, bonos, dólar y tasas.",
    count: " textos",
  },
  inversion: {
    label: "Inversión",
    kicker: "Estrategias de inversión",
    tagline: "Análisis y carteras",
    description:
      "Ideas de inversión, carteras tipo lazy portfolio y análisis de estrategias.",
    lead: "Estrategias de inversión de largo plazo, carteras diversificadas y análisis de mercado.",
    count: " textos",
  },
  economia: {
    label: "Economía",
    kicker: "Indicadores macro",
    tagline: "Indicadores y datos",
    description:
      "Informes sobre indicadores económicos, tasas, inflación y política económica.",
    lead: "Variaciones de tasas, inflación, indicadores macroeconómicos y políticas fiscales.",
    count: " textos",
  },
  empresas: {
    label: "Empresas",
    kicker: "Análisis empresarial",
    tagline: "Perfil de empresas",
    description:
      "Análisis de compañías, reportes corporativos y desempeño empresarial.",
    lead: "Perfiles de empresas, análisis corporativo y gobernanza corporativa.",
    count: " textos",
  },
  ratios: {
    label: "Ratios",
    kicker: "Fundamentos financieros",
    tagline: "Cálculo y uso de ratios",
    description:
      "Análisis de ratios financieros clave para la valoración de activos.",
    lead: "ROE, P/E, P/B, ratios de liquidez y solvencia aplicados a las inversiones.",
    count: " textos",
  },
  etf: {
    label: "ETF",
    kicker: "Productos de inversión",
    tagline: "Fondos indexados y ETFs",
    description:
      "Análisis de ETFs, fondos indexados y productos de inversión cotizados.",
    lead: "Comparativa de ETFs, análisis de rendimiento y estrategia con fondos indexados.",
    count: " textos",
  },
  "argcol-e": {
    label: "Argcol - E",
    kicker: "Plataforma de inversión",
    tagline: "Análisis, informes y estrategia",
    description:
      "Informes de inversión, análisis de empresas, estrategia y rendimientos de Argcol - E.",
    lead: "Informes, análisis financieros, estrategia y seguimiento de la plataforma de inversión Argcol - E.",
    count: " textos",
  },
  documentos: {
    label: "Documentos",
    kicker: "Biblioteca",
    tagline: "Documentos e informes",
    description:
      "Documentos, informes y material de referencia de Argcol Capital.",
    lead: "Informes, documentos y material de referencia para consulta.",
    count: " documentos",
  },
} as const;

export type SectionKey = keyof typeof SECTIONS;

export const SECTION_KEYS = Object.keys(SECTIONS) as SectionKey[];

export const isSection = (value: string): value is SectionKey =>
  (SECTION_KEYS as string[]).includes(value);

/** datos verificables del autor/origen. */
export const BIO = {
  born: "",
  birthplace: "",
  home: "Argentina",
  titles: [],
  blog: "Blog de Argcol Capital",
} as const;

/** Redes del sitio. */
export interface Social {
  key: "twitter" | "linkedin" | "instagram" | "facebook";
  label: string;
  handle: string;
  url: string;
}

export const SOCIAL: Social[] = [
  { key: "linkedin", label: "LinkedIn", handle: "@argcol-capital", url: "https://www.linkedin.com/company/argcol-capital" },
  { key: "twitter", label: "X (Twitter)", handle: "@argcol_capital", url: "https://twitter.com/argcol_capital" },
];