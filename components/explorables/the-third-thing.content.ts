import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n";

/** One fictional status-page sentence plus the annotation revealed on tap. */
export type StatusSentence = [string, string];

/** Labels for the zero-bit status page, passed from the (server) body to the client widget. */
export type StatusPageStrings = {
  heading: string;
  badge: string;
  hint: string;
  sentences: StatusSentence[];
  footer: string;
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
  };
};

/** Labels for the four-question contract diagnostic. */
export type DiagnosticQuestion = { q: string; options: [string, string] };
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
    `Now look at the wreck, it's like organic chaos. The facts are nowhere to be found, and it's not because information was hidden, but rather it multiplied until nobody could tell what's current and what's not. <strong>The truth is simply overwhelmed by clutter.</strong>`,
  ],
  dialectIntro: `And over everything settles a way of talking. "As soon as possible." "Where it makes sense." "With highest priority." "We will have to investigate." Listen to these sentences the way an engineer listens: none of them can ever be wrong. Which sounds like a compliment until you sit with it. A sentence that cannot be wrong carries no information; it rules nothing out. Stack enough of them and a status report becomes compatible with every possible reality, which is exactly what everyone needs it to be. The philosopher <a href="${FRANKFURT}" target="_blank" rel="noopener noreferrer">Harry Frankfurt</a> defined <a href="${ON_BULLSHIT}" target="_blank" rel="noopener noreferrer">bullshit</a> as speech that is indifferent to truth. He wrote a whole monograph about it. He could have read one project status page and saved himself the trouble.`,
  dialect: [
    `The dialect has verb tenses, which took me a while to notice. Work lives in the future: "we will look into it next week" becomes "we looked into it, and we will tackle it next month." Looking-into-it is a deliverable that produces another looking-into-it; the horizon rolls, the unit inflates, a week becomes a month. Escalation has its own genre, the escalation that delivers nothing but the fact of itself, no date attached, no impact named. And when a status badge finally turns from yellow to red, read the page underneath: the sentences are the same. The color changes, the dialect does not. Red is just yellow with a threat of violence.`,
    `What makes the dialect nearly impossible to fight is that it is neither the whole document nor any single person. Real status pages carry honest, well-calibrated sentences right next to the hedged ones, so you cannot object to the page, only to bits and pieces, and objecting to bits and pieces sounds like pedantry. And the dialect is a chorus, not a soloist. "It depends." "We have to investigate." "I cannot tell you." When enough mouths say these things, the dialect stops being someone's personality and becomes the room's native language, the thing newcomers absorb as onboarding.`,
    `Seniority completes the trick, and not because the veteran is bluffing. When someone with decades in the system says "it depends", it usually does depend. They have watched confident answers collapse before. The problem is that the room cannot tell earned caution from evasion and both come out as the same three words. So every empty hedge in the chorus gets to borrow the veteran's credibility, and vagueness, said from high enough up, gets heard as wisdom.`,
  ],
  composite: `If this sounds like your project: I promise I was not describing your project. That is the most damning thing I can say. It sounds like all of them.`,
  why: [
    `Why does it all grow? Here is one scene, composited like the rest. A vendor gets handed a question only an infrastructure team could answer. A cost analysis, a capacity plan, pick one. The reason is that their servers sit underutilized on a bill the customer pays. The vendor, in this scene, is a room of scientists. Brilliant at exactly what they were hired for. Not infrastructure people. Everyone in the room knows both things, including the manager, who now says the sentence that managers in this position always say. It comes in three parts: this is your responsibility, I do not care how, and if it does not happen, the costs land on you.`,
    `It is tempting to hear that sentence as bad management, but it's a product of desperation. The manager cannot fix the code, because it is a black box. Cannot take over operations, because the contract says the vendor operates. Cannot even watch the work happen, because the tickets live in a Jira nobody in the room can open. Every real lever was signed away years ago. What remains is assigning responsibility and threatening cost transfer. <strong>Blame is what management looks like after every real lever has been contracted away.</strong>`,
    `Notice what the threat is actually worth. Assigning responsibility to someone without the capability just schedules the blame in advance. The party who sizes the servers does not pay for them and underutilization is the result. And when the money was committed years before the work, the threat of costs is theater on top of theater: that money is already spent. Everyone in the room knows all of this. The sentence gets said anyway. Saying it is the only move left on the board.`,
    `What's the result of that pressure? Not the answer. They cannot produce it. What comes out instead is language: "we will look into it next week." Blame flows down, hedges flow up, and both sides walk out with a paper trail proving they did their part. Blame in, bullshit out. The dialect is just how people deal inside a broken model.`,
  ],
  build: `The engineer's instinct at this point is to build something. I have felt it myself, and I have watched others feel it: faced with an invisible vendor backlog, one is tempted on pure instinct to sketch a tool to sync tickets between the two Jiras. That's a stupid idea, and it takes about a week of honest thinking to see why. The boundary does not disappear. Somebody would have to decide, forever, which tickets cross it. The sync itself is one more piece of software that demands maintenance. And after all that work you have bought yourself a perfect view of tickets you still cannot act on. You would see everything and change nothing. You cannot tool your way out of a contract-shaped problem; every new copy of the truth, however clever, just joins the crowd that outnumbers it. There is no such thing as "can't hurt" in a project. <strong>Everything that does not actively help, actively hinders.</strong>`,
  fix: [
    `The fix lives where the break lives, in the model. If a vendor is doing two jobs, split them into two relationships. Same people, if you like; different shapes. One half becomes a true product company. They keep their code and their roadmap, publish updates quarterly or yearly, track their own issues, and owe you clear interfaces instead of transparency. You install their black box on your infrastructure, you operate it, you build your own shims around it, and you keep the right to leave. The other half becomes a true service team. They work in your Jira, on your systems, on your behalf. What they build is yours, they are paid per delivered story, and they are replaceable by construction. You lose something in the split: the product half will only ever give you a roadmap, not a date. But look at what you get back. The service half now works where you can see them, so you know exactly when something reaches production, and the switch that turns a feature on in your world is finally in your hand.`,
    `Both halves of this exist. AWS and Microsoft publish roadmaps to hundreds of thousands of customers, and those roadmaps commit to almost nothing. Nobody drowns, because the customer's architecture never depends on those promises; the vagueness stays on the far side of an interface, where it is just a weather forecast. Move the same vagueness into your own backlog and your release date suddenly depends on a "we will look into it." That is the law hiding under this whole essay: <strong>bullshit tolerance is a function of coupling.</strong> It also points at the real fix. Demanding braver sentences from people under pressure repairs nothing. You work to repair the model, until plain sentences are affordable again.`,
  ],
  audit: `So audit your vendors. Four questions: who owns the code, who operates it, who pays the bill, who can see the work. If the answers do not line up into one of the two honest shapes, you do not need to wait for the disaster; walk the project floor and you will find it already growing. A spreadsheet that repeats itself. A daily call people ignore or begrudgingly accept. A page nobody can find. A room full of decent people speaking a language in which nothing can be wrong.`,
  closing: [
    `I will not pretend any of this is easy to fix in a brownfield. Contracts like the third thing get signed for years, and seeing the problem clearly is no guarantee you have the standing to say it out loud. But durability cuts both ways. A broken model persists because it outlasts the people who fight it. A repaired model persists the exact same way. Fix the shape once and the fix keeps working long after everyone involved has changed projects. Being heard once is enough. And the chances to be heard keep coming: every renewal, every extension, every crisis where a threat gets made because nothing else is left.`,
    `And when the chance comes, remember: the split costs nobody their job. Same people, sorted into shapes where they get measured on what they are actually good at. The scientists get to be scientists. The manager gets real levers instead of blame. Nobody has to maintain the spreadsheet or sit through the daily or answer in hedges anymore. That is the most hopeful fact in all of this. Nobody in these rooms wants the bullshit. Not the veteran, not the manager, not the vendor. So ask the four questions, out loud, even if you are the newest person in the room; a question is not an accusation. People go back to speaking in plain sentences the moment it becomes affordable again. <strong>It's not the people you need to fix, it's the model.</strong>`,
  ],
  statusPage: {
    heading: `Project Aurora, weekly status`,
    badge: `YELLOW`,
    hint: `Tap a sentence to see what it rules out.`,
    sentences: [
      [
        `The overall goal remains to stabilize the release as soon as possible.`,
        `Commits to: no date, no owner, no definition of stable. Rules out: nothing. Information: 0 bits.`,
      ],
      [
        `The team is working on the open defects with highest priority.`,
        `Every team, everywhere, is working on something with highest priority. Rules out: nothing. Information: 0 bits.`,
      ],
      [
        `The supplier has confirmed that the issue was escalated internally.`,
        `The deliverable is the confirmation itself. No date, no impact, no owner. Rules out: nothing. Information: 0 bits.`,
      ],
      [
        `Quick wins will be prioritized where it makes sense.`,
        `Nobody has ever prioritized quick wins where it makes no sense. Rules out: nothing. Information: 0 bits.`,
      ],
      [
        `The migration finished on Tuesday: 12 of 14 services are done, the last two follow next sprint.`,
        `A date, a count, and a commitment that can fail. This sentence could be wrong, so it tells you something. The only information on the page.`,
      ],
      [
        `A further alignment is planned to clarify the next steps.`,
        `A meeting about a meeting. Rules out: nothing. Information: 0 bits.`,
      ],
    ],
    footer: `Information content of this page: one sentence out of six. The badge summarizes the other five.`,
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
      thirdThing: `The third thing. They own it and they operate it, so ownership, operation, and visibility all point away from you. Expect spreadsheets.`,
      blind: `Your own software, built where you cannot see it. That is a service contract missing its transparency clause. Fix the visibility before it grows a spreadsheet.`,
    },
  },
};

