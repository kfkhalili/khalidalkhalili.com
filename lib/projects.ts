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
  iconBg?: string;
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
  iconBg?: string;
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
    slug: "scalecanvas",
    name: "ScaleCanvas",
    url: "https://www.scalecanvas.com",
    status: "live",
    year: "2026",
    icon: "/projects/scalecanvas.png",
    copy: {
      en: {
        description:
          "An AI interviewer for system-design and coding practice. Run FAANG-style technical interviews on a live canvas and get feedback as you go.",
        tags: ["AI", "Interview prep"],
      },
      de: {
        description:
          "Ein KI-Interviewer für System-Design und Coding-Übungen. Führe technische Interviews im FAANG-Stil und erhalte Feedback in Echtzeit.",
        tags: ["KI", "Interviews"],
      },
      ar: {
        description:
          "مُحاوِرٌ بالذكاء الاصطناعي للتدرّب على تصميم الأنظمة ومقابلات البرمجة. خُض مقابلاتٍ تقنيةً بأسلوب شركات FAANG على لوحةٍ حيّة واحصل على ملاحظاتٍ فوريّة.",
        tags: ["ذكاء اصطناعي", "مقابلات"],
      },
    },
  },
  {
    slug: "zallija",
    name: "Zallija",
    url: "https://www.zallija.com",
    status: "live",
    year: "2026",
    icon: "/projects/zallija.png",
    iconBg: "#f6f1e7",
    copy: {
      en: {
        description:
          "Hand-drafted girih and zellige geometric art, constructed with compass and straightedge and plotted one line at a time. Limited prints on Etsy.",
        tags: ["Geometric art", "Prints"],
      },
      de: {
        description:
          "Handgezeichnete geometrische Kunst im Girih- und Zellige-Stil, mit Zirkel und Lineal konstruiert und Linie für Linie geplottet. Limitierte Drucke auf Etsy.",
        tags: ["Geometrische Kunst", "Drucke"],
      },
      ar: {
        description:
          "فنٌّ هندسيٌّ مرسومٌ باليد، مستوحى من الزليج والزخرفة الإسلامية، مُنشأٌ بالفرجار والمسطرة ويُرسم خطًّا خطًّا براسمةٍ قلمية. مطبوعاتٌ محدودة على Etsy.",
        tags: ["فن هندسي", "مطبوعات"],
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
    iconBg: def.iconBg,
    description: c.description,
    tags: c.tags,
  };
}

/** All projects, localized to `lang`, in curated order. */
export function getProjects(lang: string): Project[] {
  return DEFS.map((def) => resolve(def, lang));
}
