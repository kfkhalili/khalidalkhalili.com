import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n";

/** Labels the interactive sim needs, passed from the (server) body to the client sim. */
export type SimStrings = {
  allocation: string;
  allocationAria: string;
  presets: string[]; // 4 archetype labels, aligned with the sim's fixed values
  bars: [string, string, string]; // velocity, tech debt, morale
  week: string;
  running: string;
  paused: string;
  log: {
    critical: string;
    warning: string;
    stalled: string;
    healthy: string;
    normal: string;
  };
};

/**
 * All copy for the technical-debt explorable, per locale. Prose strings may carry
 * inline HTML (<strong>, <em>, <a>, <code>); they're authored here, not user
 * input, and rendered via dangerouslySetInnerHTML inside a single JSX skeleton.
 */
export type TechDebtContent = {
  title: string;
  description: string;
  tags: string[];
  intro: string;
  ousterhout: string;
  accumulate: string;
  archetypesHeading: string;
  archetypes: string[];
  modelHeading: string;
  modelIntro: string;
  modelSteps: string[];
  trap: string;
  hindsightHeading: string;
  details: [string, string][]; // [summary, bodyHTML]
  conclusionHeading: string;
  conclusion: string;
  talkIntro: string;
  videoTitle: string;
  sim: SimStrings;
};

const BOOK = `https://www.amazon.com/dp/1732102201`;
const TALK = `https://www.bigtechday.com/`;

