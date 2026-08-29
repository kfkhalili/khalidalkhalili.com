
/** Labels the interactive sim needs, passed from the (server) body to the client sim. */
export type SimStrings = {
  allocation: string;
  allocationAria: string;
  presets: string[]; // 4 archetype labels, aligned with the sim's fixed values
  archetypes: string[]; // what each preset costs you, aligned with `presets`
  custom: string; // shown instead when the slider sits between the archetypes
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
  tags: [`Software Design`],
  intro: `Technical debt is often discussed as a metaphor, but it behaves more like a physical law: it is a drag coefficient on your team's velocity. Four strategies cover most of the range. They are represented in the model below. Pick one and watch which bar pays for it.`,
  ousterhout: `In <em><a href="${BOOK}" target="_blank" rel="noopener noreferrer">A Philosophy of Software Design</a></em>, John Ousterhout defines complexity as "anything related to the structure of a software system that makes it hard to understand and modify". This interactive model visualizes that friction. It explores the tension between <strong>Tactical Programming</strong> (shipping fast now) and <strong>Strategic Programming</strong> (investing in design for the future).`,
  accumulate: `Complexity accumulates whether we like it or not. The only influence we have is how much time we set for dealing with it. More time to fix bugs and refactor code means you have less time to ship features, so you'll need some kind of strategy.`,
  modelHeading: `How the Model Works`,
  modelIntro: `This simulation isn't random. It is driven by the battle between two opposing forces: <strong>Entropy</strong> and <strong>Investment</strong>.`,
  modelSteps: [
    `<strong>The Growth of Complexity (Entropy).</strong> Software doesn't rot on its own; it rots as you change it. Every new feature pushes the structure a little further toward disorder, and if you do nothing, debt grows, and the more it grows, the more it compounds.`,
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
    // Kept to a similar length on purpose: the block reserves the height of the
    // longest line, so one runaway blurb pads the box for all four.
    archetypes: [
      `The tactical approach: you ship fast early on by borrowing against the future, until the debt load collapses morale and velocity.`,
      `The strategic sweet spot: about a third of your time keeps debt flat, which is what buys the highest velocity long term.`,
      `Low risk and lower speed, with stability prioritized over new features. Nothing breaks here, and not much ships either.`,
      `The emergency brake: you stop shipping entirely to clean up the mess. It works, but the recovery is slow and painful.`,
    ],
    custom: `A hand-set allocation, somewhere between the four strategies. The bars settle wherever entropy and payback happen to balance.`,
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

export const TD_CONTENT: TechDebtContent = en;