const de: ThirdThingContent = {
  title: `Das dritte Ding`,
  description: `Warum kriselnde IT-Projekte Schatten-Tabellen, Status-Theater und eine Sprache hervorbringen, die nie falsch sein kann, und wie ein einziges kaputtes Lieferantenmodell all das erzeugt.`,
  tags: [`Explorable`, `IT-Projekte`],
  opening: [
    `Soweit ich das überblicke, gibt es genau zwei ehrliche Arten, Software von einer anderen Firma zu kaufen.`,
    `Du kannst ein Produkt kaufen. Sie behalten ihren Code, ihre Roadmap und ihre Distanz. Du bekommst klare Schnittstellen, Dokumentation und das Recht, dich anderswo umzusehen. Ob ihre Versprechen vage sind, ist ihre Sache. Du hast sie für das gewählt, was sie heute können, und nichts in deinem Plan steht oder fällt damit, was sie nächstes Jahr vielleicht tun.`,
    `Oder du kaufst eine Dienstleistung. Sie arbeiten in deinem Backlog, auf deiner Infrastruktur, nach deinen Prioritäten, und alles, was sie bauen, gehört dir. Bezahlt werden sie pro gelieferter Story. Wenn es nicht mehr passt, ersetzt du sie und behältst die Software. So einfach ist das.`,
    `An Katastrophen herrscht in der Unternehmens-IT kein Mangel. Aber eine bestimmte Sorte beginnt immer gleich: Jemand unterschreibt einen Vertrag für ein <strong>drittes Ding</strong>. Diesen Film habe ich inzwischen ein paarmal gesehen.`,
  ],
  thirdThing: `Klar sieht das auf dem Papier vernünftig aus. Der Lieferant behält sein geistiges Eigentum, wie eine Produktfirma. Aber er betreibt auch, was er baut, auf deinen Cloud-Accounts, wie eine Dienstleistungsfirma. Seine Tickets leben in seinem Jira, in das du nicht hineinschauen kannst. Sein Code ist eine Blackbox. Seine Server treiben deine Rechnung hoch, und nicht mal ihre Größe darfst du bestimmen. Eigentum, Betrieb, Sichtbarkeit: Alle drei zeigen jetzt in verschiedene Richtungen, und keine davon zeigt auf dich.`,
  symptoms: [
    `Was jetzt folgt, ist aus allen Fällen zusammengesetzt, die ich miterlebt habe. Zuerst kommt die Tabelle. Jemand muss den Fortschritt des Lieferanten verfolgen. Dessen Tickets sind unsichtbar. Also erscheint eine Excel-Tabelle, von Hand gepflegt, Dutzende Spalten, mehrere davon dieselbe Spalte unter verschiedenen Namen, jede Zeile der Schatten eines Tickets, das längst irgendwo lebt, wo du nicht hinsehen kannst. Es ist verlockend, über die Tabelle zu lachen, aber lass es. Die Tabelle ist Narbengewebe, und jede Schatten-Tabelle in deiner Firma markiert eine Stelle, an der die Organisation ein gemeinsames Werkzeug aufgegeben und sich stattdessen einen Workaround gezüchtet hat.`,
    `Als Nächstes kommt das Meeting, und darüber könnte ich mich stundenlang aufregen. Zwischen den Meilensteinen ist der Fortschritt des Lieferanten unsichtbar, also erscheint ein täglicher „Sync"-Call, damit jemand den Lieferanten fragen kann, wie es denn so läuft. Dutzende Leute werden eingeladen. Ein paar sagen ab. Die meisten antworten gar nicht, denn Absagen und Zusagen sind beides Festlegungen, und die sicherste Antwort ist manchmal gar keine. Ein Dutzend erscheint tatsächlich, jeden Morgen, für eine halbe Stunde. Die Einladung will nützlich sein, aber sie ist eine verkleidete Statusabfrage. Denn wenn Systeme sich nicht synchronisieren dürfen, werden Menschen zum Sync-Mechanismus, und dieser hier läuft über die Gehaltsliste. Ein Dutzend Leute, eine halbe Stunde, fünf Tage die Woche, für immer. Alles der Preis dafür, kein gemeinsames Ticketsystem zu haben.`,
    `Bei den Seiten, die dazukommen, juckt dir vielleicht das Gesicht. Jemand legt eine Confluence-Seite für ein Thema an, das am Ende sowieso in Jira landet. Monate später ist die Seite zugemüllt, und Aufräumen wäre mehr Arbeit, also archiviert man sie und klont eine frische Kopie. Meinetwegen. Nur zeigt der Link in der Serieneinladung weiter auf die alte Seite, und das wird er noch Jahre tun, denn wer bearbeitet schon Meeting-Serien. Und es ist wirklich keine Böswilligkeit, das ist ja das Ärgerliche. Jeder Schritt war eine kleine Bequemlichkeit, die sich für sich genommen verteidigen ließ.`,
    `Und jetzt sieh dir die Trümmer an, das reinste organische Chaos. Die Fakten sind nirgends zu finden, und zwar nicht, weil Information versteckt wurde, sondern weil sie sich vervielfältigt hat, bis niemand mehr sagen konnte, was aktuell ist und was nicht. <strong>Die Wahrheit geht schlicht im Gerümpel unter.</strong>`,
  ],
  dialectIntro: `Und über allem legt sich eine Art zu reden. „So bald wie möglich." „Wo es sinnvoll ist." „Mit höchster Priorität." „Das müssen wir erst untersuchen." Hör diesen Sätzen zu, wie ein Ingenieur zuhört: Keiner von ihnen kann jemals falsch sein. Was wie ein Kompliment klingt, bis du kurz darüber nachdenkst. Ein Satz, der nicht falsch sein kann, trägt keine Information; er schließt nichts aus. Staple genug davon aufeinander, und ein Statusbericht wird mit jeder möglichen Realität vereinbar, und genau das brauchen alle von ihm. Der Philosoph <a href="${FRANKFURT}" target="_blank" rel="noopener noreferrer">Harry Frankfurt</a> definierte <a href="${ON_BULLSHIT}" target="_blank" rel="noopener noreferrer">Bullshit</a> als Rede, der die Wahrheit gleichgültig ist. Er hat eine ganze Monografie darüber geschrieben. Er hätte auch einfach eine Projekt-Statusseite lesen und sich die Mühe sparen können.`,
  dialect: [
    `Der Dialekt hat Zeitformen, was mir erst nach einer Weile aufgefallen ist. Arbeit lebt im Futur: Aus „Wir schauen uns das nächste Woche an" wird „Wir haben es uns angeschaut, und wir gehen es nächsten Monat an". Das Sich-Anschauen ist ein Liefergegenstand, der ein weiteres Sich-Anschauen hervorbringt; der Horizont rollt weiter, die Einheit bläht sich auf, aus der Woche wird ein Monat. Die Eskalation hat ihr eigenes Genre, die Eskalation, die nichts liefert außer der Tatsache ihrer selbst, kein Datum dran, keine Auswirkung benannt. Und wenn ein Status-Badge endlich von Gelb auf Rot springt, lies die Seite darunter: Die Sätze sind dieselben. Die Farbe wechselt, der Dialekt nicht. Rot ist nur Gelb mit Gewaltandrohung.`,
    `Was den Dialekt fast unmöglich zu bekämpfen macht: Er ist weder das ganze Dokument noch eine einzelne Person. Echte Statusseiten tragen ehrliche, gut kalibrierte Sätze direkt neben den ausweichenden, also kannst du nicht der Seite widersprechen, nur einzelnen Stellen, und einzelnen Stellen zu widersprechen klingt nach Pedanterie. Und der Dialekt ist ein Chor, kein Solist. „Kommt darauf an." „Das müssen wir untersuchen." „Das kann ich dir nicht sagen." Wenn genug Münder diese Dinge sagen, hört der Dialekt auf, jemandes Persönlichkeit zu sein, und wird zur Muttersprache des Raums, zu dem, was Neue als Onboarding aufsaugen.`,
    `Seniorität vollendet den Trick, und zwar nicht, weil der Veteran blufft. Wenn jemand mit Jahrzehnten im System „kommt darauf an" sagt, kommt es meistens wirklich darauf an. Er hat schon selbstbewusste Antworten zusammenbrechen sehen. Das Problem ist, dass der Raum verdiente Vorsicht nicht von Ausweichen unterscheiden kann, und beides kommt als dieselben drei Wörter heraus. Also darf sich jede leere Floskel im Chor die Glaubwürdigkeit des Veteranen leihen, und Vagheit, von weit genug oben gesprochen, wird als Weisheit gehört.`,
  ],
  composite: `Falls das nach deinem Projekt klingt: Ich verspreche dir, ich habe nicht dein Projekt beschrieben. Das ist das Vernichtendste, was ich sagen kann. Es klingt nach allen.`,
  why: [
    `Warum wächst das alles? Hier ist eine Szene, zusammengesetzt wie der Rest. Ein Lieferant bekommt eine Frage vorgesetzt, die nur ein Infrastrukturteam beantworten könnte. Eine Kostenanalyse, ein Kapazitätsplan, such dir was aus. Der Grund: Seine Server stehen unterausgelastet auf einer Rechnung, die der Kunde bezahlt. Der Lieferant ist in dieser Szene ein Raum voller Wissenschaftler. Brillant in genau dem, wofür man sie geholt hat. Keine Infrastrukturleute. Alle im Raum wissen beides, auch der Manager, der jetzt den Satz sagt, den Manager in dieser Lage immer sagen. Er kommt in drei Teilen: Das ist eure Verantwortung, wie ist mir egal, und wenn es nicht passiert, landen die Kosten bei euch.`,
    `Es ist verlockend, diesen Satz als schlechtes Management zu hören, aber er ist ein Produkt der Verzweiflung. Der Manager kann den Code nicht reparieren, der ist eine Blackbox. Kann den Betrieb nicht übernehmen, der Vertrag sagt, der Lieferant betreibt. Kann der Arbeit nicht mal zusehen, die Tickets leben in einem Jira, das niemand im Raum öffnen kann. Jeder echte Hebel wurde vor Jahren per Unterschrift abgegeben. Was bleibt, ist Verantwortung zuweisen und mit Kostenübertragung drohen. <strong>Schuldzuweisung ist das, was von Management übrig bleibt, wenn jeder echte Hebel wegverhandelt wurde.</strong>`,
    `Beachte, was die Drohung tatsächlich wert ist. Verantwortung jemandem zuzuweisen, dem die Fähigkeit fehlt, terminiert nur die Schuldzuweisung im Voraus. Wer die Server dimensioniert, bezahlt sie nicht, und Unterauslastung ist das Ergebnis. Und wenn das Geld Jahre vor der Arbeit gebunden wurde, ist die Kostendrohung Theater auf Theater: Das Geld ist längst ausgegeben. Jeder im Raum weiß das alles. Der Satz wird trotzdem gesagt. Ihn zu sagen ist der einzige Zug, der auf dem Brett noch übrig ist.`,
    `Was kommt bei dem Druck heraus? Nicht die Antwort. Die können sie nicht liefern. Heraus kommt stattdessen Sprache: „Wir schauen uns das nächste Woche an." Schuld fließt nach unten, Floskeln fließen nach oben, und beide Seiten gehen mit einer Papierspur nach Hause, die beweist, dass sie ihren Teil getan haben. Schuld rein, Bullshit raus. Der Dialekt ist einfach, wie Leute in einem kaputten Modell zurechtkommen.`,
  ],
  build: `Der Instinkt des Ingenieurs an dieser Stelle ist, etwas zu bauen. Ich habe ihn selbst gespürt, und ich habe ihn bei anderen gesehen: Vor einem unsichtbaren Lieferanten-Backlog will man aus purem Instinkt ein Werkzeug skizzieren, das Tickets zwischen den beiden Jiras synchronisiert. Das ist eine dumme Idee, und es dauert ungefähr eine Woche ehrlichen Nachdenkens, um zu sehen, warum. Die Grenze verschwindet nicht. Jemand müsste für immer entscheiden, welche Tickets sie überqueren. Der Sync selbst ist ein weiteres Stück Software, das gewartet werden will. Und nach all der Arbeit hast du dir einen perfekten Blick auf Tickets erkauft, auf die du weiterhin nicht einwirken kannst. Du würdest alles sehen und nichts ändern. Aus einem Problem, das die Form eines Vertrags hat, kannst du dich nicht herausbauen; jede neue Kopie der Wahrheit, so clever sie ist, reiht sich nur in die Menge ein, die sie in die Unterzahl bringt. So etwas wie „kann nicht schaden" gibt es in einem Projekt nicht. <strong>Alles, was nicht aktiv hilft, behindert aktiv.</strong>`,
  fix: [
    `Die Reparatur wohnt dort, wo der Bruch wohnt, im Modell. Wenn ein Lieferant zwei Jobs macht, teile sie in zwei Beziehungen. Dieselben Leute, wenn du willst; andere Formen. Die eine Hälfte wird eine echte Produktfirma. Sie behält ihren Code und ihre Roadmap, veröffentlicht Updates quartalsweise oder jährlich, verfolgt ihre eigenen Issues und schuldet dir klare Schnittstellen statt Transparenz. Du installierst ihre Blackbox auf deiner Infrastruktur, du betreibst sie, du baust deine eigenen Adapter darum, und du behältst das Recht zu gehen. Die andere Hälfte wird ein echtes Serviceteam. Sie arbeiten in deinem Jira, auf deinen Systemen, in deinem Auftrag. Was sie bauen, gehört dir, sie werden pro gelieferter Story bezahlt, und sie sind per Konstruktion ersetzbar. Du verlierst etwas bei der Teilung: Die Produkthälfte wird dir immer nur eine Roadmap geben, nie ein Datum. Aber sieh, was du zurückbekommst. Die Servicehälfte arbeitet jetzt dort, wo du sie sehen kannst, du weißt also genau, wann etwas die Produktion erreicht, und der Schalter, der ein Feature in deiner Welt einschaltet, liegt endlich in deiner Hand.`,
    `Beide Hälften davon existieren. AWS und Microsoft veröffentlichen Roadmaps für Hunderttausende Kunden, und diese Roadmaps versprechen so gut wie nichts. Niemand geht daran unter, denn die Architektur des Kunden hängt nie an diesen Versprechen; die Vagheit bleibt auf der anderen Seite einer Schnittstelle, wo sie bloß ein Wetterbericht ist. Hol dieselbe Vagheit in dein eigenes Backlog, und dein Release-Datum hängt plötzlich an einem „Wir schauen uns das an". Das ist das Gesetz, das sich unter diesem ganzen Essay versteckt: <strong>Bullshit-Toleranz ist eine Funktion der Kopplung.</strong> Und es zeigt auf die echte Reparatur. Von Menschen unter Druck mutigere Sätze zu verlangen repariert nichts. Du arbeitest daran, das Modell zu reparieren, bis schlichte Sätze wieder bezahlbar sind.`,
  ],
  audit: `Also prüfe deine Lieferanten. Vier Fragen: Wem gehört der Code, wer betreibt ihn, wer bezahlt die Rechnung, wer kann die Arbeit sehen. Wenn sich die Antworten nicht zu einer der beiden ehrlichen Formen fügen, musst du nicht auf die Katastrophe warten; geh über den Projektflur, und du findest sie schon beim Wachsen. Eine Tabelle, die sich selbst wiederholt. Ein Daily, das die Leute ignorieren oder nur zähneknirschend annehmen. Eine Seite, die niemand findet. Ein Raum voller anständiger Leute, die eine Sprache sprechen, in der nichts falsch sein kann.`,
  closing: [
    `Ich tue nicht so, als wäre das alles im Brownfield leicht zu reparieren. Verträge wie das dritte Ding werden für Jahre unterschrieben, und das Problem klar zu sehen garantiert noch nicht das Standing, es laut auszusprechen. Aber Beständigkeit wirkt in beide Richtungen. Ein kaputtes Modell überdauert, weil es die Menschen überlebt, die dagegen ankämpfen. Ein repariertes Modell überdauert auf genau dieselbe Weise. Repariere die Form einmal, und die Reparatur wirkt noch lange, nachdem alle Beteiligten das Projekt gewechselt haben. Einmal gehört zu werden genügt. Und die Chancen, gehört zu werden, kommen immer wieder: jede Verlängerung, jede Erweiterung, jede Krise, in der eine Drohung ausgesprochen wird, weil nichts anderes mehr übrig ist.`,
    `Und wenn die Chance kommt, denk daran: Die Teilung kostet niemanden den Job. Dieselben Leute, sortiert in Formen, in denen sie an dem gemessen werden, was sie wirklich gut können. Die Wissenschaftler dürfen Wissenschaftler sein. Der Manager bekommt echte Hebel statt Schuldzuweisungen. Niemand muss mehr die Tabelle pflegen oder das Daily absitzen oder in Floskeln antworten. Das ist die hoffnungsvollste Tatsache an alledem. Niemand in diesen Räumen will den Bullshit. Nicht der Veteran, nicht der Manager, nicht der Lieferant. Also stell die vier Fragen, laut, selbst wenn du die neueste Person im Raum bist; eine Frage ist keine Anklage. Menschen kehren zu schlichten Sätzen zurück, sobald es wieder bezahlbar ist. <strong>Nicht die Menschen musst du reparieren, sondern das Modell.</strong>`,
  ],
  statusPage: {
    heading: `Projekt Aurora, Wochenstatus`,
    badge: `GELB`,
    hint: `Tippe auf einen Satz, um zu sehen, was er ausschließt.`,
    sentences: [
      [
        `Übergeordnetes Ziel bleibt, das Release so bald wie möglich zu stabilisieren.`,
        `Legt sich fest auf: kein Datum, keinen Verantwortlichen, keine Definition von stabil. Schließt aus: nichts. Information: 0 Bit.`,
      ],
      [
        `Das Team arbeitet mit höchster Priorität an den offenen Defekten.`,
        `Jedes Team, überall, arbeitet mit höchster Priorität an irgendetwas. Schließt aus: nichts. Information: 0 Bit.`,
      ],
      [
        `Der Lieferant hat bestätigt, dass das Thema intern eskaliert wurde.`,
        `Der Liefergegenstand ist die Bestätigung selbst. Kein Datum, keine Auswirkung, kein Verantwortlicher. Schließt aus: nichts. Information: 0 Bit.`,
      ],
      [
        `Quick Wins werden priorisiert, wo es sinnvoll ist.`,
        `Niemand hat je Quick Wins priorisiert, wo es sinnlos ist. Schließt aus: nichts. Information: 0 Bit.`,
      ],
      [
        `Die Migration wurde am Dienstag abgeschlossen: 12 von 14 Services sind fertig, die letzten zwei folgen im nächsten Sprint.`,
        `Ein Datum, eine Zahl und eine Zusage, die scheitern kann. Dieser Satz könnte falsch sein, also sagt er dir etwas. Die einzige Information auf der Seite.`,
      ],
      [
        `Ein weiteres Alignment ist geplant, um die nächsten Schritte zu klären.`,
        `Ein Meeting über ein Meeting. Schließt aus: nichts. Information: 0 Bit.`,
      ],
    ],
    footer: `Informationsgehalt dieser Seite: ein Satz von sechs. Das Badge fasst die anderen fünf zusammen.`,
  },
  sim: {
    pressure: `Schulddruck`,
    pressureAria: `Schulddruck in Prozent`,
    presets: [`Ohne Schuldzuweisung`, `Alltagsbetrieb`, `Wassermelone`, `Hexenjagd`],
    bars: [`Tatsächliche Gesundheit`, `Berichtete Gesundheit`],
    badgeLabel: `Status-Badge`,
    badges: { green: `GRÜN`, yellow: `GELB`, red: `ROT` },
    sprint: `Sprint`,
    running: `● läuft`,
    paused: `❚❚ pausiert`,
    log: {
      honest: `Die Berichte decken sich mit der Realität. Probleme werden behoben, solange sie klein sind.`,
      drifting: `Die Berichte beginnen zu schmeicheln. Kleine Probleme werden nicht gemeldet, und ungemeldete Probleme werden nicht behoben.`,
      watermelon: `Außen grün, innen rot. Das Badge ist gesund. Das Projekt nicht.`,
      collapse: `Die Realität kam trotzdem an. Das tut sie immer, nur später, und größer.`,
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
      product: `Eine saubere Produktform. Ihnen gehört es, du betreibst es. Ihre Roadmap ist Wetter, keine Abhängigkeit, und du behältst das Recht zu gehen.`,
      service: `Eine saubere Serviceform. Es ist deine Software, gebaut, wo du zusehen kannst. Bezahle pro gelieferter Story und halte dir den Ausstieg offen.`,
      thirdThing: `Das dritte Ding. Ihnen gehört es, und sie betreiben es, also zeigen Eigentum, Betrieb und Sichtbarkeit alle von dir weg. Rechne mit Tabellen.`,
      blind: `Deine eigene Software, gebaut, wo du nicht hinsehen kannst. Das ist ein Servicevertrag, dem die Transparenzklausel fehlt. Repariere die Sichtbarkeit, bevor eine Tabelle daraus wächst.`,
    },
  },
};

