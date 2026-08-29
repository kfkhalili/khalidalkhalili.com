export type ProjectStatus = "live" | "beta" | "building";

/** A thing I've built, linking out to its own site. */
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

// Curated order, most notable first.
const DEFS: Project[] = [
  {
    slug: "x-trust-radar",
    name: "X Trust Radar",
    url: "https://www.xtrustradar.com",
    status: "live",
    date: "2026-07-05",
    icon: "/projects/xtrustradar.png",
    description:
      "Check how trustworthy an X (Twitter) account is through metadata analysis. A quick credibility signal for researchers, journalists, and anyone vetting an account.",
    tags: ["Twitter", "Verification"],
  },
  {
    slug: "tickered",
    name: "Tickered",
    url: "https://www.tickered.com",
    status: "beta",
    date: "2026-06-27",
    icon: "/projects/tickered.png",
    description:
      "Turns complex market data into interactive, digestible visualizations. Spot trends, follow the moves, and collect the insights that matter to you.",
    tags: ["Markets", "Data viz"],
  },
  {
    slug: "scalecanvas",
    name: "ScaleCanvas",
    url: "https://www.scalecanvas.com",
    status: "live",
    date: "2026-03-12",
    icon: "/projects/scalecanvas.png",
    description:
      "An AI interviewer for system-design and coding practice. Run FAANG-style technical interviews on a live canvas and get feedback as you go.",
    tags: ["AI", "Interview prep"],
  },
  {
    slug: "halal-ada",
    name: "Halal ADA",
    url: "https://www.halalada.com",
    status: "live",
    date: "2025-12-20",
    icon: "/projects/halalada.png",
    iconBg: "#2e2e2e",
    description:
      "A halal staking pool on Cardano. Delegate ADA to earn rewards with no lending or interest, on transparent, professionally run infrastructure.",
    tags: ["Cardano", "Halal finance"],
  },
  {
    slug: "deen-trusts",
    name: "Deen Trusts",
    url: "https://www.deentrusts.com",
    status: "building",
    date: "2026-06-30",
    icon: "/projects/deentrusts.png",
    description:
      "A page-faithful Quran reader with authentic typography, tafsir, recitation, and memorization. Fully offline, with no accounts, no ads, and no tracking.",
    tags: ["Quran", "Mobile app"],
  },
  {
    slug: "zallija",
    name: "Zallija",
    url: "https://www.zallija.com",
    status: "live",
    date: "2026-07-04",
    icon: "/projects/zallija.png",
    iconBg: "#f6f1e7",
    description:
      "Hand-drafted girih and zellige geometric art, constructed with compass and straightedge and plotted one line at a time. Limited prints on Etsy.",
    tags: ["Geometric art", "Prints"],
  },
  {
    slug: "gcp-icons",
    name: "GCP Icons",
    url: "https://gcp-icons-showcase.vercel.app/",
    status: "live",
    date: "2026-03-06",
    description:
      "Google Cloud's official architecture icons, packaged as clean, unmodified SVGs for diagrams and apps. Published on npm, with a browsable showcase.",
    tags: ["Icons", "Open source"],
  },
];

/** All projects, newest last-commit date first. */
export function getProjects(): Project[] {
  return [...DEFS].sort((a, b) =>
    a.date < b.date ? 1 : a.date > b.date ? -1 : 0,
  );
}