const en: TechDebtContent = {
  title: `Visualizing the Drag of Technical Debt`,
  description: `An interactive model of technical debt as a drag coefficient on team velocity: the tension between shipping fast now and investing in design.`,
  tags: [`Explorable`, `Software Design`],
  intro: `Technical debt is often discussed as a metaphor, but it behaves more like a physical law: it is a drag coefficient on your team's velocity.`,
  ousterhout: `In <em><a href="${BOOK}" target="_blank" rel="noopener noreferrer">A Philosophy of Software Design</a></em>, John Ousterhout defines complexity as "anything related to the structure of a software system that makes it hard to understand and modify". This interactive model visualizes that friction. It explores the tension between <strong>Tactical Programming</strong> (shipping fast now) and <strong>Strategic Programming</strong> (investing in design for the future).`,
  accumulate: `Complexity accumulates whether we like it or not. The only influence we have is how much time we set for dealing with it. More time to fix bugs and refactor code means you have less time to ship features, so you'll need some kind of strategy.`,
  archetypesHeading: `Four Archetypes`,
  archetypes: [
    `<strong>Startup Rush (10%):</strong> The "Tactical" approach. You ship fast early on, but you are borrowing against the future. Eventually, the debt load becomes so heavy that morale and velocity collapse.`,
    `<strong>Sustainable (30%):</strong> The "Strategic" sweet spot. You invest just enough (about a third of your time) to keep debt flat. This yields the highest long-term velocity.`,
    `<strong>Enterprise Safe (50%):</strong> A low-risk, lower-speed approach where stability is prioritized over new features.`,
    `<strong>Full Refactor (80%):</strong> The emergency brake. You stop shipping to clean up the mess. It works, but it's a painful, slow recovery.`,
  ],
  modelHeading: `How the Model Works`,
  modelIntro: `This simulation isn't random. It is driven by the battle between two opposing forces: <strong>Entropy</strong> and <strong>Investment</strong>.`,
  modelSteps: [
    `<strong>The Growth of Complexity (Entropy).</strong> Software naturally tends toward disorder as features are added, and if you do nothing, debt grows, and the more it grows, the more it compounds.`,
    `<strong>The Payback (Investment).</strong> By allocating time to cleanup, you generate a "payback" rate. The goal is to find the equilibrium where your payback matches the natural growth of complexity.`,
    `<strong>The Drag on Velocity.</strong> This is the core mechanic: velocity isn't just about how fast you type. It is <code>100% − (Drag from Debt) − (Time Spent Refactoring)</code>.`,
  ],
  trap: `<strong>The Trap:</strong> If you stop refactoring, you save time initially (velocity spikes). But as debt accumulates, the "Drag" component gets massive, eventually strangling your speed far more than the refactoring ever would have.`,
  hindsightHeading: `Hindsight is 20/20`,
  details: [
    [
      `100% Velocity is a Warning Sign`,
      `If a team is moving at "100," they are borrowing time from the future. The "missing" 30% velocity in a healthy team isn't waste; it is the <strong>Cost of Doing Business</strong>. Communication, design, and maintenance are hard work.`,
    ],
    [
      `The Euphoric Developer is a Myth`,
      `A morale of 85–90% is the realistic ceiling. The gap between 85 and 100 represents <strong>Professional Discipline</strong>: the necessary friction of writing tests, documentation, and code reviews. "Perfectly happy" usually implies skipping the hard parts.`,
    ],
    [
      `Debt Earns Interest`,
      `Technical debt doesn't just sit there; it compounds. As complexity grows, the "tax" on every new line of code increases. If you wait too long, the <strong>Break-Even Point</strong> for refactoring becomes impossibly high.`,
    ],
    [
      `Shipping is Oxygen`,
      `While developers hate bad code, they also hate <em>not</em> shipping. A strategy of 100% refactoring (Gold Plating) kills morale just as fast as 0% refactoring (Spaghetti Code). Engineers need to feel the momentum of delivery to stay engaged.`,
    ],
    [
      `"Economic" Point of No Return`,
      `Technical debt is fatal not when code is unfixable, but when the <strong>cost of recovery</strong> becomes unpayable. At saturation, the required "Full Refactor" means shipping nothing for months. This is <strong>Economic Bankruptcy</strong>.`,
    ],
    [
      `Clean Code is Not the Goal`,
      `<strong>70% Velocity</strong> (with its associated maintenance cost) is better than <strong>40% Velocity</strong> (perfect code). If you have 0% debt but are moving slowly because you are polishing code, you are failing just as badly as the team with high debt. The goal is the <em>sustainable maximum</em>.`,
    ],
  ],
  conclusionHeading: `Conclusion`,
  conclusion: `The simulation demonstrates Ousterhout's central thesis: <strong>complexity accumulates when you don't invest in design.</strong> The most effective teams aren't the ones who type the fastest; they are the ones who maintain a "Sustainable" balance, preventing the drag coefficient from taking over.`,
  talkIntro: `Check out the talk I attended at TNG's <a href="${TALK}" target="_blank" rel="noopener noreferrer">Big Techday</a> 24:`,
  videoTitle: `YouTube video player`,
  sim: {
    allocation: `Refactor allocation`,
    allocationAria: `Refactor allocation percentage`,
    presets: [`Startup Rush`, `Sustainable`, `Enterprise Safe`, `Full Refactor`],
    bars: [`Velocity`, `Tech debt`, `Morale`],
    week: `Week`,
    running: `● running`,
    paused: `❚❚ paused`,
    log: {
      critical: `CRITICAL: System ossified. Rewrite required.`,
      warning: `WARNING: You have passed the "Tipping Point". Interest is compounding fast.`,
      stalled: `STALLED: The "Vicious Cycle" has consumed all velocity.`,
      healthy: `Healthy: The team is maintaining a sustainable, professional pace.`,
      normal: `Operating normally. Watch the "Refactor Allocation" slider.`,
    },
  },
};