const ar: ThirdThingContent = {
  title: `الشيء الثالث`,
  description: `لماذا تُنبت مشاريع تقنية المعلومات المتعثّرة جداولَ ظلٍّ ومسرحَ حالةٍ ولغةً لا يمكن أن تكون خاطئة، وكيف يُنتج نموذجُ توريدٍ واحدٌ مكسور كلَّ ذلك.`,
  tags: [`استكشاف تفاعلي`, `مشاريع تقنية المعلومات`],
  opening: [
    `على حدّ علمي، هناك بالضبط طريقتان نزيهتان لشراء البرمجيات من شركةٍ أخرى.`,
    `يمكنك أن تشتري منتَجًا. يحتفظون بشيفرتهم وخارطة طريقهم ومسافتهم منك. وتحصل أنت على واجهاتٍ واضحة، وتوثيق، وحقِّ البحث عن بديل. أما كون وعودهم غامضة فذاك شأنهم وحدهم. أنت اخترتهم لما يستطيعون فعله اليوم، ولا شيء في خطتك يقوم أو يسقط بما قد يفعلونه السنة المقبلة.`,
    `أو تشتري خدمة. يعملون في قائمة مهامك، وعلى بنيتك التحتية، ووفق أولوياتك، وكل ما يبنونه ملكٌ لك. يتقاضون أجرهم عن كل قصةٍ مُسلَّمة. وإن لم يعد الأمر مجديًا، استبدلتهم واحتفظت بالبرمجية. بهذه البساطة.`,
    `لا تفتقر تقنية المعلومات في الشركات إلى الكوارث. لكن نوعًا واحدًا بعينه يبدأ دائمًا بالطريقة نفسها: شخصٌ ما يوقّع عقدًا على <strong>شيءٍ ثالث</strong>. وقد شاهدت هذا الفيلم مراتٍ عدة حتى الآن.`,
  ],
  thirdThing: `طبعًا يبدو الأمر معقولًا على الورق. يحتفظ المورّد بملكيته الفكرية، كشركة منتَجات. لكنه يشغّل أيضًا ما يبنيه، على حساباتك السحابية، كشركة خدمات. تذاكرهم تعيش في Jira خاصّتهم التي لا تستطيع الاطلاع عليها. شيفرتهم صندوقٌ أسود. خوادمهم تُضخّم فاتورتك، ولا يحقّ لك حتى تحديد حجمها. الملكية والتشغيل والرؤية: ثلاثتها تشير الآن إلى جهاتٍ مختلفة، ولا واحدة منها تشير إليك.`,
  symptoms: [
    `ما يلي مزيجٌ من كل الحالات التي شهدتها. يأتي الجدول أولًا. يحتاج أحدهم إلى تتبّع تقدّم المورّد. وتذاكر المورّد غير مرئية. فيظهر جدول Excel يُحدَّث يدويًا، عشرات الأعمدة، بعضها العمود نفسه وقد لبس أسماء مختلفة، وكل صفٍّ ظلٌّ لتذكرةٍ تعيش أصلًا في مكانٍ لا تستطيع رؤيته. من المغري أن تضحك على الجدول، لكن لا تفعل. فالجدول نسيجُ ندبة، وكل جدول ظلٍّ في شركتك يُعلّم موضعًا يئست فيه المنظمة من أداةٍ مشتركة فأنبتت حلًّا التفافيًا مكانها.`,
    `ثم يأتي الاجتماع، ولا تفتح معي هذا الباب. تقدّم المورّد غير مرئيٍّ بين المحطات، فتظهر مكالمة «sync» يومية كي يتسنّى لأحدهم أن يسأل المورّد كيف تسير الأمور. يُدعى إليها العشرات. قلّةٌ يعتذرون. ومعظمهم لا يردّ أصلًا، لأن الاعتذار والقبول كليهما التزام، وأسلم جوابٍ أحيانًا هو لا جواب. يحضر فعلًا نحو اثني عشر شخصًا، كلَّ صباح، لنصف ساعة. الدعوة تريد أن تكون مفيدة، لكنها استطلاعُ حالةٍ في زيٍّ تنكّري. فحين لا يُسمح للأنظمة بالمزامنة، يصير البشر آلية المزامنة، وهذه الآلية بالذات وقودها كشفُ الرواتب. اثنا عشر شخصًا، نصف ساعة، خمسة أيام في الأسبوع، إلى الأبد. وكل ذلك ثمن عدم مشاركة نظام التذاكر.`,
    `أما الصفحات التي ترافق كل هذا فقد تثير حكّةً في وجهك. ينشئ أحدهم صفحة Confluence لموضوعٍ سينتهي به المطاف في Jira على أي حال. بعد أشهرٍ تزدحم الصفحة، وتنظيفها عملٌ إضافي، فيؤرشفها ويستنسخ نسخةً جديدة. لا بأس. غير أن الرابط في دعوة الاجتماع الدوري ما يزال يشير إلى الصفحة القديمة، وسيظل يشير إليها سنوات، فمن ذا الذي يعدّل سلسلة اجتماعاتٍ أصلًا. وليس في الأمر خبث، حقًا، وهذا هو المزعج فيه. كل خطوةٍ كانت تسهيلًا صغيرًا يمكنك الدفاع عنه بمعزلٍ عن غيره.`,
    `والآن انظر إلى الحطام، إنه أشبه بفوضى عضوية. الحقائق لا أثر لها في أي مكان، لا لأن المعلومات أُخفيت، بل لأنها تكاثرت حتى لم يعد أحدٌ يميّز الحاليَّ من البائد. <strong>الحقيقة ببساطةٍ غارقةٌ تحت الركام.</strong>`,
  ],
  dialectIntro: `وفوق كل شيءٍ تستقرّ طريقةٌ في الكلام. «في أقرب وقتٍ ممكن». «حيثما كان ذلك منطقيًا». «بأعلى أولوية». «سيتعيّن علينا دراسة الأمر». أصغِ إلى هذه الجمل كما يصغي المهندس: لا يمكن لأيٍّ منها أن تكون خاطئةً أبدًا. وهذا يبدو مديحًا إلى أن تتمهّل عنده قليلًا. فالجملة التي لا يمكن أن تكون خاطئة لا تحمل معلومة؛ إنها لا تستبعد شيئًا. كدّس ما يكفي منها فيصبح تقرير الحالة متوافقًا مع كل واقعٍ ممكن، وهذا بالضبط ما يحتاجه الجميع منه. عرّف الفيلسوف <a href="${FRANKFURT}" target="_blank" rel="noopener noreferrer">Harry Frankfurt</a> <a href="${ON_BULLSHIT}" target="_blank" rel="noopener noreferrer">الهراء</a> بأنه كلامٌ لا يبالي بالحقيقة. وقد كتب في ذلك رسالةً كاملة. وكان يكفيه أن يقرأ صفحة حالة مشروعٍ واحدة ليوفّر على نفسه العناء.`,
  dialect: [
    `لهذه اللهجة أزمنةُ أفعال، وقد احتجت وقتًا حتى انتبهت إليها. العمل يسكن المستقبل: «سننظر في الأمر الأسبوع المقبل» تصير «نظرنا في الأمر، وسنعالجه الشهر المقبل». النظرُ في الأمر مُخرَجٌ يُنتج نظرًا آخر في الأمر؛ الأفق يتدحرج، والوحدة تتضخّم، فيصير الأسبوع شهرًا. وللتصعيد جنسه الأدبي الخاص، تصعيدٌ لا يسلّم شيئًا سوى واقعة حدوثه، بلا تاريخٍ مرفق ولا أثرٍ مسمّى. وحين تتحوّل شارة الحالة أخيرًا من الأصفر إلى الأحمر، اقرأ الصفحة تحتها: الجمل هي نفسها. يتغيّر اللون ولا تتغيّر اللهجة. فالأحمر ليس إلا أصفر مع تهديدٍ بالعنف.`,
    `ما يجعل محاربة هذه اللهجة شبه مستحيلة أنها ليست الوثيقة كلها ولا شخصًا واحدًا بعينه. صفحات الحالة الحقيقية تحمل جملًا صادقةً محسوبةً بدقة إلى جوار الجمل المتحوّطة، فلا تستطيع الاعتراض على الصفحة، بل على شذراتٍ منها فقط، والاعتراض على الشذرات يبدو تنطّعًا. ثم إن اللهجة جوقةٌ لا صوتًا منفردًا. «الأمر يعتمد». «علينا أن ندرس الأمر». «لا أستطيع أن أجيبك». حين تقول أفواهٌ كافية هذه الأشياء، تكفّ اللهجة عن كونها طبعَ شخصٍ وتصبح اللغةَ الأمَّ للغرفة، الشيء الذي يتشرّبه القادمون الجدد بوصفه جزءًا من التأهيل.`,
    `وتُكمل الأقدمية الحيلة، لا لأن المخضرم يخادع. فحين يقول من أمضى عقودًا في النظام «الأمر يعتمد»، فالأمر غالبًا يعتمد فعلًا. لقد شاهد إجاباتٍ واثقة تنهار من قبل. المشكلة أن الغرفة لا تستطيع التمييز بين الحذر المكتسَب والمراوغة، وكلاهما يخرج بالكلمات الثلاث نفسها. فيستعير كلُّ تحوّطٍ فارغ في الجوقة مصداقيةَ المخضرم، ويُسمَع الغموض، إذا قيل من مقامٍ عالٍ بما يكفي، حكمةً.`,
  ],
  composite: `إن كان هذا يشبه مشروعك: أعدك أنني لم أكن أصف مشروعك. وهذا أشدّ ما يمكنني قوله إدانةً. إنه يشبه المشاريع كلَّها.`,
  why: [
    `لماذا ينمو كل هذا؟ إليك مشهدًا واحدًا، مركّبًا كسابقيه. يُسلَّم مورّدٌ سؤالًا لا يجيب عنه إلا فريق بنيةٍ تحتية. تحليلُ تكلفة، خطةُ سعة، اختر ما شئت. والسبب أن خوادمه تقبع شبه خاملةٍ على فاتورةٍ يدفعها العميل. المورّد في هذا المشهد غرفةٌ من العلماء. بارعون تمامًا فيما استُقدموا لأجله. ليسوا أهل بنيةٍ تحتية. كلُّ من في الغرفة يعرف الأمرين معًا، بمن فيهم المدير، الذي يقول الآن الجملة التي يقولها المديرون في هذا الموقف دائمًا. وتأتي في ثلاثة أجزاء: هذه مسؤوليتكم، ولا يعنيني كيف، وإن لم يحدث الأمر فالتكاليف عليكم.`,
    `من المغري أن تسمع تلك الجملة إدارةً سيئة، لكنها وليدة اليأس. لا يستطيع المدير إصلاح الشيفرة، لأنها صندوقٌ أسود. ولا تولّي التشغيل، لأن العقد يقول إن المورّد هو من يشغّل. ولا حتى مشاهدة العمل وهو يجري، لأن التذاكر تعيش في Jira لا يستطيع أحدٌ في الغرفة فتحها. كلُّ رافعةٍ حقيقية جرى التنازل عنها بالتوقيع قبل سنوات. وما بقي هو إسناد المسؤولية والتهديد بنقل التكاليف. <strong>اللوم هو الشكل الذي تتخذه الإدارة بعد أن تُنتزَع منها بالعقود كلُّ رافعةٍ حقيقية.</strong>`,
    `لاحظ ما يساويه التهديد فعلًا. إسنادُ المسؤولية إلى من لا يملك القدرة مجرّدُ جدولةٍ للّوم مسبقًا. فالطرف الذي يحدّد حجم الخوادم لا يدفع ثمنها، والخمول هو النتيجة. وحين يكون المال قد رُصد قبل العمل بسنوات، يصير التهديد بالتكاليف مسرحًا فوق مسرح: فذاك المال أُنفق أصلًا. الجميع في الغرفة يعرفون هذا كله. وتُقال الجملة رغم ذلك. فقولها هو النقلة الوحيدة المتبقية على الرقعة.`,
    `وما نتيجة ذلك الضغط؟ ليست الجواب. فهم عاجزون عن إنتاجه. ما يخرج بدلًا منه هو لغة: «سننظر في الأمر الأسبوع المقبل». اللوم يتدفق نزولًا، والتحوّطات تتدفق صعودًا، ويغادر الطرفان وبيد كلٍّ منهما أثرٌ ورقي يثبت أنه أدّى دوره. لومٌ يدخل، هراءٌ يخرج. وليست اللهجة إلا طريقة الناس في تدبّر أمورهم داخل نموذجٍ مكسور.`,
  ],
  build: `غريزة المهندس عند هذه النقطة أن يبني شيئًا. شعرتُ بها بنفسي، ورأيت آخرين يشعرون بها: أمام قائمة مهامّ مورّدٍ غير مرئية، يميل المرء بمحض الغريزة إلى رسم أداةٍ تُزامن التذاكر بين نظامَي Jira. إنها فكرةٌ غبية، ويلزمك نحو أسبوعٍ من التفكير النزيه لترى السبب. الحدّ الفاصل لا يختفي. سيكون على أحدهم أن يقرّر، إلى الأبد، أيُّ التذاكر تعبره. والمزامنة نفسها برمجيةٌ إضافية تطالب بالصيانة. وبعد كل ذلك الجهد، تكون قد اشتريت رؤيةً كاملة لتذاكر ما زلت عاجزًا عن التصرف فيها. سترى كل شيء ولن تغيّر شيئًا. لا يمكنك أن تشقّ بالأدوات طريقك للخروج من مشكلةٍ شكلُها عقد؛ وكل نسخةٍ جديدة من الحقيقة، مهما بلغت براعتها، تنضمّ فحسب إلى الحشد الذي يغلبها بالعدد. لا شيء في مشروعٍ «لا يضرّ». <strong>كل ما لا يساعد فعليًا يعيق فعليًا.</strong>`,
  fix: [
    `يسكن الإصلاح حيث يسكن العطب، في النموذج. إن كان المورّد يؤدي وظيفتين، فافصلهما إلى علاقتين. الأشخاص أنفسهم إن شئت؛ الأشكال مختلفة. يصبح النصف الأول شركةَ منتَجٍ حقيقية. يحتفظون بشيفرتهم وخارطة طريقهم، ينشرون التحديثات كل ربع سنةٍ أو كل سنة، يتتبّعون عيوبهم بأنفسهم، ويدينون لك بواجهاتٍ واضحة بدلًا من الشفافية. تثبّت صندوقهم الأسود على بنيتك التحتية، وتشغّله أنت، وتبني وصلاتك الخاصة حوله، وتحتفظ بحق الرحيل. ويصبح النصف الآخر فريقَ خدمةٍ حقيقيًا. يعملون في Jira خاصّتك، وعلى أنظمتك، ونيابةً عنك. ما يبنونه ملكٌ لك، ويتقاضون عن كل قصةٍ مُسلَّمة، وهم قابلون للاستبدال بحكم البناء نفسه. تخسر شيئًا في هذا الفصل: نصف المنتَج لن يعطيك أبدًا سوى خارطة طريق، لا موعدًا. لكن انظر إلى ما تستعيده. نصف الخدمة يعمل الآن حيث تستطيع رؤيته، فتعرف بالضبط متى يبلغ شيءٌ ما بيئة الإنتاج، والمفتاح الذي يشغّل ميزةً في عالمك صار أخيرًا في يدك.`,
    `نصفا هذا الحل موجودان. تنشر AWS وMicrosoft خرائط طريقٍ لمئات الآلاف من العملاء، وتلك الخرائط لا تلتزم تقريبًا بأي شيء. ولا يغرق أحد، لأن معمارية العميل لا تعتمد قط على تلك الوعود؛ يبقى الغموض على الضفة البعيدة من واجهة، حيث هو مجرّد نشرة أحوال جوية. انقل الغموض نفسه إلى داخل قائمة مهامك، فإذا بموعد إطلاقك يعتمد فجأةً على «سننظر في الأمر». هذا هو القانون المختبئ تحت هذا المقال كله: <strong>تحمُّل الهراء دالّةٌ في شدّة الاقتران.</strong> وهو يشير أيضًا إلى الإصلاح الحقيقي. مطالبةُ أناسٍ واقعين تحت الضغط بجملٍ أشجع لا تُصلح شيئًا. أنت تعمل على إصلاح النموذج، حتى تعود الجمل الصريحة في المتناول من جديد.`,
  ],
  audit: `فراجع مورّديك إذن. أربعة أسئلة: من يملك الشيفرة، من يشغّلها، من يدفع الفاتورة، من يستطيع رؤية العمل. إن لم تصطفّ الإجابات في أحد الشكلين النزيهين، فلا حاجة بك إلى انتظار الكارثة؛ امشِ في أرض المشروع وستجدها تنمو بالفعل. جدولٌ يكرّر نفسه. مكالمةٌ يومية يتجاهلها الناس أو يقبلونها على مضض. صفحةٌ لا يجدها أحد. غرفةٌ مليئة بأناسٍ طيبين يتكلمون لغةً لا يمكن فيها لشيءٍ أن يكون خاطئًا.`,
  closing: [
    `لن أدّعي أن شيئًا من هذا سهل الإصلاح في مشروعٍ قائم. فعقودٌ كالشيء الثالث تُوقَّع لسنوات، ورؤية المشكلة بوضوحٍ لا تضمن لك مقامًا تقولها منه بصوتٍ عال. لكن الديمومة سلاحٌ ذو حدّين. النموذج المكسور يدوم لأنه يُعمّر أطول ممن يحاربونه. والنموذج المُصلَح يدوم بالطريقة نفسها تمامًا. أصلح الشكل مرةً واحدة، يبقَ الإصلاح يعمل طويلًا بعد أن يغادر كلُّ المعنيين إلى مشاريع أخرى. يكفي أن تُسمَع مرةً واحدة. وفرص أن تُسمَع لا تنقطع: كل تجديد، وكل تمديد، وكل أزمةٍ يُطلق فيها تهديدٌ لأن لا شيء آخر بقي.`,
    `وحين تأتي الفرصة، تذكّر: الفصل لا يكلّف أحدًا وظيفته. الأشخاص أنفسهم، وقد فُرزوا في أشكالٍ يُقيَّمون فيها على ما يجيدونه فعلًا. العلماء يعودون علماء. والمدير ينال روافع حقيقيةً بدلًا من اللوم. لم يعد على أحدٍ أن يصون الجدول أو يجلس في الاجتماع اليومي أو يجيب بالتحوّطات. تلك أرجى حقيقةٍ في الأمر كله. لا أحد في هذه الغرف يريد الهراء. لا المخضرم، ولا المدير، ولا المورّد. فاطرح الأسئلة الأربعة، بصوتٍ مسموع، حتى لو كنت أحدثَ من في الغرفة؛ فالسؤال ليس اتهامًا. يعود الناس إلى الجمل الصريحة لحظةَ تصبح في المتناول من جديد. <strong>ليس الناس هم من يحتاج إلى إصلاح، بل النموذج.</strong>`,
  ],
  statusPage: {
    heading: `مشروع Aurora، تقرير الحالة الأسبوعي`,
    badge: `أصفر`,
    hint: `انقر على جملةٍ لترى ما تستبعده.`,
    sentences: [
      [
        `يبقى الهدف العام هو تحقيق استقرار الإصدار في أقرب وقتٍ ممكن.`,
        `تلتزم بـ: لا موعد، ولا مسؤول، ولا تعريفٍ للاستقرار. تستبعد: لا شيء. المعلومة: 0 بِت.`,
      ],
      [
        `يعمل الفريق على العيوب المفتوحة بأعلى أولوية.`,
        `كل فريقٍ في كل مكانٍ يعمل على شيءٍ ما بأعلى أولوية. تستبعد: لا شيء. المعلومة: 0 بِت.`,
      ],
      [
        `أكّد المورّد أن المشكلة صُعِّدت داخليًا.`,
        `المُخرَج هو التأكيد نفسه. لا موعد، ولا أثر، ولا مسؤول. تستبعد: لا شيء. المعلومة: 0 بِت.`,
      ],
      [
        `ستُمنح المكاسب السريعة الأولوية حيثما كان ذلك منطقيًا.`,
        `لم يمنح أحدٌ قط المكاسبَ السريعة الأولوية حيث لا يكون ذلك منطقيًا. تستبعد: لا شيء. المعلومة: 0 بِت.`,
      ],
      [
        `اكتمل الترحيل يوم الثلاثاء: أُنجزت 12 من أصل 14 خدمة، والخدمتان الأخيرتان تلحقان في السبرنت المقبل.`,
        `موعدٌ وعددٌ والتزامٌ يمكن أن يفشل. هذه الجملة يمكن أن تكون خاطئة، ولذلك فهي تخبرك شيئًا. إنها المعلومة الوحيدة في الصفحة.`,
      ],
      [
        `من المخطط عقد اجتماع مواءمةٍ إضافي لتوضيح الخطوات التالية.`,
        `اجتماعٌ عن اجتماع. تستبعد: لا شيء. المعلومة: 0 بِت.`,
      ],
    ],
    footer: `المحتوى المعلوماتي لهذه الصفحة: جملةٌ واحدة من ستّ. أما الشارة فتلخّص الجمل الخمس الأخرى.`,
  },
  sim: {
    pressure: `ضغط اللوم`,
    pressureAria: `نسبة ضغط اللوم`,
    presets: [`بلا لوم`, `العمل كالمعتاد`, `بطيخة`, `مطاردة ساحرات`],
    bars: [`الصحة الفعلية`, `الصحة المُبلَّغة`],
    badgeLabel: `شارة الحالة`,
    badges: { green: `أخضر`, yellow: `أصفر`, red: `أحمر` },
    sprint: `سبرنت`,
    running: `● يعمل`,
    paused: `❚❚ متوقّف`,
    log: {
      honest: `التقارير تطابق الواقع. والمشكلات تُصلَح وهي صغيرة.`,
      drifting: `بدأت التقارير تجامل. المشكلات الصغيرة لا يُبلَّغ عنها، والمشكلات التي لا يُبلَّغ عنها لا تُصلَح.`,
      watermelon: `أخضر من الخارج، أحمر من الداخل. الشارة سليمة، أما المشروع فلا.`,
      collapse: `وصل الواقع رغم كل شيء. إنه يصل دائمًا، لكن متأخرًا وأكبر.`,
    },
  },
  diagnostic: {
    heading: `الأسئلة الأربعة مطبَّقةً على مورّدك`,
    prompt: `أربعة أسئلة، حكمٌ واحد.`,
    countdown: [`بقي سؤالٌ واحد.`, `بقي سؤالان.`, `بقيت ثلاثة أسئلة.`],
    questions: [
      { q: `من يملك الشيفرة؟`, options: [`نحن`, `المورّد`] },
      { q: `من يشغّلها؟`, options: [`نحن`, `المورّد`] },
      { q: `من يدفع الفاتورة؟`, options: [`نحن`, `المورّد`] },
      { q: `من يستطيع رؤية العمل؟`, options: [`نستطيع`, `لا نستطيع`] },
    ],
    verdictLabel: `الحكم`,
    verdicts: {
      product: `شكل منتَجٍ نظيف. هم يملكونه وأنت تشغّله. خارطة طريقهم أحوالُ طقسٍ لا تبعية، وتحتفظ أنت بحق الرحيل.`,
      service: `شكل خدمةٍ نظيف. البرمجية برمجيتك، تُبنى حيث تستطيع رؤيتها. ادفع مقابلَ القصص المُسلَّمة وأبقِ باب الخروج مفتوحًا.`,
      thirdThing: `الشيء الثالث. هم يملكونه وهم يشغّلونه، فالملكية والتشغيل والرؤية كلها تشير بعيدًا عنك. توقّع الجداول.`,
      blind: `برمجيتك أنت، تُبنى حيث لا تستطيع رؤيتها. هذا عقد خدمةٍ ينقصه بند الشفافية. أصلح الرؤية قبل أن يُنبت الأمر جدولًا.`,
    },
  },
};

export const TT_CONTENT: Record<Locale, ThirdThingContent> = { en, de, ar };

export function getThirdThingContent(lang: string): ThirdThingContent {
  return TT_CONTENT[isLocale(lang) ? lang : DEFAULT_LOCALE];
}
