
/** One fictional status-page sentence plus the annotation revealed on tap. */
type StatusSentence = {
  /** How the sentence reads while the page is yellow. */
  calm: string;
  /**
   * The same claim after the reader escalates: louder, more urgent, carrying
   * exactly as much information. Omitted for the one honest sentence, which
   * urgency has nothing to inflate; that absence is the point.
   */
  loud?: string;
  /** The annotation, identical in both states. Also the point. */
  note: string;
};

/** Labels for the zero-bit status page, passed from the (server) body to the client widget. */
export type StatusPageStrings = {
  heading: string;
  badge: string;
  badgeRed: string;
  escalate: string;
  deescalate: string;
  hint: string;
  sentences: StatusSentence[];
  footer: string;
  aftermath: string; // shown while the page is red: louder wording, same information
};

/** Labels for the watermelon reporting sim. */
export type WatermelonStrings = {
  pressure: string;
  pressureAria: string;
  presets: string[]; // 4 preset labels, aligned with the sim's fixed values
  bars: [string, string]; // actual health, reported health
  badgeLabel: string;
  badges: { green: string; yellow: string; red: string };
  sprint: string;
  running: string;
  paused: string;
  log: {
    honest: string;
    drifting: string;
    watermelon: string;
    collapse: string;
    recovery: string;
  };
};

/** Labels for the four-question contract diagnostic. */
type DiagnosticQuestion = { q: string; options: [string, string] };
export type DiagnosticStrings = {
  heading: string;
  prompt: string;
  countdown: [string, string, string]; // shown while incomplete, indexed by remaining - 1
  questions: [
    DiagnosticQuestion, // who owns the code: [us, the vendor]
    DiagnosticQuestion, // who operates it: [us, the vendor]
    DiagnosticQuestion, // who pays the bill: [us, the vendor]
    DiagnosticQuestion, // who can see the work: [we can, we cannot]
  ];
  verdictLabel: string;
  verdicts: {
    product: string;
    service: string;
    thirdThing: string;
    hosted: string;
    blind: string;
  };
};

/**
 * All copy for the the-third-thing explorable, per locale. Prose strings
 * may carry inline HTML (<strong>, <em>, <a>); they're authored here, not user
 * input, and rendered via dangerouslySetInnerHTML inside a single JSX skeleton.
 */
export type ThirdThingContent = {
  title: string;
  description: string;
  tags: string[];
  opening: string[]; // two honest ways, product, service, the third thing hook
  thirdThing: string;
  symptoms: string[]; // spreadsheet, meeting, pages, wreckage
  dialectIntro: string; // the way of talking + Frankfurt
  dialect: string[]; // verb tenses, chorus
  composite: string; // "not your project" disclaimer
  why: string[]; // the scene, the inventory, the threat's worth, the loop
  simCaption: string; // caption on the sim: teaches the watermelon term, works the machine
  build: string; // the jira-sync instinct
  fix: string[]; // the split, both halves exist
  audit: string; // the turn to action; the diagnostic asks the four questions, so the prose does not list them
  walkTheFloor: string; // what an unlined-up verdict looks like on the floor
  closing: string[]; // mid-flight honesty, the hopeful ending
  statusPage: StatusPageStrings;
  sim: WatermelonStrings;
  diagnostic: DiagnosticStrings;
};

const FRANKFURT = `https://en.wikipedia.org/wiki/Harry_Frankfurt`;
const ON_BULLSHIT = `https://en.wikipedia.org/wiki/On_Bullshit`;
const MS_ROADMAP = `https://www.microsoft.com/en-us/microsoft-365/roadmap`;

