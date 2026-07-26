import { toLocale, type Locale } from "@/lib/i18n";

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
  simIntro: string; // teaches the watermelon term right before the sim
  build: string; // the jira-sync instinct
  fix: string[]; // the split, both halves exist
  audit: string; // four questions prose
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
  tags: [`Explorable`, `IT Projects`],
  opening: [
    `As far as I can tell, there are exactly two honest ways to buy software from another company.`,
    `You can buy a product. They keep their code, their roadmap, and their distance. You get clear interfaces, documentation, and the right to look elsewhere. Whether their promises are vague is their business. You chose them for what they can do today, and nothing in your plan stands or falls with what they might do next year.`,
    `Or you buy a service. They work in your backlog, on your infrastructure, under your priorities, and everything they build belongs to you. They get paid per delivered story. If it stops working out, you replace them and keep the software. Easy.`,
    `Corporate IT has no shortage of disasters. But one specific kind always starts the same way: somebody signs a contract for a <strong>third thing</strong>. I have watched this movie a few times now.`,
  ],
  thirdThing: `Sure it looks reasonable on paper. The vendor keeps their intellectual property, like a product company. But they also operate what they build, on your cloud accounts, like a service company. Their tickets live in their Jira, which you cannot see into. Their code is a black box. Their servers run up your bill, and you do not even get to size them. Ownership, operation, visibility: all three now point in different directions, and none of them points at you.`,
  symptoms: [
    `What follows is a composite of all the cases I've witnessed. First comes the spreadsheet. Somebody needs to track the vendor's progress. The vendor's tickets are invisible. So an Excel sheet appears, hand-maintained, dozens of columns, several of which are the same column wearing different names, each row a shadow of a ticket that already lives somewhere you cannot see. It is tempting to laugh at the sheet but don't. The sheet is scar tissue and every shadow spreadsheet in your company marks a spot where the organization gave up on a shared tool and grew a workaround instead.`,
    `Next comes the meeting, and don't get me started. The vendor's progress is invisible between milestones, so a daily "sync" call appears, so that somebody can ask the vendor how things are going. Dozens of people get invited. A few decline. Most never answer at all, because declining and accepting are both commitments, and the safest answer is sometimes none at all. A dozen actually show up, every morning, for half an hour. The invite wants to be useful, but it's a status poll in costume. Because when systems are not allowed to sync, people become the sync mechanism, and this particular mechanism runs on payroll. A dozen people, half an hour, five days a week, forever. All of it the price of not sharing a ticket system.`,
    `The pages that come along might make your face itch. Somebody sets up a Confluence page for a topic that is going to end up in Jira anyway. Months later the page is cluttered, and cleaning it up would be more work, so they archive it and clone a fresh copy. Fine. Except the link in the recurring meeting invite still points at the old page, and it will keep pointing there for years, because who edits meeting series. And it's really not malice, that's the annoying part. Every step was a small convenience you could defend in isolation.`,
    `Now look at the wreck, it's like organic chaos. The facts are nowhere to be found, and it's not because information was hidden, but rather it multiplied until nobody could tell what's current and what's not. <strong>The truth simply drowns in the copies.</strong>`,
  ],
  dialectIntro: `And over everything settles a way of talking. "As soon as possible." "Where it makes sense." "With highest priority." "We will have to investigate." Listen to these sentences the way an engineer listens: none of them can ever be wrong. Which sounds like a compliment until you sit with it. A sentence that cannot be wrong carries no information; it rules nothing out. Stack enough of them and a status report becomes compatible with every possible reality, which is exactly what everyone needs it to be. The philosopher <a href="${FRANKFURT}" target="_blank" rel="noopener noreferrer">Harry Frankfurt</a> defined <a href="${ON_BULLSHIT}" target="_blank" rel="noopener noreferrer">bullshit</a> as speech that is indifferent to truth. He wrote a whole monograph about it. He could have read one project status page and saved himself the trouble.`,
  dialect: [
    `The dialect has verb tenses, which took me a while to notice. Work lives in the future: "we will look into it next week" becomes "we looked into it, and we will tackle it next month." Looking-into-it is a deliverable that produces another looking-into-it; the horizon rolls, the unit inflates, a week becomes a month. Escalation has its own genre: the escalation that delivers nothing but the fact that it happened, an escalation with a date but no consequences. And when a status badge finally turns from yellow to red, read the page underneath: the sentences say the same thing. The color changes, the dialect does not. Red is just yellow with a threat of violence.`,
    `What makes the dialect nearly impossible to fight is that it is neither the whole document nor any single person. Real status pages carry honest, well-calibrated sentences right next to the hedged ones, so you cannot object to the page, only to bits and pieces, and objecting to bits and pieces sounds like pedantry. And the dialect is a chorus, not a soloist. "It depends." "We have to investigate." "I cannot tell you." When enough mouths say these things, the dialect stops being someone's personality and becomes the room's native language, the thing newcomers absorb as onboarding.`,
    `Seniority completes the trick, and not because the veteran is bluffing. When someone with decades in the system says "it depends", it usually does depend. They have watched confident answers collapse before. The problem is that the room cannot tell earned caution from evasion and both come out as the same words. So every empty hedge in the chorus gets to borrow the veteran's credibility, and vagueness, said from high enough up, gets heard as wisdom.`,
  ],
  composite: `If this sounds like your project: I promise I was not describing your project. That is the most damning thing I can say. It sounds like all of them.`,
  why: [
    `Why does the disease spread? Here is one scene, composited like the rest. A vendor gets handed a question only an infrastructure team could answer. A cost analysis, a capacity plan, pick one. The reason is that their servers sit underutilized on a bill the customer pays. The vendor, in this scene, is a room of scientists. Brilliant at exactly what they were hired for. Not infrastructure people. Everyone in the room knows both things, including the manager, who now says the sentence that managers in this position always say. It comes in three parts: this is your responsibility, I do not care how, and if it does not happen, the costs land on you.`,
    `It is tempting to hear that sentence as bad management, but it's a product of desperation. The manager cannot fix the code, because it is a black box. Cannot take over operations, because the contract says the vendor operates. Cannot even watch the work happen, because the tickets live in a Jira nobody in the room can open. Every real lever was signed away years ago. What remains is assigning responsibility and threatening cost transfer. <strong>Blame is what management looks like after every real lever has been contracted away.</strong>`,
    `Notice what the threat is actually worth. Assigning responsibility to someone without the capability just schedules the blame in advance. The party who sizes the servers does not pay for them and underutilization is the result. And when the money was committed years before the work, the threat of costs is theater on top of theater: that money is already spent. Everyone in the room knows all of this. The sentence gets said anyway. Saying it is the only lever left to pull.`,
    `What's the result of that pressure? Not the answer. They cannot produce it. What comes out instead is language: "we will look into it next week." Blame flows down, hedges flow up, and both sides walk out with a paper trail proving they did their part. Blame in, bullshit out. The dialect is just how people deal inside a broken model.`,
  ],
  simIntro: `You can run this machine yourself below. Projects like this get called watermelons: green on the outside, red on the inside. Turn up the blame and watch the two colors drift apart.`,
  build: `The engineer's instinct at this point is to build something. I have felt it myself, and I have watched others feel it: faced with an invisible vendor backlog, one is tempted on pure instinct to sketch a tool to sync tickets between the two Jiras. That's a stupid idea, and it takes about a week of honest thinking to see why. The boundary does not disappear. Somebody would have to decide, forever, which tickets cross it. The sync itself is one more piece of software that demands maintenance. And after all that work you have bought yourself a perfect view of tickets you still cannot act on. You would see everything and change nothing. You cannot tool your way out of a contract-shaped problem; every new copy of the truth, however clever, just joins the crowd that outnumbers it. There is no such thing as "can't hurt" in a project. <strong>Everything that does not actively help, actively hinders.</strong>`,
  fix: [
    `The fix lives where the break lives, in the model. If a vendor is doing two jobs, split them into two relationships. Same people, if you like; different shapes. One half becomes a true product company. They keep their code and their roadmap, publish updates quarterly or yearly, track their own issues, and owe you clear interfaces instead of transparency. You install their black box on your infrastructure, you operate it, you build your own shims around it, and you keep the right to leave. The other half becomes a true service team. They work in your Jira, on your systems, on your behalf. What they build is yours, they are paid per delivered story, and they are replaceable by construction. You lose something in the split: the product half will only ever give you a roadmap, not a date. But look at what you get back. The service half now works where you can see them, so you know exactly when a change reaches production, and the switch that turns a feature on in your world is finally in your hand.`,
    `Both halves of this exist. AWS and Microsoft publish <a href="${MS_ROADMAP}" target="_blank" rel="noopener noreferrer">roadmaps</a> to hundreds of thousands of customers, and those roadmaps commit to almost nothing. Nobody drowns, because the customer's architecture never depends on those promises; the vagueness stays on the far side of an interface, where it is just a weather forecast. Move the same vagueness into your own backlog and your release date suddenly depends on a "we will look into it." That is the law hiding in this essay: <strong>bullshit tolerance is a function of coupling.</strong> It also points at the real fix. Demanding braver sentences from people under pressure repairs nothing. You work to repair the model, until plain sentences are affordable again.`,
  ],
  audit: `So audit your vendors. Four questions: who owns the code, who operates it, who pays the bill, who can see the work. If the answers do not line up into one of the two honest shapes, you do not need to wait for the disaster; walk the project floor and you will find the symptoms already multiplying. A spreadsheet that repeats itself. A daily call people ignore or begrudgingly accept. A page nobody can find. A room full of decent people speaking a language in which nothing can be wrong.`,
  closing: [
    `I will not pretend any of this is easy to fix in a brownfield. Contracts like the third thing get signed for years, and seeing the problem clearly is no guarantee you have the standing to say it out loud. But durability cuts both ways. A broken model persists because it outlasts the people who fight it. A repaired model persists the exact same way. Fix the shape once and the fix keeps working long after everyone involved has changed projects. Being heard once might be enough. And the chances to be heard keep coming: every renewal, every extension, every crisis where a threat gets made because nothing else is left. Each one is another opportunity.`,
    `And when the chance comes, remember: the split costs nobody their job. Same people, sorted into shapes where they get measured on what they are actually good at. The scientists get to be scientists. The manager gets real levers instead of blame. Nobody has to maintain the spreadsheet or sit through the daily or answer in hedges anymore. That is the most hopeful fact in all of this. Nobody in these rooms wants the bullshit. Not the veteran, not the manager, not the vendor. So ask the four questions, out loud, even if you are the newest person in the room; a question is not an accusation. People go back to speaking in plain sentences the moment it becomes affordable again. <strong>It's not the people you need to fix, it's the model.</strong>`,
  ],
  statusPage: {
    heading: `Project Aurora, weekly status`,
    badge: `YELLOW`,
    badgeRed: `RED`,
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
    badges: { green: `GREEN`, yellow: `YELLOW`, red: `RED` },
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

const de: ThirdThingContent = {
  title: `Das dritte Ding`,
  description: `Warum kriselnde IT-Projekte Schattentabellen, Statustheater und eine Sprache hervorbringen, die nie falsch sein kann, und wie ein einziges kaputtes Lieferantenmodell all das erzeugt.`,
  tags: [`Explorable`, `IT-Projekte`],
  opening: [
    `Soweit ich das überblicke, gibt es genau zwei ehrliche Arten, Software von einer anderen Firma zu kaufen.`,
    `Du kannst ein Produkt kaufen. Sie behalten ihren Code und ihre Roadmap, und sie wahren den Abstand. Du bekommst klare Schnittstellen, Dokumentation und das Recht, dich anderswo umzusehen. Ob ihre Versprechen vage sind, ist ihre Sache. Du hast sie für das gewählt, was sie heute können, und nichts in deinem Plan steht und fällt damit, was sie nächstes Jahr vielleicht tun.`,
    `Oder du kaufst eine Dienstleistung. Sie arbeiten in deinem Backlog, auf deiner Infrastruktur, nach deinen Prioritäten, und alles, was sie bauen, gehört dir. Bezahlt werden sie pro gelieferter Story. Wenn es nicht mehr passt, ersetzt du sie und behältst die Software. So einfach ist das.`,
    `An Katastrophen herrscht in der Unternehmens-IT kein Mangel. Aber eine bestimmte Sorte beginnt immer gleich: Jemand unterschreibt einen Vertrag für ein <strong>drittes Ding</strong>. Diesen Film habe ich inzwischen ein paar Mal gesehen.`,
  ],
  thirdThing: `Klar sieht das auf dem Papier vernünftig aus. Der Lieferant behält sein geistiges Eigentum, wie eine Produktfirma. Aber er betreibt auch, was er baut, auf deinen Cloud-Konten, wie eine Dienstleistungsfirma. Seine Tickets liegen in seinem Jira, in das du nicht hineinschauen kannst. Sein Code ist eine Blackbox. Seine Server treiben deine Rechnung hoch, und nicht mal ihre Größe darfst du bestimmen. Eigentum, Betrieb, Sichtbarkeit: Alle drei zeigen jetzt in verschiedene Richtungen, und keines davon zeigt auf dich.`,
  symptoms: [
    `Was jetzt folgt, ist aus allen Fällen zusammengesetzt, die ich miterlebt habe. Zuerst kommt die Tabelle. Jemand muss den Fortschritt des Lieferanten verfolgen. Dessen Tickets sind unsichtbar. Also erscheint eine Excel-Tabelle, von Hand gepflegt, Dutzende Spalten, mehrere davon dieselbe Spalte unter verschiedenen Namen, jede Zeile der Schatten eines Tickets, das längst irgendwo liegt, wo du nicht hinsehen kannst. Es ist verlockend, über die Tabelle zu lachen, aber lass es. Die Tabelle ist Narbengewebe, und jede Schattentabelle in deiner Firma markiert eine Stelle, an der die Organisation ein gemeinsames Werkzeug aufgegeben und sich stattdessen einen Workaround gezüchtet hat.`,
    `Als Nächstes kommt das Meeting, und darüber könnte ich mich stundenlang aufregen. Zwischen den Meilensteinen ist der Fortschritt des Lieferanten unsichtbar, also erscheint ein täglicher „Sync“-Call, damit jemand den Lieferanten fragen kann, wie es denn so läuft. Dutzende Leute werden eingeladen. Ein paar sagen ab. Die meisten antworten gar nicht, denn Absagen und Zusagen sind beide eine Festlegung, und die sicherste Antwort ist manchmal gar keine. Ein Dutzend erscheint tatsächlich, jeden Morgen, für eine halbe Stunde. Die Einladung will nützlich sein, aber sie ist eine verkleidete Statusabfrage. Denn wenn Systeme sich nicht synchronisieren dürfen, werden Menschen zum Sync-Mechanismus, und dieser hier wird aus Gehältern bezahlt. Ein Dutzend Leute, eine halbe Stunde, fünf Tage die Woche, für immer. Alles der Preis dafür, kein gemeinsames Ticketsystem zu haben.`,
    `Bei den Seiten, die dazukommen, juckt dir vielleicht das Gesicht. Jemand legt eine Confluence-Seite für ein Thema an, das am Ende sowieso in Jira landet. Monate später ist die Seite zugemüllt, und Aufräumen wäre mehr Arbeit, also archiviert man sie und klont eine neue Kopie. Meinetwegen. Nur zeigt der Link in der Serieneinladung weiter auf die alte Seite, und das wird er noch Jahre tun, denn wer bearbeitet schon Meeting-Serien. Und es ist wirklich keine Böswilligkeit, das ist ja das Ärgerliche. Jeder Schritt war eine kleine Bequemlichkeit, die sich für sich genommen verteidigen ließ.`,
    `Und jetzt sieh dir die Trümmer an, das reinste organische Chaos. Die Fakten sind nirgends zu finden, und zwar nicht, weil Information versteckt wurde, sondern weil sie sich vervielfältigt hat, bis niemand mehr sagen konnte, was aktuell ist und was nicht. <strong>Die Wahrheit ertrinkt schlicht in den Kopien.</strong>`,
  ],
  dialectIntro: `Und über alles legt sich eine Art zu reden. „Schnellstmöglich.“ „Wo es sinnvoll ist.“ „Mit höchster Priorität.“ „Das müssen wir noch prüfen.“ Hör diesen Sätzen zu, wie ein Ingenieur zuhört: Keiner von ihnen kann jemals falsch sein. Das klingt wie ein Kompliment, bis du kurz darüber nachdenkst. Ein Satz, der nicht falsch sein kann, trägt keine Information; er schließt nichts aus. Staple genug davon aufeinander, und ein Statusbericht wird mit jeder möglichen Realität vereinbar, und genau das brauchen alle von ihm. Der Philosoph <a href="${FRANKFURT}" target="_blank" rel="noopener noreferrer">Harry Frankfurt</a> definierte <a href="${ON_BULLSHIT}" target="_blank" rel="noopener noreferrer">Bullshit</a> als Rede, der die Wahrheit gleichgültig ist. Er hat eine ganze Monografie darüber geschrieben. Er hätte auch einfach eine Projektstatusseite lesen und sich die Mühe sparen können.`,
  dialect: [
    `Der Dialekt hat Zeitformen, was mir erst nach einer Weile aufgefallen ist. Arbeit lebt im Futur: Aus „Wir schauen uns das nächste Woche an“ wird „Wir haben es uns angeschaut, und wir gehen es nächsten Monat an“. Das Sich-Anschauen ist ein Liefergegenstand, der ein weiteres Sich-Anschauen hervorbringt; der Horizont rollt weiter, das Zeitmaß bläht sich auf, aus der Woche wird ein Monat. Die Eskalation hat ihr eigenes Genre: die Eskalation, die nichts liefert außer der Tatsache, dass sie stattgefunden hat, eine Eskalation mit Datum, aber ohne Folgen. Und wenn die Statusampel endlich von Gelb auf Rot springt, lies die Seite darunter: Die Sätze sagen dasselbe. Die Farbe wechselt, der Dialekt nicht. Rot ist nur Gelb mit Gewaltandrohung.`,
    `Fast unmöglich zu bekämpfen ist der Dialekt deshalb, weil er weder das ganze Dokument ist noch eine einzelne Person. Auf echten Statusseiten stehen ehrliche, gut kalibrierte Sätze direkt neben den ausweichenden, also kannst du nicht der Seite widersprechen, nur einzelnen Stellen, und einzelnen Stellen zu widersprechen klingt nach Pedanterie. Und der Dialekt ist ein Chor, kein Solist. „Kommt darauf an.“ „Das müssen wir noch prüfen.“ „Das kann ich dir nicht sagen.“ Wenn diese Sätze aus genug Mündern kommen, hört der Dialekt auf, jemandes Persönlichkeit zu sein, und wird zur Muttersprache des Projekts, zu dem, was Neue bei der Einarbeitung aufsaugen.`,
    `Erfahrung vollendet den Trick, und zwar nicht, weil der Veteran blufft. Wenn jemand, der das System seit zwanzig Jahren kennt, „kommt darauf an“ sagt, kommt es meistens wirklich darauf an. Wer so lange dabei ist, hat schon zu viele vollmundige Antworten zusammenbrechen sehen. Das Problem ist, dass niemand im Raum verdiente Vorsicht von Ausweichen unterscheiden kann, und beides kommt als dieselben drei Wörter heraus. Also darf sich jede leere Floskel im Chor die Glaubwürdigkeit des Veteranen leihen, und Unverbindlichkeit, von weit genug oben gesprochen, wird als Weisheit gehört.`,
  ],
  composite: `Falls das nach deinem Projekt klingt: Ich verspreche dir, ich habe nicht dein Projekt beschrieben. Das ist das Vernichtendste, was ich sagen kann. Es klingt nach allen.`,
  why: [
    `Warum breitet sich die Krankheit aus? Hier ist eine Szene, zusammengesetzt wie der Rest. Ein Lieferant bekommt eine Frage vorgesetzt, die nur ein Infrastrukturteam beantworten könnte. Eine Kostenanalyse, ein Kapazitätsplan, such dir was aus. Der Grund: Seine Server sind unterausgelastet, und bezahlt werden sie vom Kunden. Auf Lieferantenseite sitzt in dieser Szene ein ganzer Raum voller Wissenschaftler. Brillant in genau dem, wofür man sie geholt hat. Keine Infrastrukturleute. Alle im Raum wissen beides, auch der Manager, der jetzt den Satz sagt, den Manager in dieser Lage immer sagen. Er kommt in drei Teilen: Das ist eure Verantwortung, wie ist mir egal, und wenn es nicht passiert, landen die Kosten bei euch.`,
    `Es ist verlockend, diesen Satz als schlechtes Management zu hören, aber er ist ein Produkt der Verzweiflung. Der Manager kann den Code nicht reparieren, der ist eine Blackbox. Kann den Betrieb nicht übernehmen, der Vertrag sagt, der Lieferant betreibt. Kann der Arbeit nicht mal zusehen, die Tickets liegen in einem Jira, das niemand im Raum öffnen kann. Jeder echte Hebel wurde vor Jahren per Unterschrift abgegeben. Was bleibt, ist Verantwortung zuweisen und mit Kosten drohen. <strong>Schuldzuweisung ist das, was von Management übrig bleibt, wenn jeder echte Hebel wegverhandelt wurde.</strong>`,
    `Beachte, was die Drohung tatsächlich wert ist. Verantwortung jemandem zuzuweisen, dem die Fähigkeit fehlt, legt nur die spätere Schuldzuweisung schon jetzt fest. Wer die Server dimensioniert, bezahlt sie nicht, und Unterauslastung ist das Ergebnis. Und wenn das Geld Jahre vor der Arbeit gebunden wurde, ist die Kostendrohung Theater auf Theater: Das Geld ist längst ausgegeben. Jeder im Raum weiß das alles. Der Satz wird trotzdem gesagt. Ihn zu sagen, ist der einzige Hebel, der sich noch ziehen lässt.`,
    `Was kommt bei dem Druck heraus? Nicht die Antwort. Die können sie nicht liefern. Heraus kommt stattdessen Sprache: „Wir schauen uns das nächste Woche an.“ Schuld fließt nach unten, Floskeln fließen nach oben, und beide Seiten gehen mit einem Beleg nach Hause, der beweist, dass sie ihren Teil getan haben. Schuld rein, Bullshit raus. Der Dialekt ist nichts weiter als die Art, wie Leute in einem kaputten Modell zurechtkommen.`,
  ],
  simIntro: `Diese Maschine kannst du unten selbst laufen lassen. Solche Projekte nennt man Wassermelonen: außen grün, innen rot. Dreh den Schulddruck hoch und sieh zu, wie die beiden Farben auseinanderdriften.`,
  build: `Der Instinkt des Ingenieurs an dieser Stelle ist, etwas zu bauen. Ich habe ihn selbst gespürt, und ich habe ihn bei anderen gesehen: Vor einem unsichtbaren Lieferanten-Backlog will man aus purem Instinkt ein Werkzeug skizzieren, das Tickets zwischen den beiden Jiras synchronisiert. Das ist eine dumme Idee, und es dauert ungefähr eine Woche ehrlichen Nachdenkens, um zu sehen, warum. Die Grenze verschwindet nicht. Jemand müsste für immer entscheiden, welche Tickets die Grenze überqueren. Der Sync selbst ist ein weiteres System, das gewartet werden will. Und nach all der Arbeit hast du dir einen perfekten Blick auf Tickets erkauft, auf die du weiterhin nicht einwirken kannst. Du würdest alles sehen und nichts ändern. Aus einem Problem, das die Form eines Vertrags hat, kannst du dich nicht herausbauen; jede neue Kopie der Wahrheit, so clever sie ist, vergrößert nur die Menge, in der die Wahrheit untergeht. „Kann ja nicht schaden“ gibt es in einem Projekt nicht. <strong>Alles, was nicht aktiv hilft, behindert aktiv.</strong>`,
  fix: [
    `Repariert wird dort, wo der Bruch sitzt: im Modell. Wenn ein Lieferant zwei Rollen ausfüllt, trenne sie in zwei Vertragsverhältnisse. Dieselben Leute, wenn du willst; andere Formen. Die eine Hälfte wird eine echte Produktfirma. Sie behält ihren Code und ihre Roadmap, veröffentlicht Updates quartalsweise oder jährlich, verfolgt ihre eigenen Tickets und schuldet dir klare Schnittstellen statt Transparenz. Du installierst ihre Blackbox auf deiner Infrastruktur, du betreibst sie, du baust deine eigenen Adapter darum, und du behältst das Recht zu gehen. Die andere Hälfte wird ein echtes Serviceteam. Es arbeitet in deinem Jira, auf deinen Systemen, in deinem Auftrag. Was es baut, gehört dir, es wird pro gelieferter Story bezahlt, und es ist schon vom Aufbau her ersetzbar. Du verlierst etwas bei der Teilung: Die Produkthälfte wird dir immer nur eine Roadmap geben, nie ein Datum. Aber sieh, was du zurückbekommst. Die Servicehälfte arbeitet jetzt dort, wo du zusehen kannst, du weißt also genau, wann eine Änderung in Produktion geht, und der Schalter, der ein Feature in deiner Welt einschaltet, liegt endlich in deiner Hand.`,
    `Beide Hälften davon existieren. AWS und Microsoft veröffentlichen <a href="${MS_ROADMAP}" target="_blank" rel="noopener noreferrer">Roadmaps</a> für Hunderttausende Kunden, und diese Roadmaps versprechen so gut wie nichts. Niemand ertrinkt darin, denn die Architektur des Kunden hängt nie an diesen Versprechen; die Unverbindlichkeit bleibt auf der anderen Seite einer Schnittstelle, wo sie bloß ein Wetterbericht ist. Hol dieselbe Unverbindlichkeit in dein eigenes Backlog, und dein Release-Datum hängt plötzlich an einem „Wir schauen uns das an“. Das ist das Gesetz, das sich in diesem Essay versteckt: <strong>Bullshit-Toleranz ist eine Funktion der Kopplung.</strong> Und es weist auf die echte Lösung hin. Von Menschen unter Druck mutigere Sätze zu verlangen, repariert nichts. Du arbeitest daran, das Modell zu reparieren, bis schlichte Sätze wieder bezahlbar sind.`,
  ],
  audit: `Also prüfe deine Lieferanten. Vier Fragen: Wem gehört der Code, wer betreibt ihn, wer bezahlt die Rechnung, wer kann die Arbeit sehen. Wenn sich die Antworten nicht zu einer der beiden ehrlichen Formen fügen, musst du nicht auf die Katastrophe warten; geh durch das Projekt, und du siehst die Symptome längst wuchern. Eine Tabelle, die sich selbst wiederholt. Ein Sync-Call, den die Leute ignorieren oder nur zähneknirschend annehmen. Eine Seite, die niemand findet. Ein Raum voller anständiger Leute, die eine Sprache sprechen, in der nichts falsch sein kann.`,
  closing: [
    `Ich tue nicht so, als wäre das alles in einem laufenden Projekt leicht zu reparieren. Verträge wie das dritte Ding werden auf Jahre unterschrieben, und wer das Problem klar sieht, hat noch lange nicht das Gewicht, es laut auszusprechen. Aber Beständigkeit wirkt in beide Richtungen. Ein kaputtes Modell überdauert, weil es die Menschen überlebt, die dagegen ankämpfen. Ein repariertes Modell überdauert auf genau dieselbe Weise. Repariere die Form einmal, und sie hält noch lange, nachdem alle Beteiligten das Projekt gewechselt haben. Einmal gehört zu werden, könnte genügen. Und die Chancen, gehört zu werden, kommen immer wieder: jede Verlängerung, jede Erweiterung, jede Krise, in der eine Drohung ausgesprochen wird, weil nichts anderes mehr übrig ist. Jede davon ist eine weitere Gelegenheit.`,
    `Und wenn die Chance kommt, denk daran: Die Teilung kostet niemanden die Stelle. Dieselben Leute, sortiert in Formen, in denen sie an dem gemessen werden, was sie wirklich gut können. Die Wissenschaftler dürfen Wissenschaftler sein. Der Manager bekommt echte Hebel statt Schuldzuweisungen. Niemand muss mehr die Tabelle pflegen oder den täglichen Sync-Call absitzen oder in Floskeln antworten. Das ist das Hoffnungsvollste an alledem. Niemand in diesen Räumen will den Bullshit. Nicht der Veteran, nicht der Manager, nicht der Lieferant. Also stell die vier Fragen, laut, selbst wenn du gerade erst dazugekommen bist; eine Frage ist keine Anklage. Menschen kehren zu schlichten Sätzen zurück, sobald es wieder bezahlbar ist. <strong>Nicht die Menschen musst du reparieren, sondern das Modell.</strong>`,
  ],
  statusPage: {
    heading: `Projekt Aurora, Wochenstatus`,
    badge: `GELB`,
    badgeRed: `ROT`,
    escalate: `Eskalieren`,
    deescalate: `Deeskalieren`,
    hint: `Tippe auf einen Satz, um zu sehen, was er ausschließt.`,
    sentences: [
      {
        calm: `Übergeordnetes Ziel bleibt, das Release schnellstmöglich zu stabilisieren.`,
        loud: `Übergeordnetes Ziel bleibt, das Release zu stabilisieren, und dies muss ohne weitere Verzögerung geschehen.`,
        note: `Eine Festlegung ohne Datum, ohne Verantwortlichen und ohne Definition von stabil. Schließt nichts aus. Information: null.`,
      },
      {
        calm: `Das Team arbeitet mit höchster Priorität an den offenen Fehlern.`,
        loud: `Das Team arbeitet mit höchster Priorität und voller Konzentration an den offenen Fehlern!`,
        note: `Jedes Team, überall, arbeitet mit höchster Priorität an irgendetwas. Schließt nichts aus. Information: null.`,
      },
      {
        calm: `Der Lieferant hat bestätigt, dass das Thema intern eskaliert wurde.`,
        loud: `Der Lieferant hat bestätigt, dass das Thema intern eskaliert wurde und dort mit höchster Dringlichkeit behandelt wird.`,
        note: `Der Liefergegenstand ist die Bestätigung selbst. Kein Datum, keine Auswirkung, kein Verantwortlicher. Schließt nichts aus. Information: null.`,
      },
      {
        calm: `Quick Wins werden priorisiert, wo es sinnvoll ist.`,
        loud: `Quick Wins werden mit sofortiger Wirkung priorisiert, wo es sinnvoll ist.`,
        note: `Niemand hat je Quick Wins priorisiert, wo es sinnlos ist. Schließt nichts aus. Information: null.`,
      },
      {
        // Der ehrliche Satz. Keine laute Variante: Dringlichkeit findet hier nichts.
        calm: `Der Migrationslauf am Dienstag ist durch: 12 von 14 Services sind migriert, die letzten zwei folgen im nächsten Sprint.`,
        note: `Ein Datum, eine Zahl und eine Zusage, die scheitern kann. Dieser Satz könnte falsch sein, also sagt er dir etwas. Die einzige Information auf der Seite.`,
      },
      {
        calm: `Ein weiteres Alignment ist geplant, um die nächsten Schritte zu klären.`,
        loud: `Ein weiteres Alignment ist kurzfristig angesetzt, um die nächsten Schritte zu klären.`,
        note: `Ein Meeting, das zum nächsten Meeting führt. Schließt nichts aus. Information: null.`,
      },
    ],
    footer: `Informationsgehalt dieser Seite: einer von sechs Sätzen. Die Ampel fasst die anderen fünf zusammen.`,
    aftermath: `Jetzt rot, und lauter. Fünf Sätze haben Dringlichkeit dazugewonnen, der sechste hatte nichts, was sich aufblähen ließe, und keiner behauptet etwas Neues. Informationsgehalt: unverändert.`,
  },
  sim: {
    pressure: `Schulddruck`,
    pressureAria: `Schulddruck in Prozent`,
    presets: [`Ohne Schuldzuweisung`, `Alltagsbetrieb`, `Wassermelone`, `Hexenjagd`],
    bars: [`Tatsächlicher Zustand`, `Berichteter Zustand`],
    badgeLabel: `Statusampel`,
    badges: { green: `GRÜN`, yellow: `GELB`, red: `ROT` },
    sprint: `Sprint`,
    running: `● läuft`,
    paused: `❚❚ pausiert`,
    log: {
      honest: `Die Berichte decken sich mit der Realität. Probleme werden behoben, solange sie klein sind.`,
      drifting: `Die Berichte beginnen zu beschönigen. Kleine Probleme werden nicht gemeldet, und ungemeldete Probleme werden nicht behoben.`,
      watermelon: `Außen grün, innen rot. Die Ampel steht auf Grün. Das Projekt nicht.`,
      collapse: `Die Realität holte das Projekt trotzdem ein. Das tut sie immer, nur später, und größer.`,
      recovery: `Die Berichte sind wieder ehrlich, und die Zahlen sind hässlich. Erholung beginnt langsam, dann beschleunigt sie sich.`,
    },
  },
  diagnostic: {
    heading: `Die vier Fragen, angewandt auf deinen Lieferanten`,
    prompt: `Vier Fragen, ein Urteil.`,
    countdown: [`Noch eine Frage.`, `Noch zwei Fragen.`, `Noch drei Fragen.`],
    questions: [
      { q: `Wem gehört der Code?`, options: [`Uns`, `Dem Lieferanten`] },
      { q: `Wer betreibt ihn?`, options: [`Wir`, `Der Lieferant`] },
      { q: `Wer bezahlt die Rechnung?`, options: [`Wir`, `Der Lieferant`] },
      { q: `Wer kann die Arbeit sehen?`, options: [`Wir`, `Wir nicht`] },
    ],
    verdictLabel: `Urteil`,
    verdicts: {
      product: `Eine saubere Produktform. Es gehört ihnen, du betreibst es. Die Roadmap ist ein Wetterbericht, keine Abhängigkeit, und du behältst das Recht zu gehen.`,
      service: `Eine saubere Serviceform. Es ist deine Software, gebaut, wo du zusehen kannst. Bezahle pro gelieferter Story und halte dir den Ausstieg offen.`,
      thirdThing: `Das dritte Ding. Es gehört ihnen, sie betreiben es, und alles läuft auf deine Rechnung. Jeder Hebel zeigt von dir weg. Rechne mit Tabellen.`,
      hosted: `Ein gehostetes Produkt. Immer noch die Produktform, nur von ihrer Seite des Zauns betrieben: Es gehört ihnen, sie betreiben es, sie bezahlen es, und du kaufst das Ergebnis. Völlig in Ordnung, solange die Schnittstellen klar sind und du das Recht behältst zu gehen.`,
      blind: `Deine eigene Software, gebaut, wo du nicht zusehen kannst. Das ist ein Servicevertrag, dem die Transparenzklausel fehlt. Repariere die Sichtbarkeit, bevor eine Tabelle daraus wächst.`,
    },
  },
};

const ar: ThirdThingContent = {
  title: `الشيء الثالث`,
  description: `لماذا تُنبت مشاريع تقنية المعلومات المتعثّرة جدولًا بعد جدول ومسرحيةَ الاجتماعات ولغةً لا يمكن أن تكون خاطئة، وكيف يصنع كلَّ ذلك نموذجُ توريدٍ مكسورٌ واحد.`,
  tags: [`استكشاف تفاعلي`, `مشاريع تقنية المعلومات`],
  opening: [
    `على حدّ علمي، هناك بالضبط طريقتان صريحتان لشراء البرامج من شركات أخرى.`,
    `يمكنك أن تشتريها كمنتَج. يحتفظون بمصدر البرنامج وخارطة طريقهم ومسافتهم منك. وتحصل أنت على واجهاتٍ واضحة، وتوثيق، وحقِّ البحث عن بديل. إن كانت وعودهم غامضة فذلك شأنهم وحدهم. أنت اخترتهم لما يستطيعونه اليوم، ولا شيء في خطتك يقوم أو يسقط بما قد يفعلونه السنة المقبلة.`,
    `أو تشتري خدمة. يعملون في قائمة مهامك، وعلى بنيتك التحتية، ووفق أولوياتك، وكل ما يبنونه ملكٌ لك. يتقاضون أجرهم عن كل مهمةٍ مُسلَّمة. وإن لم يعد الأمر مجديًا، تستبدلهم وتحتفظ بمصدر البرنامج، ببساطة.`,
    `لا تفتقر مشاريع تقنية المعلومات إلى الكوارث. لكنَّ نوعًا واحدًا يبدأ دائمًا بالطريقة نفسها: شخصٌ ما يوقّع عقدًا على <strong>شيءٍ ثالث</strong>. وقد شهدت هذا عدة مراتٍ حتى الآن.`,
  ],
  thirdThing: `طبعًا يبدو الأمر منطقيًا على الورق. يحتفظ المورّد بملكيته الفكرية، كشركة منتَجات. لكنه يشغّل أيضًا ما يبنيه، على حساباتك السحابية، كشركة خدمات. قائمة مهامه خاصّة ولا تستطيع الاطلاع عليها. مصدر البرنامج صندوقٌ أسود. خوادمه تُضخّم فاتورتك، ولا يحقّ لك حتى تحديد حجمها. الملكية والتشغيل والرؤية: ثلاثتها تشير الآن إلى جهاتٍ مختلفة، ولا واحدة منهم تشير إليك.`,
  symptoms: [
    `ما يلي مزيجٌ من كل الحالات التي شهدتها. يأتي الجدول أولًا. إذ يجب تتبّع تقدّم المورّد، وقائمة مهام المورّد غير متوفرة. فيظهر جدول بيانات يُحدَّث يدويًا: عشرات الأعمدة، بعضها نسخة طبق الأصل عن الأخرى، وكل صفٍّ وصفٌ لمهمةٍ تعيش أصلًا في مكانٍ لا تستطيع رؤيته. قد تضحك من الجدول، لكن لا تفعل. فالجدول نسيجُ ندبة، وكل جدول تتبع في فريقك يشير إلى موضعٍ يُئس فيه من أداةٍ مشتركة فنبت حلٌّ التفافيٌّ مكانه.`,
    `ثم ينعقد اجتماعٌ آخر، وينفتح بابٌ آخر. تقدّم المورّد لا يُرى، فتظهر مكالمة «تنسيقية» يومية كي يُسأل المورّد كيف تسير الأمور. يُدعى إليها عشرات الأفراد. منهم من يعتذر عن الحضور. ومعظمهم لا يردّ أصلًا، لأن الاعتذار والقبول كلاهما التزام، وأسلم جوابٍ أحيانًا هو لا جواب. يحضر فعليًا نحو اثني عشر شخصًا، كل صباح، لنصف ساعة. تبدو الدعوة مفيدة، لكنها استطلاعُ حالةٍ في هيئة اجتماع. إذا غُيِّبت الأنظمة، أُجبر الأفراد على سد الفراغ، وهذه الآلية تعمل على حساب كشف الرواتب. اثنا عشر شخصًا، نصف ساعة، خمسة أيام في الأسبوع، إلى الأبد. وكل ذلك ثمن غياب نظام مهامّ مشترك.`,
    `ثم الصفحات، وحدِّث عنها ولا حرج. ينشئ أحدهم صفحةً لتوثيق موضوعٍ سينتهي في قائمة مهام أحدٍ في كل حال. بعد أشهر تزدحم الصفحة، وتنظيفها عملٌ إضافي، فيُودِعها في الأرشيف ويستنسخ نسخةً جديدة. لا بأس. غير أن الرابط في دعوة الاجتماع الدوري ما يزال يشير إلى الصفحة القديمة، وسيبقى كذلك سنوات، فمن يعدّل سلسلة اجتماعاتٍ أصلًا؟ وليس في الأمر خبث، حقيقةً، وهذا هو الشيء المزعج. كل خطوةٍ كانت تسهيلًا صغيرًا مستقلًّا تمامًا عن غيره.`,
    `الآن انظر إلى الحطام. الحقائق لا أثر لها، ليس لأن المعلومات أُخفيت، بل لأنها تكاثرت حتى لم يعد أحدٌ يميّز الحديث من القديم. <strong>الحقيقة ببساطةٍ غارقةٌ تحت الأعداد.</strong>`,
  ],
  dialectIntro: `وفوق كل شيءٍ تستقرّ طريقةٌ في الكلام. «في أقرب وقتٍ ممكن». «حيثما كان ذلك منطقيًا». «بأعلى أولوية». «سنحتاج إلى دراسة الأمر». أصغِ إلى هذه الجمل كما يصغي المهندس: لا يمكن لأيٍّ منها أن تكون خاطئةً أبدًا. وهذا يبدو مديحًا حتى تفكر قليلًا. فالجملة التي لا يمكن أن تكون خاطئة لا تحمل معلومة؛ إنها لا تستبعد شيئًا. إن أُكثر منها يصبح تقريرُ الحالة متوافقًا مع كل واقعٍ ممكن، وهذا ما يحتاجه المستمعون. عرّف الفيلسوف <a href="${FRANKFURT}" target="_blank" rel="noopener noreferrer">هاري فرانكفورت</a> <a href="${ON_BULLSHIT}" target="_blank" rel="noopener noreferrer">الهراء</a> بأنه كلامٌ لا يبالي بالحقيقة. وقد كتب في ذلك كتابًا كاملًا. وكان يكفيه أن يقرأ صفحةَ حالة مشروعٍ واحدة ليوفّر على نفسه العناء.`,
  dialect: [
    `في هذه اللهجة العمل دائمًا في المستقبل، وقد أخذ مني وقتًا حتى انتبهت إلى ذلك. «سننظر في الأمر الأسبوع المقبل» تصير «نظرنا في الأمر، وسنعالجه الشهر المقبل». النظر في الأمر يُنتج نظرًا آخر في الأمر؛ الأفق يتدحرج، ووحدة زمن الانتظار تتضخّم، فيصير الأسبوع شهرًا. وللتصعيد بابه الخاص: تصعيدٌ لا يسلّم شيئًا سوى أنه حدث، تصعيدٌ بتاريخ، ولكن بدون عواقب. وحين تتحوّل شارة الحالة أخيرًا من الأصفر إلى الأحمر، اقرأ ما تحت العنوان: الجمل تقول الشيء نفسه. يتغيّر اللون ولا تتغيّر اللهجة. فالأحمر ليس إلا أصفر مع تهديدٍ بالعنف.`,
    `ما يجعل محاربة هذه اللهجة شبه مستحيلة أنها ليست صفحةَ التوثيق نفسها ولا شخصًا واحدًا بعينه. وفي صفحات مليئة بالمبهمات جملٌ صادقة دقيقة، فلا تستطيع الاعتراض على الصفحة، بل على تفاصيل صغيرة منها، والاعتراض على التفاصيل الصغيرة يبدو تنطّعًا. ثم إن اللهجة للجماعة لا لصوتٍ منفرد. «الأمر يعتمد». «علينا أن ندرس الأمر». «لا أستطيع أن أجيبك». حين يقولها ما يكفي من الأفواه، تكفّ اللهجة عن كونها طبعَ شخصٍ وتصبح لغةَ الغرفة الأم، الشيء الذي يتشرّبه الجدد في أيامهم الأولى.`,
    `ويُكمل المخضرمون الحيلة، ليس لأن المخضرم يخادع. فحين يقول من أمضى عقودًا في النظام «الأمر يعتمد»، فالأمر غالبًا يعتمد فعلًا. لقد رأى إجاباتٍ واثقة تنهار من قبل. المشكلة أن الغرفة لا تميّز الحذر المكتسَب من المراوغة، وكلاهما يخرج بالكلمات نفسها. فيستعير كلُّ مبهم من المجموعة مصداقيةَ المخضرم، ويُرى الغموض، إذا قيل من مقامٍ عالٍ، كنوعٍ من الحكمة.`,
  ],
  composite: `إن كان هذا يشبه مشروعك: أعدك أنني لم أكن أصف مشروعك. وهذا أشدّ ما يمكنني قوله إذ إنه يشبه المشاريع كلَّها.`,
  why: [
    `لماذا يتقدم المرض؟ إليك مشهدًا واحدًا، مُركّبًا مثل غيره. يُعطى المورّد سؤالًا لا يجيب عنه إلا فريق تقني للبنية التحتية. تحليل تكلفة، أو خطة سعة، اختر ما شئت. والسبب أن خوادمه لم تُستخدم بكفاءة وكان ذلك على حساب العميل. المورّد في هذا المشهد عددٌ من العلماء المختصين. بارعون فيما استُقدموا له ولكنهم ليسوا مؤهّلين للعمل التقني للبنية التحتية. كلُّ حاضر يعرف الأمرين، بمن فيهم المدير، الذي يقول الآن الجملة التي يقولها المديرون في هذا الموقف دائمًا. وتأتي في ثلاثة أجزاء: هذه مسؤوليتكم، ولا يخصني كيف ستنجزون الأمر، وإن لم يحدث الأمر فالتكاليف عليكم.`,
    `قد تبدو لك تلك الجملة نتيجة إدارةٍ سيئة، لكنها وليدة اليأس. لا يستطيع المدير إصلاح مصدر البرنامج، لأنه صندوقٌ أسود. ولا تولّي التشغيل، لأن العقد يقول إن المورّد هو من يشغّل. ولا حتى مشاهدة العمل وهو يجري، لأن قائمة المهام في نظامٍ لا يستطيع أحدٌ من فريق العميل الوصول إليه. كلُّ ورقةِ ضغطٍ حقيقية سُلِّمت بالتوقيع قبل سنوات. وما بقي هو إسناد المسؤولية والتهديد بنقل التكاليف. <strong>اللوم هو ما تبقّى من الإدارة بعد أن سُحبت منها كلُّ أوراق الضغط الحقيقية.</strong>`,
    `لاحظ ما يساويه التهديد فعلًا. إسنادُ المسؤولية إلى من لا يملك القدرة ليس إلا لومًا مُجهَّزًا مسبقًا. فالطرف الذي يحدّد حجم الخوادم لا يدفع ثمنها، والخمول هو النتيجة. وحين يكون ثمن المشروع قد رُصد قبل العمل بسنوات، يصير التهديد بالتكاليف تمثيليةً فوق تمثيلية: فذاك المال قد أُنفق. الجميع في الغرفة يعرفون هذا كله. وتُقال الجملة رغم ذلك. فقولها آخر ورقةٍ متبقية في اليد.`,
    `وما نتيجة ذلك الضغط؟ ليس الجواب، فهم عاجزون عن إنتاجه. ما يخرج بدلًا منه هو لغة «سننظر في الأمر الأسبوع المقبل». اللوم يتدفق نزولًا، والمبهمات تتدفق صعودًا، ويغادر الطرفان وبيد كلٍّ منهما أثرٌ ورقي يثبت أنه أدّى دوره. لومٌ يدخل، هراءٌ يخرج. وليست اللهجة إلا طريقة الناس في تدبّر أمورهم داخل نموذجٍ مكسور.`,
  ],
  simIntro: `يمكنك تشغيل هذه الآلة بنفسك هنا. مشاريع كهذه تُسمّى بطيخات: خضراء من الخارج، حمراء من الداخل. ارفع ضغط اللوم وراقب كيف يفترق اللونان.`,
  build: `غريزة المهندس عند هذه النقطة تدعوه ليبني شيئًا. شعرتُ بهذا بنفسي، ورأيت ذلك عند غيري: أمام قائمة مهام مورّدٍ لا تراها، يميل المرء بمحض الغريزة إلى رسم أداةٍ لنسخ المهام بين النظامين. إنها فكرةٌ غبية، وقد يلزمك نحو أسبوعٍ من التفكير الجاد لترى السبب. الحدّ الفاصل لا يختفي. سيكون على أحدهم أن يقرّر، إلى الأبد، أيُّ المهام تُنسخ. والأداة برنامجٌ إضافي يحتاج إلى صيانة. وبعد كل ذلك الجهد، تكون قد اشتريت رؤيةً كاملة لمهامّ ما زلت عاجزًا عن التصرف فيها. سترى كل شيء ولن تغيّر شيئًا. لا تستطيع بالأدوات أن تخرج من مشكلةٍ أصلُها عقد عمل؛ وكل نسخةٍ جديدة من الحقيقة، مهما بلغت براعتها، تنضمّ إلى الحشد الذي يغلبها بالعدد. لا شيء في مشروعٍ «لا يضرّ». <strong>كل ما لا يساعد يصبح مصدرًا للتخريب.</strong>`,
  fix: [
    `يسكن الإصلاح حيث يسكن العطب، في النموذج. إن كان المورّد يؤدي وظيفتين، فافصلهما إلى علاقتين. الأشخاص أنفسهم إن شئت؛ الشكلان مختلفان. يصبح النصف الأول شركةَ منتَجٍ حقيقية. يحتفظون بمصدر برنامجهم وخارطة طريقهم، ينشرون التحديثات كل ربع سنةٍ أو كل سنة، يتتبّعون عيوبهم بأنفسهم، ويدينون لك بواجهاتٍ واضحة بدلًا من الشفافية. تثبّت صندوقهم الأسود على بنيتك التحتية، وتشغّله أنت، وتبني حوله ما يلزمك من وصلات، وتحتفظ بحق الرحيل. ويصبح النصف الآخر فريقَ خدمةٍ حقيقيًا. يعملون في نظام مهامك، وعلى أنظمتك، ونيابةً عنك. ما يبنونه ملكٌ لك، ويتقاضون عن كل مهمةٍ مُسلَّمة، وهم قابلون للاستبدال بحكم الاتفاق نفسه. تخسر شيئًا في هذا الفصل: نصف المنتَج لن يعطيك أبدًا سوى خارطة طريق، لا موعدًا. لكن انظر إلى ما تستعيده. نصف الخدمة يعمل الآن حيث تراه، فتعرف بالضبط متى تبلغ التغييرات بيئة الإنتاج، ومفتاح تشغيل البرنامج في عالمك صار أخيرًا في يدك.`,
    `نصفا هذا الحل موجودان فعلًا. تنشر إيه دبليو إس ومايكروسوفت <a href="${MS_ROADMAP}" target="_blank" rel="noopener noreferrer">خرائط طريقٍ</a> لمئات الآلاف من العملاء، وتلك الخرائط لا تلتزم تقريبًا بأي شيء. ولا يغرق أحد، لأن معمارية العميل لا تعتمد على تلك الوعود؛ يبقى الغموض على الجهة الأخرى من الواجهة، حيث هو مجرّد نشرة أحوال جوية مستقبلية. إن انتقل الغموض نفسه إلى داخل قائمة مهامك، فإذا بموعد إطلاقك يعتمد فجأةً على «سننظر في الأمر». هذا هو القانون المختبئ في هذا المقال: <strong>قدرة العميل على تحمُّل الهراء تعتمد على شدّة الارتباط.</strong> وهذا يشير أيضًا إلى الإصلاح الحقيقي. مطالبةُ الأفراد المضغوطين بإفاداتٍ تحتاج الشجاعة لا تُصلح شيئًا. أصلح النموذج، حتى تعود الجمل الصريحة في المتناول من جديد.`,
  ],
  audit: `فراجع مورّديك إذن. أربعة أسئلة: من يملك مصدر البرنامج، من يشغّله، من يدفع الفاتورة، من يستطيع رؤية العمل. إن لم تصطفّ الإجابات في أحد الشكلين الصريحين، فلا تنتظر الكارثة؛ امشِ في أرض المشروع وستجد الأمراض تتكاثر. جدولٌ يكرّر نفسه. مكالمةٌ يومية يتجاهلها الناس أو يقبلونها على مضض. صفحةٌ لا يجدها أحد. غرفةٌ مليئة بأناسٍ طيبين يتكلمون لغةً لا يمكن فيها لشيءٍ أن يكون خاطئًا.`,
  closing: [
    `لن أدّعي أن شيئًا من هذا سهل الإصلاح في مشروعٍ قائم. فعقودُ الشيء الثالث تُوقَّع لسنوات، ورؤية المشكلة بوضوح لا تضمن أنك في موقفٍ يسمح لك بالقول بصوتٍ عالٍ. لكن المتانة سلاحٌ ذو حدّين. النموذج المكسور يدوم لأنه يُعمّر أطول ممن يحاربونه. والنموذج المُصلَح يدوم بالطريقة نفسها تمامًا. أصلح الشكل مرةً واحدة، وسيبقى الإصلاح يعمل طويلًا بعد أن يغادر كلُّ المعنيين إلى مشاريع أخرى. قد يكفي أن تُسمَع مرةً واحدة. والفرص لكي تُسمَع لا تنقطع: كل تجديدٍ للعقد، وكل تمديد، وكل أزمةٍ يُطلق فيها تهديدٌ لأن لا شيء آخر بقي، كلُّ واحدةٍ منها فرصةٌ جديدة للتغيير.`,
    `وحين تأتي الفرصة، تذكّر: الفصل لا يكلّف أحدًا وظيفته. الأشخاص أنفسهم، وقد فُرزوا في أشكالٍ يُقيَّمون فيها على ما يجيدونه فعلًا. العلماء يعودون علماء. والمدير ينال أوراق ضغطٍ حقيقية بدلًا من اللوم. لم يعد على أحدٍ أن يحدّث الجدول أو يجلس في الاجتماع اليومي أو يجيب بالمبهمات. تلك أرجى حقيقةٍ في الأمر كله. لا أحد في هذه الغرف يريد الهراء. لا المخضرم، ولا المدير، ولا المورّد. فاطرح الأسئلة الأربعة، بصوتٍ مسموع، حتى لو كنت أحدث فرد في الغرفة؛ فالسؤال ليس اتهامًا. يعود الناس إلى الجمل الصريحة عندما تصبح سهلة المتناول من جديد. <strong>ليس الناس بحاجة للإصلاح، بل النموذج.</strong>`,
  ],
  statusPage: {
    heading: `مشروع الفجر، تقرير الحالة الأسبوعي`,
    badge: `أصفر`,
    badgeRed: `أحمر`,
    escalate: `صعِّد`,
    deescalate: `أوقف التصعيد`,
    hint: `انقر على جملةٍ لترى ما تستبعده.`,
    sentences: [
      {
        calm: `يبقى الهدف العام هو تحقيق استقرار الإصدار في أقرب وقتٍ ممكن.`,
        loud: `يبقى الهدف العام هو تحقيق استقرار الإصدار في أقرب وقتٍ ممكن، ولا شيء يتقدّم عليه إطلاقًا.`,
        note: `التزام بلا موعد، ولا مسؤول، ولا تعريفٍ للاستقرار. لا يُستبعَد شيء. المعلومة: صفر.`,
      },
      {
        calm: `يعمل الفريق على العيوب المفتوحة بأعلى أولوية.`,
        loud: `يعمل الفريق على العيوب المفتوحة بأعلى أولوية ودون أيّ تأخير!`,
        note: `كل فريقٍ في كل مكانٍ يعمل على شيءٍ ما بأعلى أولوية. لا يُستبعَد شيء. المعلومة: صفر.`,
      },
      {
        calm: `أكّد المورّد أن المشكلة صُعِّدت داخليًا.`,
        loud: `أكّد المورّد أن المشكلة صُعِّدت داخليًا، وأنها تُتابَع الآن على وجه الاستعجال.`,
        note: `الإنجاز هو التأكيد نفسه. لا موعد، ولا أثر، ولا مسؤول. لا يُستبعَد شيء. المعلومة: صفر.`,
      },
      {
        calm: `ستُمنح المكاسب السريعة الأولوية حيثما كان ذلك منطقيًا.`,
        loud: `ستُمنح المكاسب السريعة الأولوية القصوى فورًا حيثما كان ذلك منطقيًا.`,
        note: `لم يمنح أحدٌ قط المكاسبَ السريعة الأولوية حين لم يكن ذلك منطقيًا. لا يُستبعَد شيء. المعلومة: صفر.`,
      },
      {
        // الجملة الصريحة. لا صيغة عالية لها: الإلحاح لا يجد فيها ما ينفخه.
        calm: `جرى الانتقال يوم الثلاثاء: أُنجزت 12 من أصل 14 خدمة، والخدمتان الأخيرتان تلحقان في الدورة القادمة.`,
        note: `موعدٌ وعددٌ والتزامٌ يمكن أن يفشل. هذه الجملة يمكن أن تكون خاطئة، ولذلك فهي تخبرك شيئًا. إنها المعلومة الوحيدة في الصفحة.`,
      },
      {
        calm: `من المخطط عقد اجتماع مواءمةٍ إضافي لتوضيح الخطوات التالية.`,
        loud: `من المخطط عقد اجتماع مواءمةٍ إضافي وعاجل لتوضيح الخطوات التالية.`,
        note: `اجتماعٌ يؤدي إلى اجتماع. لا يُستبعَد شيء. المعلومة: صفر.`,
      },
    ],
    footer: `المحتوى المعلوماتي لهذه الصفحة: جملةٌ واحدة من ستّ. أما الشارة فتلخّص الجمل الخمس الأخرى.`,
    aftermath: `ارتفع الضغط ولم ترتفع المعلومة. تضخّمت الصياغة لا مضمونها: خمسُ جملٍ ما زالت لا تستبعد شيئًا، وواحدةٌ وحدها ما زالت تقول شيئًا.`,
  },
  sim: {
    pressure: `ضغط اللوم`,
    pressureAria: `نسبة ضغط اللوم`,
    presets: [`بلا لوم`, `العمل كالمعتاد`, `بطيخة`, `اضطهاد ظالم`],
    bars: [`الصحة الفعلية`, `الصحة المُبلَّغة`],
    badgeLabel: `شارة الحالة`,
    badges: { green: `أخضر`, yellow: `أصفر`, red: `أحمر` },
    sprint: `الدورة`,
    running: `● يعمل`,
    paused: `❚❚ متوقّف`,
    log: {
      honest: `التقارير تطابق الواقع. والمشاكل تُصلَح وهي صغيرة.`,
      drifting: `بدأت التقارير تجامل. المشاكل الصغيرة لا يُبلَّغ عنها، والمشاكل التي لا يُبلَّغ عنها لا تُصلَح.`,
      watermelon: `أخضر من الخارج، أحمر من الداخل. الشارة سليمة، أما المشروع فلا.`,
      collapse: `وصل الواقع رغم كل شيء. إنه يصل دائمًا، لكن متأخرًا وأكبر.`,
      recovery: `عادت التقارير صادقةً والأرقام قبيحة. يبدأ التعافي بطيئًا ثم يتسارع.`,
    },
  },
  diagnostic: {
    heading: `الأسئلة الأربعة مطبَّقةً على مورّدك`,
    prompt: `أربعة أسئلة، حكمٌ واحد.`,
    countdown: [`بقي سؤالٌ واحد.`, `بقي سؤالان.`, `بقيت ثلاثة أسئلة.`],
    questions: [
      { q: `من يملك مصدر البرنامج؟`, options: [`نحن`, `المورّد`] },
      { q: `من يشغّله؟`, options: [`نحن`, `المورّد`] },
      { q: `من يدفع الفاتورة؟`, options: [`نحن`, `المورّد`] },
      { q: `من يستطيع رؤية العمل؟`, options: [`نستطيع`, `لا نستطيع`] },
    ],
    verdictLabel: `الحكم`,
    verdicts: {
      product: `شكل منتَجٍ صريح. هم يملكونه وأنت تشغّله. خارطة طريقهم مجرّد نشرة أحوالٍ جوية، لا شيء في خطتك يعتمد عليها، وتحتفظ أنت بحق الرحيل.`,
      service: `شكل خدمةٍ صريح. البرنامج برنامجك، يُبنى حيث تراه. ادفع مقابل المهامّ المُسلَّمة وأبقِ باب تغيير الخدمة مفتوحًا.`,
      thirdThing: `الشيء الثالث. هم يملكونه وهم يشغّلونه، وكل ذلك على فاتورتك. كل أوراق الضغط بعيدةٌ عن يدك. توقّع الجداول واجتماعات لا تفيد.`,
      hosted: `منتَجٌ مُستضاف. هو شكل المنتَج نفسه، لكنه يُشغَّل من جهتهم: هم يملكونه وهم يشغّلونه وهم يدفعون ثمنه، وأنت تشتري النتيجة. لا بأس بذلك ما دامت الواجهات واضحة وما دمت محتفظًا بحق الرحيل.`,
      blind: `برنامجك أنت، يُبنى حيث لا تراه. هذا عقد خدمةٍ ينقصه بند الشفافية. أصلح الرؤية قبل أن يُنبت الأمر جدولًا واجتماعات لا حصر لها.`,
    },
  },
};

export const TT_CONTENT: Record<Locale, ThirdThingContent> = { en, de, ar };

export function getThirdThingContent(lang: string): ThirdThingContent {
  return TT_CONTENT[toLocale(lang)];
}