const de: TechDebtContent = {
  title: `Die Bremswirkung technischer Schulden sichtbar gemacht`,
  description: `Ein interaktives Modell technischer Schulden als Bremskoeffizient auf die Geschwindigkeit eines Teams: das Spannungsfeld zwischen schnellem Ausliefern und Investition in gutes Design.`,
  tags: [`Explorable`, `Softwaredesign`],
  intro: `Technische Schulden werden oft als Metapher behandelt, doch sie verhalten sich eher wie ein Naturgesetz: Sie sind ein Bremskoeffizient auf die Geschwindigkeit deines Teams.`,
  ousterhout: `In <em><a href="${BOOK}" target="_blank" rel="noopener noreferrer">A Philosophy of Software Design</a></em> definiert John Ousterhout Komplexität als „alles an der Struktur eines Softwaresystems, das es schwer verständlich und schwer änderbar macht“. Dieses interaktive Modell macht diese Reibung sichtbar. Es beleuchtet das Spannungsfeld zwischen <strong>taktischer Programmierung</strong> (jetzt schnell ausliefern) und <strong>strategischer Programmierung</strong> (in Design für die Zukunft investieren).`,
  accumulate: `Komplexität sammelt sich an, ob es uns gefällt oder nicht. Das Einzige, worauf wir Einfluss haben, ist, wie viel Zeit wir uns nehmen, um mit ihr umzugehen. Mehr Zeit für Bugfixes und Refactoring bedeutet weniger Zeit, um Features auszuliefern. Du brauchst also eine Strategie.`,
  archetypesHeading: `Vier Archetypen`,
  archetypes: [
    `<strong>Startup-Rush (10 %):</strong> Der „taktische“ Ansatz. Anfangs lieferst du schnell, doch du borgst dir Zeit aus der Zukunft. Irgendwann wird die Schuldenlast so schwer, dass Moral und Geschwindigkeit zusammenbrechen.`,
    `<strong>Nachhaltig (30 %):</strong> Der „strategische“ Sweet Spot. Du investierst gerade genug (etwa ein Drittel deiner Zeit), um die Schulden konstant zu halten. Das bringt langfristig die höchste Geschwindigkeit.`,
    `<strong>Enterprise-sicher (50 %):</strong> Ein risikoarmer, langsamerer Ansatz, bei dem Stabilität Vorrang vor neuen Features hat.`,
    `<strong>Komplettes Refactoring (80 %):</strong> Die Notbremse. Du lieferst nichts mehr aus, um aufzuräumen. Es funktioniert, aber die Erholung ist schmerzhaft und langsam.`,
  ],
  modelHeading: `Wie das Modell funktioniert`,
  modelIntro: `Diese Simulation ist nicht zufällig. Sie wird vom Kampf zwischen zwei gegensätzlichen Kräften angetrieben: <strong>Entropie</strong> und <strong>Investition</strong>.`,
  modelSteps: [
    `<strong>Das Wachstum der Komplexität (Entropie).</strong> Software neigt von Natur aus zur Unordnung, je mehr Features hinzukommen. Tust du nichts, wachsen die Schulden, und je mehr sie wachsen, desto stärker verzinsen sie sich.`,
    `<strong>Die Tilgung (Investition).</strong> Indem du Zeit fürs Aufräumen einplanst, erzeugst du eine „Tilgungsrate“. Das Ziel ist das Gleichgewicht, in dem deine Tilgung dem natürlichen Wachstum der Komplexität entspricht.`,
    `<strong>Die Bremswirkung auf die Geschwindigkeit.</strong> Das ist der Kernmechanismus: Geschwindigkeit hängt nicht nur davon ab, wie schnell du tippst. Sie ist <code>100 % − (Bremse durch Schulden) − (Zeit fürs Refactoring)</code>.`,
  ],
  trap: `<strong>Die Falle:</strong> Hörst du mit dem Refactoring auf, sparst du zunächst Zeit (die Geschwindigkeit schnellt hoch). Doch während die Schulden anwachsen, wird die „Bremse“ gewaltig und würgt dein Tempo weit stärker ab, als das Refactoring es je getan hätte.`,
  hindsightHeading: `Hinterher ist man immer klüger`,
  details: [
    [
      `100 % Geschwindigkeit ist ein Warnsignal`,
      `Bewegt sich ein Team mit „100“, borgt es sich Zeit aus der Zukunft. Die „fehlenden“ 30 % Geschwindigkeit in einem gesunden Team sind keine Verschwendung; sie sind die <strong>Betriebskosten</strong>. Kommunikation, Design und Wartung sind harte Arbeit.`,
    ],
    [
      `Der euphorische Entwickler ist ein Mythos`,
      `Eine Moral von 85–90 % ist die realistische Obergrenze. Die Lücke zwischen 85 und 100 steht für <strong>professionelle Disziplin</strong>: die notwendige Reibung durch Tests, Dokumentation und Code-Reviews. „Rundum glücklich“ heißt meist, die harten Teile auszulassen.`,
    ],
    [
      `Schulden werfen Zinsen ab`,
      `Technische Schulden liegen nicht einfach herum; sie verzinsen sich. Mit wachsender Komplexität steigt die „Steuer“ auf jede neue Codezeile. Wartest du zu lange, wird der <strong>Break-Even-Punkt</strong> fürs Refactoring unerreichbar hoch.`,
    ],
    [
      `Ausliefern ist Sauerstoff`,
      `Entwickler hassen schlechten Code, aber sie hassen es genauso, <em>nicht</em> auszuliefern. Eine Strategie mit 100 % Refactoring (Gold Plating) tötet die Moral genauso schnell wie 0 % Refactoring (Spaghetticode). Ingenieure müssen den Schwung der Auslieferung spüren, um bei der Sache zu bleiben.`,
    ],
    [
      `Der „ökonomische“ Punkt ohne Wiederkehr`,
      `Technische Schulden sind nicht dann tödlich, wenn der Code unreparierbar ist, sondern wenn die <strong>Kosten der Erholung</strong> unbezahlbar werden. Bei Sättigung bedeutet das nötige „komplette Refactoring“, monatelang nichts auszuliefern. Das ist <strong>wirtschaftlicher Bankrott</strong>.`,
    ],
    [
      `Sauberer Code ist nicht das Ziel`,
      `<strong>70 % Geschwindigkeit</strong> (mitsamt Wartungskosten) sind besser als <strong>40 % Geschwindigkeit</strong> (perfekter Code). Hast du 0 % Schulden, kommst aber nur langsam voran, weil du Code polierst, scheiterst du genauso wie das Team mit hohen Schulden. Das Ziel ist das <em>nachhaltige Maximum</em>.`,
    ],
  ],
  conclusionHeading: `Fazit`,
  conclusion: `Die Simulation belegt Ousterhouts zentrale These: <strong>Komplexität sammelt sich an, wenn man nicht in Design investiert.</strong> Die effektivsten Teams sind nicht die, die am schnellsten tippen; es sind die, die eine „nachhaltige“ Balance halten und verhindern, dass der Bremskoeffizient die Oberhand gewinnt.`,
  talkIntro: `Sieh dir den Vortrag an, den ich auf TNGs <a href="${TALK}" target="_blank" rel="noopener noreferrer">Big Techday</a> 24 besucht habe:`,
  videoTitle: `YouTube-Videoplayer`,
  sim: {
    allocation: `Refactoring-Anteil`,
    allocationAria: `Refactoring-Anteil in Prozent`,
    presets: [`Startup-Rush`, `Nachhaltig`, `Enterprise-sicher`, `Komplettes Refactoring`],
    bars: [`Geschwindigkeit`, `Tech-Schulden`, `Moral`],
    week: `Woche`,
    running: `● läuft`,
    paused: `❚❚ pausiert`,
    log: {
      critical: `KRITISCH: System verkalkt. Neuschreiben erforderlich.`,
      warning: `WARNUNG: Du hast den „Kipppunkt“ überschritten. Die Zinsen wachsen rasant.`,
      stalled: `STILLSTAND: Der „Teufelskreis“ hat die gesamte Geschwindigkeit verschlungen.`,
      healthy: `Gesund: Das Team hält ein nachhaltiges, professionelles Tempo.`,
      normal: `Normalbetrieb. Behalte den Regler „Refactoring-Anteil“ im Auge.`,
    },
  },
};