const en: ThirdThingContent = {
  title: `The Third Thing`,
  description: `Why troubled IT projects grow shadow spreadsheets, status theater, and language that cannot be wrong, and how one broken vendor model produces all of it.`,
  tags: [`IT Projects`],
  opening: [
    `As far as I can tell, there are exactly two honest ways to buy software from another company.`,
    `You can buy a product. They keep their code, their roadmap, and their distance. You get clear interfaces, documentation, and the right to look elsewhere. Whether their promises are vague is their business. You chose them for what they can do today, and nothing in your plan stands or falls with what they might do next year.`,
    `Or you buy a service. They work in your backlog, on your infrastructure, under your priorities, and everything they build belongs to you. They get paid per delivered story. If it stops working out, you replace them and keep the software. Easy.`,
    `Corporate IT has no shortage of disasters. But one specific kind always starts the same way: somebody signs a contract for a <strong>third thing</strong>. I have watched this movie a few times now.`,
  ],
  thirdThing: `Sure it looks reasonable on paper. The vendor keeps their intellectual property, like a product company. But they also operate what they build, on your cloud accounts, like a service company. Their tickets live in their Jira, which you cannot see. Their code is a black box. Their servers run up your bill, and you do not even get to size them. Ownership, operation, visibility: all three now point in different directions, and none of them points at you.`,
  symptoms: [
    `What follows is a composite of all the cases I've witnessed. First comes the spreadsheet. Somebody needs to track the vendor's progress. The vendor's tickets are invisible. So an Excel sheet appears, hand-maintained, dozens of columns, several of which are the same column wearing different names, each row a shadow of a ticket that already lives somewhere you cannot see. It is tempting to laugh at the sheet but don't. The sheet is scar tissue and every shadow spreadsheet in your company marks a spot where the organization gave up on a shared tool and grew a workaround instead.`,
    `Next comes the meeting, and don't get me started. The vendor's progress is invisible between milestones, so a daily "sync" call appears, so that somebody can ask the vendor how things are going. Dozens of people get invited. A few decline. Most never answer at all, because declining and accepting are both commitments, and the safest answer is sometimes none at all. A dozen actually show up, every morning, for half an hour. The invite wants to be useful, but it's a status poll in costume. Because when systems are not allowed to sync, people become the sync mechanism, and this particular mechanism runs on payroll. A dozen people, half an hour, five days a week, forever. All of it the price of not sharing a ticket system.`,
    `The pages that come along might make your face itch. Somebody sets up a Confluence page for a topic that is going to end up in Jira anyway. Months later the page is cluttered, and cleaning it up would be more work, so they archive it and clone a fresh copy. Fine. Except the link in the recurring meeting invite still points at the old page, and it will keep pointing there for years, because who edits meeting series. And it's really not malice, that's the annoying part. Every step was a small convenience you could defend in isolation.`,
    `Now look at the wreck, it's like organic chaos. The facts are nowhere to be found, and it's not because information was hidden, but rather it multiplied until nobody could tell what's current and what's not. <strong>The truth simply drowns in the copies.</strong>`,
  ],
  dialectIntro: `And over everything settles a way of talking. "As soon as possible." "Where it makes sense." "With highest priority." "We will have to investigate." Listen to these sentences the way an engineer listens: none of them can ever be wrong. Which sounds like a compliment until you sit with it. A sentence that cannot be wrong carries no information; it rules nothing out. Stack enough of them and a status report becomes compatible with every possible reality, which is exactly what everyone needs it to be. The philosopher <a href="${FRANKFURT}" target="_blank" rel="noopener noreferrer">Harry Frankfurt</a> defined <a href="${ON_BULLSHIT}" target="_blank" rel="noopener noreferrer">bullshit</a> as speech that is indifferent to truth. He wrote a whole monograph about it. He could have read one project status page and saved himself the trouble.`,
  dialect: [
    `The dialect has verb tenses, which took me a while to notice. Work lives in the future: "we will look into it next week" becomes "we looked into it, and we will tackle it next month." Looking-into-it is a deliverable that produces another looking-into-it; the horizon rolls, the unit inflates, a week becomes a month. Escalation has its own genre: the escalation that delivers nothing but the fact that it happened, an escalation with a date but no consequences. And when a status badge finally turns from yellow to red, read the page underneath: the sentences say the same thing. The color changes, the dialect does not. Red is just yellow with a threat of violence.`,
    `What makes the dialect nearly impossible to fight is that it is neither the whole document nor any single person. The real status pages carry honest, well-calibrated sentences right next to the hedged ones, so you cannot object to the page, only to bits and pieces, and objecting to bits and pieces sounds like pedantry. And the dialect is a chorus, not a soloist. "It depends." "We have to investigate." "I cannot tell you." When enough mouths say these things, the dialect stops being someone's personality and becomes the room's native language, the thing newcomers absorb as onboarding.`,
    `Seniority completes the trick, and not because the veteran is bluffing. When someone with decades in the system says "it depends", it usually does depend. They have watched confident answers collapse before. The problem is that the room cannot tell earned caution from evasion and both come out as the same words. So every empty hedge in the chorus gets to borrow the veteran's credibility, and vagueness, said from high enough up, gets heard as wisdom.`,
  ],
  composite: `If this sounds like your project: I promise I was not describing your project. That is the most damning thing I can say. It sounds like all of them.`,
  why: [
    `Why does the disease spread? Here is one scene, composited like the rest. A vendor gets handed a question only an infrastructure team could answer. A cost analysis, a capacity plan, pick one. The reason is that their servers sit underutilized on a bill the customer pays. The vendor, in this scene, is a room of scientists. Brilliant at exactly what they were hired for. Not infrastructure people. Everyone in the room knows both things, including the manager, who now says the sentence that managers in this position always say. It comes in three parts: this is your responsibility, I do not care how, and if it does not happen, the costs land on you.`,
    `It is tempting to hear that sentence as bad management, but it's a product of desperation. The manager cannot fix the code, because it is a black box. Cannot take over operations, because the contract says the vendor operates. Cannot even watch the work happen, because the tickets live in a Jira only the vendor can access. Every real lever was signed away years ago. What remains is assigning responsibility and threatening cost transfer. <strong>Blame is what management looks like after every real lever has been contracted away.</strong>`,
    `Notice what the threat is actually worth. Assigning responsibility without capability just schedules the blame in advance. The party who sizes the servers does not pay for them and underutilization is the result. And when the money was committed years before the work, the threat of costs is theater on top of theater: that money is already spent. Everyone in the room knows all of this. The sentence gets said anyway. Saying it is the only lever left to pull.`,
    `What's the result of that pressure? Not the answer. They cannot produce it. What comes out instead is language: "we will look into it next week." Blame flows down, hedges flow up, and both sides walk out with paperwork proving they did their part. Blame in, bullshit out. The dialect is just how people deal inside a broken model.`,
  ],
  simCaption: `You can run this machine yourself below. Projects like this get called watermelons: green on the outside, red on the inside. Turn up the blame and watch the two colors drift apart.`,
  build: `The engineer's instinct at this point is to build something. I have felt it myself, and I have watched others feel it: faced with an invisible vendor backlog, one is tempted on pure instinct to sketch a tool to sync tickets between the two Jiras. That's a stupid idea, and it takes about a week of honest thinking to see why. The boundary does not disappear. Somebody would have to decide, forever, which tickets cross it. The sync itself is one more piece of software that demands maintenance. And after all that work you have bought yourself a perfect view of tickets you still cannot act on. You would see everything and change nothing. You cannot tool your way out of a contract-shaped problem; every new copy of the truth, however clever, just joins the crowd that outnumbers it. There is no such thing as "can't hurt" in a project. <strong>Everything that does not actively help, actively hinders.</strong>`,
  fix: [
    `The fix lives where the break lives, in the model. If a vendor is doing two jobs, split them into two relationships. Same people, if you like; different shapes. One half becomes a true product company. They keep their code and their roadmap, publish updates quarterly or yearly, track their own issues, and owe you clear interfaces instead of transparency. You install their black box on your infrastructure, you operate it, you build your own shims around it, and you keep the right to leave. The other half becomes a true service team. They work in your Jira, on your systems, on your behalf. What they build is yours, they are paid per delivered story, and they are replaceable by construction. You lose something in the split: the product half will only ever give you a roadmap, not a date. But look at what you get back. The service half now works where you can see them, so you know exactly when a change reaches production, and the switch that turns a feature on in your world is finally in your hand.`,
    `Both halves of this exist. AWS and Microsoft publish <a href="${MS_ROADMAP}" target="_blank" rel="noopener noreferrer">roadmaps</a> to hundreds of thousands of customers, and those roadmaps commit to almost nothing. Nobody drowns, because the customer's architecture never depends on those promises; the vagueness stays on the far side of an interface, where it is just a weather forecast. Move the same vagueness into your own backlog and your release date suddenly depends on a "we will look into it." That is the law hiding in this essay: <strong>bullshit tolerance is a function of coupling.</strong> It also points at the real fix. Demanding braver sentences from people under pressure repairs nothing. You work to repair the model, until plain sentences are affordable again.`,
  ],
  audit: `You won't need to assess your vendor's maturity. A contract has to be clearly drawn up in one of the two ways. To make sure yours is, answer the questions below.`,
  walkTheFloor: `If the answers do not line up into one of the two honest shapes, you do not need to wait for the disaster; walk the project floor and you will find the symptoms already multiplying. A spreadsheet that repeats itself. A daily call people ignore or begrudgingly accept. A page nobody can find. A room full of decent people speaking a language in which nothing can be wrong.`,
  closing: [
    `I will not pretend any of this is easy to fix in a brownfield. Contracts like the third thing get signed for years, and seeing the problem clearly is no guarantee you have the standing to say it out loud. But durability cuts both ways. A broken model persists because it outlasts the people who fight it. A repaired model persists the exact same way. Fix the shape once and the fix keeps working long after everyone involved has changed projects. Being heard once might be enough. And the chances to be heard keep coming: every renewal, every extension, every crisis where a threat gets made because nothing else is left. Each one is another opportunity.`,
    `And when the chance comes, remember: the split costs nobody their job. Same people, sorted into shapes where they get measured on what they are actually good at. The scientists get to be scientists. The manager gets real levers instead of blame. Nobody has to maintain the spreadsheet or sit through the daily or answer in hedges anymore. That is the most hopeful fact in all of this. Nobody in these rooms wants the bullshit. Not the veteran, not the manager, not the vendor. So ask the four questions, out loud, even if you are the newest person in the room; a question is not an accusation. People go back to speaking in plain sentences the moment it becomes affordable again. <strong>It's not the people you need to fix, it's the model.</strong>`,
  ],
  statusPage: {
    heading: `Project Aurora, weekly status`,
    badge: `AT RISK`,
    badgeRed: `CRITICAL`,
    escalate: `Escalate`,
    deescalate: `Deescalate`,
    hint: `Tap a sentence to see what it rules out.`,
    sentences: [
      {
        calm: `The overall goal remains to stabilize the release as soon as possible.`,
        loud: `The overall goal remains to stabilize the release, and this must happen without any further delay.`,
        note: `A commitment with no date, no owner, and no definition of stable. Rules out nothing. Information: zero.`,
      },
      {
        calm: `The team is working on the open defects with highest priority.`,
        loud: `The team is working on the open defects with highest priority and full focus, right now!`,
        note: `Every team, everywhere, is working on something with highest priority. Rules out nothing. Information: zero.`,
      },
      {
        calm: `The supplier has confirmed that the issue was escalated internally.`,
        loud: `The supplier has confirmed that the issue was escalated internally and is being treated there with the utmost urgency.`,
        note: `The deliverable is the confirmation itself. No date, no impact, no owner. Rules out nothing. Information: zero.`,
      },
      {
        calm: `Quick wins will be prioritized where it makes sense.`,
        loud: `Quick wins will be prioritized with immediate effect wherever it makes sense.`,
        note: `Nobody has ever prioritized quick wins where it makes no sense. Rules out nothing. Information: zero.`,
      },
      {
        // The honest sentence. No loud variant: urgency has nothing to inflate.
        calm: `Tuesday's migration run is done: 12 of 14 services are migrated, the last two follow next sprint.`,
        note: `A date, a count, and a commitment that can fail. This sentence could be wrong, so it tells you something. The only information on the page.`,
      },
      {
        calm: `A further alignment is planned to clarify the next steps.`,
        loud: `A further alignment is planned at short notice to clarify the next steps.`,
        note: `A meeting that leads to another meeting. Rules out nothing. Information: zero.`,
      },
    ],
    footer: `Information content of this page: one sentence out of six. The badge summarizes the other five.`,
    aftermath: `Red now, and louder. Five sentences gained urgency, the sixth had nothing to inflate, and not one of them claims anything new. Information content: unchanged.`,
  },
  sim: {
    pressure: `Blame pressure`,
    pressureAria: `Blame pressure percentage`,
    presets: [`Blameless`, `Business as usual`, `Watermelon`, `Witch hunt`],
    bars: [`Actual health`, `Reported health`],
    badgeLabel: `Status badge`,
    badges: { green: `ON TRACK`, yellow: `AT RISK`, red: `CRITICAL` },
    sprint: `Sprint`,
    running: `● running`,
    paused: `❚❚ paused`,
    log: {
      honest: `Reports match reality. Problems get fixed while they are small.`,
      drifting: `The reports are starting to flatter. Small problems go unreported, and unreported problems do not get fixed.`,
      watermelon: `Green outside, red inside. The badge is healthy. The project is not.`,
      collapse: `Reality arrived anyway. It always does, only later, and bigger.`,
      recovery: `The reports are honest again and the numbers are ugly. Recovery starts slow, then it compounds.`,
    },
  },
  diagnostic: {
    heading: `The four questions, applied to your vendor`,
    prompt: `Four questions, one verdict.`,
    countdown: [`One question left.`, `Two questions left.`, `Three questions left.`],
    questions: [
      { q: `Who owns the code?`, options: [`We do`, `The vendor`] },
      { q: `Who operates it?`, options: [`We do`, `The vendor`] },
      { q: `Who pays the bill?`, options: [`We do`, `The vendor`] },
      { q: `Who can see the work?`, options: [`We can`, `We cannot`] },
    ],
    verdictLabel: `Verdict`,
    verdicts: {
      product: `A clean product shape. They own it, you run it. Their roadmap is weather, not a dependency, and you keep the right to leave.`,
      service: `A clean service shape. It is your software, built where you can see it. Pay for delivered stories and keep the exit open.`,
      thirdThing: `The third thing. They own it, they operate it, and it all runs on your bill. Every lever points away from you. Expect spreadsheets.`,
      hosted: `A hosted product. Still the product shape, just run from their side of the fence: they own it, they run it, they pay for it, and you buy the outcome. Fine, as long as the interfaces are clear and you keep the right to leave.`,
      blind: `Your own software, built where you cannot see it. That is a service contract missing its transparency clause. Fix the visibility before it grows a spreadsheet.`,
    },
  },
};

export const TT_CONTENT: ThirdThingContent = en;
