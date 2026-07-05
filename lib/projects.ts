import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n";

export type ProjectStatus = "live" | "beta" | "building";

/** A thing I've built, resolved to one locale, linking out to its own site. */
export type Project = {
  slug: string;
  name: string;
  url: string;
  status: ProjectStatus;
  year: string;
  description: string;
  tags: string[];
  icon?: string;
};

type ProjectCopy = { description: string; tags: string[] };

// Locale-independent facts live on the def; the blurb + tags are per locale, so one
// entry yields a localized Project per request (same shape as the explorables registry).
type ProjectDef = {
  slug: string;
  name: string;
  url: string;
  status: ProjectStatus;
  year: string;
  icon?: string;
  copy: Record<Locale, ProjectCopy>;
};

// Curated order, most notable first.
const DEFS: ProjectDef[] = [
  {
    slug: "tickered",
    name: "Tickered",
    url: "https://www.tickered.com",
    status: "beta",
    year: "2026",
    icon: "/projects/tickered.png",
    copy: {
      en: {
        description:
          "Turns complex market data into interactive, digestible visualizations. Spot trends, follow the moves, and collect the insights that matter to you.",
        tags: ["Markets", "Data viz"],
      },
      de: {
        description:
          "Verwandelt komplexe Marktdaten in interaktive, verständliche Visualisierungen. Erkenne Trends, verfolge die Bewegungen und sammle die Erkenntnisse, die für dich zählen.",
        tags: ["Märkte", "Datenvisualisierung"],
      },
      ar: {
        description:
          "يحوّل بيانات السوق المعقّدة إلى رسومٍ تفاعليةٍ سهلة الاستيعاب. اكتشف الاتجاهات، وتابع تحرّكات السوق، واجمع الرؤى التي تهمّك.",
        tags: ["أسواق مالية", "تصوير البيانات"],
      },
    },
  },
  {
    slug: "gcp-icons",
    name: "GCP Icons",
    url: "https://gcp-icons-showcase.vercel.app/",
    status: "live",
    year: "2026",
    copy: {
      en: {
        description:
          "Google Cloud's official architecture icons, packaged as clean, unmodified SVGs for diagrams and apps. Published on npm, with a browsable showcase.",
        tags: ["Icons", "Open source"],
      },
      de: {
        description:
          "Die offiziellen Architektur-Icons von Google Cloud, als saubere, unveränderte SVGs für Diagramme und Apps verpackt. Auf npm veröffentlicht, mit durchsuchbarer Übersicht.",
        tags: ["Icons", "Open Source"],
      },
      ar: {
        description:
          "أيقونات Google Cloud المعمارية الرسمية، محزومةً كملفات SVG نظيفة دون تعديل، لاستخدامها في المخططات والتطبيقات. منشورةٌ على npm مع معرضٍ قابلٍ للتصفّح.",
        tags: ["أيقونات", "مفتوح المصدر"],
      },
    },
  },
];

function resolve(def: ProjectDef, lang: string): Project {
  const loc: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const c = def.copy[loc];
  return {
    slug: def.slug,
    name: def.name,
    url: def.url,
    status: def.status,
    year: def.year,
    icon: def.icon,
    description: c.description,
    tags: c.tags,
  };
}

/** All projects, localized to `lang`, in curated order. */
export function getProjects(lang: string): Project[] {
  return DEFS.map((def) => resolve(def, lang));
}