const ar: TechDebtContent = {
  title: `الأثر الكابح للدَّين التقني`,
  description: `نموذجٌ تفاعليّ يُظهر الدَّين التقني بوصفه معاملَ كبحٍ على سرعة الفريق: التوتر بين الإطلاق السريع الآن والاستثمار في التصميم.`,
  tags: [`استكشاف تفاعلي`, `تصميم البرمجيات`],
  intro: `غالبًا ما يُناقَش الدَّين التقني بوصفه استعارة، لكنه يتصرّف أشبه بقانونٍ فيزيائي: فهو معاملُ كبحٍ يُبطّئ سرعة فريقك.`,
  ousterhout: `في كتاب <em><a href="${BOOK}" target="_blank" rel="noopener noreferrer">A Philosophy of Software Design</a></em>، يُعرّف جون أوسترهاوت التعقيد بأنه «كل ما يتعلّق ببنية نظامٍ برمجي ويجعله صعب الفهم والتعديل». يجسّد هذا النموذج التفاعلي ذلك الاحتكاك، ويستكشف التوتر بين <strong>البرمجة التكتيكية</strong> (الإطلاق السريع الآن) و<strong>البرمجة الاستراتيجية</strong> (الاستثمار في التصميم من أجل المستقبل).`,
  accumulate: `يتراكم التعقيد شئنا أم أبينا. وما يمكننا التحكم فيه هو مقدار الوقت الذي نخصّصه للتعامل معه. فالمزيد من الوقت لإصلاح العيوب وإعادة هيكلة الشيفرة يعني وقتًا أقل لإطلاق الميزات، لذا لا بدّ من استراتيجيةٍ ما.`,
  archetypesHeading: `أربعة أنماط`,
  archetypes: [
    `<strong>الاندفاع الأولي (10%):</strong> النهج «التكتيكي». تُطلق الميزات بسرعةٍ في البداية، لكنك تقترض من المستقبل. وفي النهاية تصبح حِمولة الدَّين ثقيلةً إلى حدٍّ تنهار عنده المعنويات والسرعة.`,
    `<strong>مستدام (30%):</strong> نقطة التوازن «الاستراتيجية». تستثمر ما يكفي تمامًا (نحو ثلث وقتك) لإبقاء الدَّين ثابتًا. وهذا يحقّق أعلى سرعةٍ على المدى الطويل.`,
    `<strong>أمان المؤسسة (50%):</strong> نهجٌ منخفض المخاطر وأبطأ، يُقدَّم فيه الاستقرار على الميزات الجديدة.`,
    `<strong>إعادة هيكلة شاملة (80%):</strong> مكابح الطوارئ. تتوقّف عن الإطلاق لتنظيف الفوضى. ينجح الأمر، لكنه تعافٍ بطيءٌ ومؤلم.`,
  ],
  modelHeading: `كيف يعمل النموذج`,
  modelIntro: `هذه المحاكاة ليست عشوائية. إنها مدفوعةٌ بصراعٍ بين قوّتين متضادّتين: <strong>الإنتروبيا</strong> و<strong>الاستثمار</strong>.`,
  modelSteps: [
    `<strong>نموّ التعقيد (الإنتروبيا).</strong> تميل البرمجيات بطبيعتها إلى الفوضى كلما أُضيفت ميزات، وإن لم تفعل شيئًا نما الدَّين، وكلما نما تضاعف بوتيرةٍ أسرع.`,
    `<strong>السداد (الاستثمار).</strong> بتخصيص وقتٍ للتنظيف، تُولّد معدّل «سداد». والهدف هو بلوغ التوازن الذي يعادل فيه سدادُك النموَّ الطبيعي للتعقيد.`,
    `<strong>الكبح على السرعة.</strong> هذه هي الآلية الجوهرية: السرعة ليست مجرّد مدى سرعة كتابتك، بل هي <code dir="ltr">100% − (كبح الدَّين) − (وقت إعادة الهيكلة)</code>.`,
  ],
  trap: `<strong>الفخّ:</strong> إن توقّفت عن إعادة الهيكلة، وفّرت وقتًا في البداية (فتقفز السرعة). لكن مع تراكم الدَّين، يتضخّم عنصر «الكبح» حتى يخنق سرعتك أكثر بكثيرٍ مما كان الاستمرار في إعادة الهيكلة ليكلّفك.`,
  hindsightHeading: `الرؤية واضحةٌ بعد فوات الأوان`,
  details: [
    [
      `سرعة 100% إشارةُ إنذار`,
      `إن كان الفريق يتحرّك بسرعة «100»، فهو يقترض وقتًا من المستقبل. والـ30% «المفقودة» من سرعة الفريق السليم ليست هدرًا؛ إنها <strong>الكلفة الطبيعية للعمل</strong>. فالتواصل والتصميم والصيانة عملٌ شاقّ.`,
    ],
    [
      `المطوّر المبتهج وهمٌ`,
      `سقف المعنويات الواقعي هو 85–90%. والفجوة بين 85 و100 تمثّل <strong>الانضباط المهني</strong>: الاحتكاك الضروري لكتابة الاختبارات والتوثيق ومراجعات الشيفرة. أما «السعادة التامة» فتعني عادةً تخطّي الأجزاء الصعبة.`,
    ],
    [
      `الدَّين يجني فائدة`,
      `الدَّين التقني لا يبقى ساكنًا؛ بل يتراكم بفائدةٍ مركّبة. فمع نموّ التعقيد ترتفع «الضريبة» على كل سطرٍ جديدٍ من الشيفرة. وإن انتظرت طويلًا، صارت <strong>نقطة التعادل</strong> لإعادة الهيكلة مرتفعةً إلى حدٍّ يستحيل بلوغه.`,
    ],
    [
      `الإطلاق أُكسجين`,
      `يكره المطوّرون الشيفرة السيّئة، لكنهم يكرهون <em>عدم</em> الإطلاق بالقدر نفسه. فاستراتيجية إعادة الهيكلة بنسبة 100% (التذهيب) تقتل المعنويات بالسرعة نفسها التي يقتلها بها 0% (كود السباغيتي). يحتاج المهندسون إلى الإحساس بزخم التسليم كي يبقوا منخرطين.`,
    ],
    [
      `نقطةُ اللاعودة «الاقتصادية»`,
      `الدَّين التقني قاتلٌ لا حين تستحيل معالجة الشيفرة، بل حين تصبح <strong>كلفة التعافي</strong> غير قابلةٍ للسداد. فعند التشبّع، تعني «إعادة الهيكلة الشاملة» المطلوبة ألّا تُطلق شيئًا لأشهر. هذا هو <strong>الإفلاس الاقتصادي</strong>.`,
    ],
    [
      `الشيفرة النظيفة ليست الهدف`,
      `<strong>سرعة 70%</strong> (مع ما يصحبها من كلفة صيانة) أفضل من <strong>سرعة 40%</strong> (شيفرة مثالية). فإن كان دَينُك 0% لكنك تتحرّك ببطءٍ لأنك تصقل الشيفرة، فأنت تفشل بالقدر نفسه الذي يفشل به فريقٌ غارقٌ في الدَّين. الهدف هو <em>الحدّ الأقصى المستدام</em>.`,
    ],
  ],
  conclusionHeading: `الخلاصة`,
  conclusion: `تُثبت المحاكاة أطروحة أوسترهاوت المركزية: <strong>التعقيد يتراكم حين لا تستثمر في التصميم.</strong> فأكثر الفرق فعاليةً ليست تلك التي تكتب أسرع، بل التي تحافظ على توازنٍ «مستدام» يمنع معاملَ الكبح من السيطرة.`,
  talkIntro: `شاهد المحاضرة التي حضرتُها في <a href="${TALK}" target="_blank" rel="noopener noreferrer">Big Techday</a> 24 من TNG:`,
  videoTitle: `مشغّل فيديو يوتيوب`,
  sim: {
    allocation: `حصّة إعادة الهيكلة`,
    allocationAria: `نسبة حصّة إعادة الهيكلة`,
    presets: [`الاندفاع الأولي`, `مستدام`, `أمان المؤسسة`, `إعادة هيكلة شاملة`],
    bars: [`السرعة`, `الدَّين التقني`, `المعنويات`],
    week: `الأسبوع`,
    running: `● يعمل`,
    paused: `❚❚ متوقّف`,
    log: {
      critical: `حرِج: تحجّر النظام. لا بدّ من إعادة الكتابة.`,
      warning: `تحذير: تجاوزت «نقطة التحوّل». الفائدة تتراكم بسرعة.`,
      stalled: `تعطّل: التهمت «الحلقة المفرغة» كامل السرعة.`,
      healthy: `سليم: يحافظ الفريق على وتيرةٍ مستدامةٍ ومهنية.`,
      normal: `يعمل بشكل طبيعي. راقب شريط «حصّة إعادة الهيكلة».`,
    },
  },
};

export const TD_CONTENT: Record<Locale, TechDebtContent> = { en, de, ar };

export function getTechDebtContent(lang: string): TechDebtContent {
  return TD_CONTENT[isLocale(lang) ? lang : DEFAULT_LOCALE];
}
