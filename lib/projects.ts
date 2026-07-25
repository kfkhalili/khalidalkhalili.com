import { toLocale, type Locale } from "@/lib/i18n";

export type ProjectStatus = "live" | "beta" | "building";

/** A thing I've built, resolved to one locale, linking out to its own site. */
export type Project = {
  slug: string;
  name: string;
  url: string;
  status: ProjectStatus;
  date: string; // last commit date (ISO), used for ordering
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
  date: string; // last commit date (ISO), used for ordering
  icon?: string;
  iconBg?: string;
  copy: Record<Locale, ProjectCopy>;
};

// Curated order, most notable first.
const DEFS: ProjectDef[] = [
  {
    slug: "x-trust-radar",
    name: "X Trust Radar",
    url: "https://www.xtrustradar.com",
    status: "live",
    date: "2026-07-05",
    icon: "/projects/xtrustradar.png",
    copy: {
      en: {
        description:
          "Check how trustworthy an X (Twitter) account is through metadata analysis. A quick credibility signal for researchers, journalists, and anyone vetting an account.",
        tags: ["Twitter", "Verification"],
      },
      de: {
        description:
          "Prüfe die Vertrauenswürdigkeit eines X-(Twitter-)Kontos per Metadaten-Analyse. Ein schnelles Glaubwürdigkeits-Signal für Recherche, Journalismus und alle, die ein Konto prüfen.",
        tags: ["Twitter", "Verifizierung"],
      },
      ar: {
        description:
          "تحقّق من مدى موثوقية حساب X (تويتر) عبر تحليل البيانات الوصفية. مؤشّرٌ سريعٌ للمصداقية للباحثين والصحفيين ولكلّ من يريد التحقّق من حساب.",
        tags: ["تويتر", "تحقّق"],
      },
    },
  },
  {
    slug: "tickered",
    name: "Tickered",
    url: "https://www.tickered.com",
    status: "beta",
    date: "2026-06-27",
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
    date: "2026-03-12",
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
    slug: "halal-ada",
    name: "Halal ADA",
    url: "https://www.halalada.com",
    status: "live",
    date: "2025-12-20",
    icon: "/projects/halalada.png",
    iconBg: "#2e2e2e",
    copy: {
      en: {
        description:
          "A halal staking pool on Cardano. Delegate ADA to earn rewards with no lending or interest, on transparent, professionally run infrastructure.",
        tags: ["Cardano", "Halal finance"],
      },
      de: {
        description:
          "Ein Halal-Staking-Pool auf Cardano. Delegiere ADA und verdiene Belohnungen, ganz ohne Verleih oder Zinsen, auf transparenter, professionell betriebener Infrastruktur.",
        tags: ["Cardano", "Halal-Finanzen"],
      },
      ar: {
        description:
          "مجمّع تفويضٍ حلال على شبكة كاردانو. فوّض عملات ADA لتكسب مكافآت دون إقراضٍ أو فائدة، على بنيةٍ تحتيةٍ شفّافةٍ ومُدارةٍ باحتراف.",
        tags: ["كاردانو", "تمويل حلال"],
      },
    },
  },
  {
    slug: "deen-trusts",
    name: "Deen Trusts",
    url: "https://www.deentrusts.com",
    status: "building",
    date: "2026-06-30",
    icon: "/projects/deentrusts.png",
    copy: {
      en: {
        description:
          "A page-faithful Quran reader with authentic typography, tafsir, recitation, and memorization. Fully offline, with no accounts, no ads, and no tracking.",
        tags: ["Quran", "Mobile app"],
      },
      de: {
        description:
          "Ein seitengetreuer Koran-Leser mit authentischer Typografie, Tafsir, Rezitation und Auswendiglernen. Komplett offline, ohne Konten, ohne Werbung und ohne Tracking.",
        tags: ["Koran", "Mobile App"],
      },
      ar: {
        description:
          "مصحفٌ رقميٌّ مطابقٌ للصفحة بخطٍّ أصيل، مع التفسير والتلاوة والحفظ. يعمل دون اتصال بالكامل، بلا حسابات ولا إعلانات ولا تتبّع.",
        tags: ["القرآن", "تطبيق جوال"],
      },
    },
  },
  {
    slug: "zallija",
    name: "Zallija",
    url: "https://www.zallija.com",
    status: "live",
    date: "2026-07-04",
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
    date: "2026-03-06",
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
  const loc = toLocale(lang);
  const c = def.copy[loc];
  return {
    slug: def.slug,
    name: def.name,
    url: def.url,
    status: def.status,
    date: def.date,
    icon: def.icon,
    iconBg: def.iconBg,
    description: c.description,
    tags: c.tags,
  };
}

/** All projects, localized to `lang`, newest last-commit date first. */
export function getProjects(lang: string): Project[] {
  return DEFS.map((def) => resolve(def, lang)).sort((a, b) =>
    a.date < b.date ? 1 : a.date > b.date ? -1 : 0,
  );
}
