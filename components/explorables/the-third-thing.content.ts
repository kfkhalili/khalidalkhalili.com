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
    `There are exactly two honest ways to buy software from another company.`,
    `You can buy a product. They keep their code, their roadmap, and their distance. You get clear interfaces, documentation, and the right to look elsewhere. Whether their promises are vague is their business, because you chose them for what they can do right now, and nothing in your plan stands or falls with their promises.`,
    `Or you can buy a service. They work in your backlog, on your infrastructure, under your priorities, and everything they build is yours. They earn their keep per delivered story, and you can replace them without losing the software, because the software was never theirs.`,
    `Corporate IT has no shortage of disasters. But one specific kind always starts the same way: somebody signs a contract for a <strong>third thing</strong>.`,
  ],
  thirdThing: `The third thing looks reasonable on paper. The vendor keeps their intellectual property, like a product company. But they also operate what they build, on your cloud accounts, like a service company. Their tickets live in their Jira, which you cannot see. Their code is a black box, which you cannot open. Their servers are on your bill, which you cannot size. Ownership, operation, and visibility now point in three different directions, and every one of them points away from you.`,
  symptoms: [
    `What grows in those gaps is the same everywhere. I have watched it grow at several companies over many years, and the scenes that follow are a composite of all of them. First comes the spreadsheet. Somebody needs to track the vendor's progress, and the vendor's tickets are invisible, so a hand-maintained Excel sheet appears: dozens of columns, several of them the same column, each row a shadow of a ticket that already lives somewhere you cannot see. It is tempting to laugh at the sheet. Don't. The sheet is scar tissue. Every shadow spreadsheet in your company marks the exact spot where the organization gave up on a shared tool and grew a workaround instead.`,
    `Next comes the meeting. The vendor's progress is invisible between milestones, so a daily call appears, so that somebody can ask the vendor about the status of things. Dozens of people are invited. A few decline. Most never respond at all, because declining and accepting are both commitments, and the safest answer to any question in a project like this is no answer. A dozen actually attend, every morning, for half an hour. The invite carries some friendly name with sync in it. It is a status poll in costume. When systems are not allowed to sync, humans become the sync mechanism, and this one runs on payroll: a dozen people, times half an hour, times five days, forever. That is the standing price of not sharing a ticket system.`,
    `Then come the pages. A Confluence page appears for a topic that will end up tracked in Jira anyway. Months later a second page appears, because the first got cluttered and cleaning it up is work, so somebody archives the old page and clones a fresh copy. The link in the recurring meeting invite still points at the original, and it will point there for years, because nobody ever edits a meeting series. None of this is malice. Each step is a small convenience, individually defensible.`,
    `But look at the wreckage. Nothing was hidden, and yet nobody can find the current truth anymore. Information has been multiplied until nobody knows which copy to trust. <strong>The truth does not get hidden. It gets outnumbered.</strong>`,
  ],
  dialectIntro: `And over everything settles a way of talking. "As soon as possible." "Where it makes sense." "With highest priority." "We will have to investigate." Listen to these sentences the way an engineer listens: none of them can ever be wrong. A sentence that cannot be wrong carries no information. It rules nothing out. Stack enough of them and a status report becomes compatible with every possible reality, which is exactly what everyone needs it to be. The philosopher <a href="${FRANKFURT}" target="_blank" rel="noopener noreferrer">Harry Frankfurt</a> defined <a href="${ON_BULLSHIT}" target="_blank" rel="noopener noreferrer">bullshit</a> as speech that is indifferent to truth. He could have saved himself the monograph and read a project status page.`,
  dialect: [
    `The dialect has verb tenses. Work lives in the future: "we will look into it next week" matures into "we looked into it, and we will tackle it next month." Looking-into-it is a deliverable that produces another looking-into-it; the horizon rolls and the unit inflates, week becoming month. Escalation has its own genre: the escalation that delivers nothing but the fact of itself, no date attached, no impact named. And when a status badge finally turns from yellow to red, read the page beneath it: the sentences are the same. The color changes, the dialect does not. Red is just yellow with a threat of violence.`,
    `What makes the dialect nearly impossible to fight is that it is neither the whole document nor any single person. Real status pages carry honest, well-calibrated sentences right next to the hedged ones, so you cannot object to the page, only to bits and pieces, and objecting to bits and pieces sounds like pedantry. And the dialect is a chorus, not a soloist. "It depends." "We have to investigate." "I cannot tell you." When enough mouths say these things, the dialect stops being a personality and becomes the room's native language, the thing newcomers absorb as onboarding. Seniority completes the trick, and not because the veteran is bluffing. When a veteran of decades says "it depends", it often does depend; they have watched confident answers collapse in this exact system. But the room cannot tell earned caution from evasion, because both deliver the same three words. So every empty hedge in the chorus borrows the veteran's credibility, and vagueness, spoken from high enough, gets perceived as wisdom.`,
  ],
  composite: `If this sounds like your project, I have not been describing your project, and that is the most damning thing I can say: it sounds like all of them.`,
  why: [
    `Why does it grow? Watch one scene, composited like the others. A vendor gets handed a question only an infrastructure team could answer, a cost analysis, a capacity plan, pick one, because their servers sit underutilized on a bill the customer pays. The vendor is a room of scientists who write specialized software. They are brilliant at exactly what they were hired for, they are not infrastructure people, and everyone present knows both things. A manager says the sentence that managers in this position always say. It has the same three parts every time: this is your responsibility, I do not care how, and if it does not happen, the costs land on you.`,
    `It is tempting to hear that sentence as bad management. Hear it instead as an inventory. The manager cannot fix the code, because it is a black box. Cannot take over operations, because the contract says the vendor operates. Cannot even watch the work happen, because the tickets live in a Jira nobody in the room can open. Every real lever was signed away years ago. What remains is assigning responsibility and threatening cost transfer. <strong>Blame is what management looks like after every real lever has been contracted away.</strong>`,
    `Notice what the threat is actually worth. Assigning responsibility to someone without the capability just schedules the blame in advance. The party who sizes the servers does not pay for the servers, so underutilization is the equilibrium. And when the money is committed long before the work, the threat of costs is theater on top of theater: it is already spent. Everyone in the room knows all of this. The sentence gets said anyway, because saying it is the only move left on the board.`,
    `Now close the loop. What does that pressure extract from the vendor? Not the answer; they cannot produce one. It extracts language: "we will look into it next week." Blame flows down, hedges flow up, and both sides leave with a paper trail proving they did their part. Blame in, bullshit out. The dialect is how people breathe inside a broken model.`,
  ],
  build: `The engineer's instinct at this point is to build something. I have felt it myself, and I have watched others feel it: faced with an invisible vendor backlog, somebody always sketches a tool to sync tickets between the two Jiras. It is an honest instinct and a stupid idea, and it does not survive a week of honest thinking. The boundary does not disappear; somebody must now decide, forever, which tickets cross it. The sync itself is new software that needs maintenance. And at the end of all that work, it buys a perfect view of tickets you still cannot act on: you would see everything and change nothing. You cannot tool your way out of a contract-shaped problem, and every new copy of the truth, however clever, joins the crowd that is outnumbering it. Nothing in a project "can't hurt." <strong>Everything that does not actively help, actively hinders.</strong>`,
  fix: [
    `The fix lives where the break lives: in the model. If a vendor is doing two jobs, split them into two relationships, even if the same people stay. One half becomes a true product company. They keep their code and their roadmap, publish updates quarterly or yearly, track their own issues, and owe you clear interfaces instead of transparency. You install their black box on your infrastructure, you operate it, you build your own shims around it, and you keep the right to leave. The other half becomes a true service team. They work in your Jira, on your systems, on your behalf. What they build is yours, they are paid per delivered story, and they are replaceable by construction. You lose something in the split: the product half will only ever give you a roadmap, not a date. But look at what you get back. The service half now works where you can see them, so you know exactly when something reaches production, and the switch that turns a feature on in your world is finally in your hand.`,
    `Both halves of this exist and work at scale. The biggest product companies in the world publish roadmaps to hundreds of thousands of customers, and those roadmaps are never fully committal. Nobody drowns, because nobody's architecture depends on those promises; the vagueness stays on the far side of an interface, where it is just weather. But move it inside your own backlog and your release date now depends on a "we will look into it." That is the general law hiding under this whole essay: <strong>bullshit tolerance is a function of coupling.</strong> And it points at the real fix. Demanding braver sentences from people under pressure repairs nothing. You repair the model, until plain sentences are affordable again.`,
  ],
  audit: `So audit your vendors with four questions. Who owns the code? Who operates it? Who pays the bill? Who can see the work? If the answers do not line up into one of the two honest shapes, you do not need to wait for the disaster. Walk the project floor and you will find it already growing: a spreadsheet that repeats itself, a daily call nobody accepts, a page nobody can find, and a room full of decent people speaking a language in which nothing can be wrong.`,
  closing: [
    `I will not pretend the fix is easy to apply mid-flight. Contracts like the third thing get signed for years, and seeing the problem clearly is no guarantee of the standing to say so. But durability cuts both ways. A broken model persists because it outlasts the people who fight it; a repaired model persists exactly the same way. Fix the shape once, and the fix keeps working long after everyone who made it has changed projects. Being heard once is enough, and the chances to be heard keep coming: every renewal, every extension, every crisis in which a threat gets made because nothing else is left.`,
    `And when the chance comes, remember that the split costs nobody their job. It is the same people, sorted into shapes where they are measured on what they are actually good at. The scientists get to be scientists. The manager gets real levers instead of blame. Nobody maintains the spreadsheet, nobody schedules the daily, nobody answers in hedges. That is the most hopeful fact hiding under this whole essay: nobody in these rooms wants the bullshit. Not the veteran, not the manager, not the vendor. So ask the four questions, out loud, even if you are the newest person in the room. A question is not an accusation. People return to plain sentences the moment plain ones become affordable again. <strong>It's not the people you need to fix, it's the model.</strong>`,
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
    `Es gibt genau zwei ehrliche Arten, Software von einer anderen Firma zu kaufen.`,
    `Du kannst ein Produkt kaufen. Sie behalten ihren Code, ihre Roadmap und ihre Distanz. Du bekommst klare Schnittstellen, Dokumentation und das Recht, dich anderswo umzusehen. Ob ihre Versprechen vage sind, ist ihre Sache, denn du hast sie für das gewählt, was sie heute können, und nichts in deinem Plan steht oder fällt mit ihren Versprechen.`,
    `Oder du kaufst eine Dienstleistung. Sie arbeiten in deinem Backlog, auf deiner Infrastruktur, nach deinen Prioritäten, und alles, was sie bauen, gehört dir. Sie verdienen ihr Geld pro gelieferter Story, und du kannst sie ersetzen, ohne die Software zu verlieren, denn die Software war nie ihre.`,
    `An Katastrophen herrscht in der Unternehmens-IT kein Mangel. Aber eine bestimmte Sorte beginnt immer gleich: Jemand unterschreibt einen Vertrag für ein <strong>drittes Ding</strong>.`,
  ],
  thirdThing: `Das dritte Ding sieht auf dem Papier vernünftig aus. Der Lieferant behält sein geistiges Eigentum, wie eine Produktfirma. Aber er betreibt auch, was er baut, auf deinen Cloud-Accounts, wie eine Dienstleistungsfirma. Seine Tickets leben in seinem Jira, in das du nicht hineinschauen kannst. Sein Code ist eine Blackbox, die du nicht öffnen kannst. Seine Server stehen auf deiner Rechnung, und ihre Größe bestimmst nicht du. Eigentum, Betrieb und Sichtbarkeit zeigen jetzt in drei verschiedene Richtungen, und jede davon zeigt von dir weg.`,
  symptoms: [
    `Was in diesen Lücken wächst, ist überall dasselbe. Ich habe es über viele Jahre in mehreren Firmen wachsen sehen, und die Szenen, die jetzt folgen, sind aus allen zusammengesetzt. Zuerst kommt die Tabelle. Jemand muss den Fortschritt des Lieferanten verfolgen, und dessen Tickets sind unsichtbar, also erscheint eine von Hand gepflegte Excel-Tabelle: Dutzende Spalten, mehrere davon dieselbe Spalte, jede Zeile der Schatten eines Tickets, das längst irgendwo lebt, wo du nicht hinsehen kannst. Es ist verlockend, über die Tabelle zu lachen. Tu es nicht. Die Tabelle ist Narbengewebe. Jede Schatten-Tabelle in deiner Firma markiert genau die Stelle, an der die Organisation ein gemeinsames Werkzeug aufgegeben und stattdessen einen Workaround gezüchtet hat.`,
    `Als Nächstes kommt das Meeting. Zwischen den Meilensteinen ist der Fortschritt des Lieferanten unsichtbar, also erscheint ein täglicher Call, damit jemand den Lieferanten nach dem Stand der Dinge fragen kann. Dutzende Leute werden eingeladen. Ein paar sagen ab. Die meisten antworten gar nicht, denn Absagen und Zusagen sind beides Festlegungen, und die sicherste Antwort auf jede Frage in so einem Projekt ist keine Antwort. Ein Dutzend erscheint tatsächlich, jeden Morgen, für eine halbe Stunde. Die Einladung trägt irgendeinen freundlichen Namen mit Sync darin. In Wahrheit ist es eine verkleidete Statusabfrage. Wenn Systeme sich nicht synchronisieren dürfen, werden Menschen zum Sync-Mechanismus, und dieser läuft über die Gehaltsliste: ein Dutzend Leute, mal eine halbe Stunde, mal fünf Tage, für immer. Das ist der Dauerpreis dafür, kein gemeinsames Ticketsystem zu haben.`,
    `Dann kommen die Seiten. Eine Confluence-Seite erscheint für ein Thema, das am Ende sowieso in Jira landet. Monate später erscheint eine zweite Seite, weil die erste unübersichtlich geworden ist und Aufräumen Arbeit wäre, also archiviert jemand die alte Seite und klont eine frische Kopie. Der Link in der Serieneinladung zeigt weiter auf das Original, und er wird noch Jahre dorthin zeigen, denn niemand bearbeitet je eine Meeting-Serie. Nichts davon ist Böswilligkeit. Jeder Schritt ist eine kleine Bequemlichkeit, für sich genommen vertretbar.`,
    `Aber sieh dir die Trümmer an. Nichts wurde versteckt, und trotzdem findet niemand mehr die aktuelle Wahrheit. Information wurde vervielfältigt, bis niemand mehr weiß, welcher Kopie er trauen soll. <strong>Die Wahrheit wird nicht versteckt. Sie gerät in die Unterzahl.</strong>`,
  ],
  dialectIntro: `Und über allem legt sich eine Art zu reden. „So bald wie möglich." „Wo es sinnvoll ist." „Mit höchster Priorität." „Das müssen wir erst untersuchen." Hör diesen Sätzen zu, wie ein Ingenieur zuhört: Keiner von ihnen kann jemals falsch sein. Ein Satz, der nicht falsch sein kann, trägt keine Information. Er schließt nichts aus. Staple genug davon aufeinander, und ein Statusbericht wird mit jeder möglichen Realität vereinbar, und genau das brauchen alle von ihm. Der Philosoph <a href="${FRANKFURT}" target="_blank" rel="noopener noreferrer">Harry Frankfurt</a> definierte <a href="${ON_BULLSHIT}" target="_blank" rel="noopener noreferrer">Bullshit</a> als Rede, der die Wahrheit gleichgültig ist. Er hätte sich die Monografie sparen und eine Projekt-Statusseite lesen können.`,
  dialect: [
    `Der Dialekt hat Zeitformen. Arbeit lebt im Futur: „Wir schauen uns das nächste Woche an" reift zu „Wir haben es uns angeschaut, und wir gehen es nächsten Monat an". Das Sich-Anschauen ist ein Liefergegenstand, der ein weiteres Sich-Anschauen hervorbringt; der Horizont rollt weiter, und die Einheit bläht sich auf, aus der Woche wird ein Monat. Die Eskalation hat ihr eigenes Genre: die Eskalation, die nichts liefert außer der Tatsache ihrer selbst, kein Datum dran, keine Auswirkung benannt. Und wenn ein Status-Badge endlich von Gelb auf Rot springt, lies die Seite darunter: Die Sätze sind dieselben. Die Farbe wechselt, der Dialekt nicht. Rot ist nur Gelb mit Gewaltandrohung.`,
    `Was den Dialekt fast unangreifbar macht: Er ist weder das ganze Dokument noch eine einzelne Person. Echte Statusseiten tragen ehrliche, gut kalibrierte Sätze direkt neben den ausweichenden, also kannst du nicht der Seite widersprechen, nur einzelnen Stellen, und einzelnen Stellen zu widersprechen klingt nach Pedanterie. Und der Dialekt ist ein Chor, kein Solist. „Kommt darauf an." „Das müssen wir untersuchen." „Das kann ich dir nicht sagen." Wenn genug Münder diese Dinge sagen, hört der Dialekt auf, eine Persönlichkeit zu sein, und wird zur Muttersprache des Raums, zu dem, was Neue als Onboarding aufsaugen. Seniorität vollendet den Trick, und zwar nicht, weil der Veteran blufft. Wenn ein Veteran mit Jahrzehnten Erfahrung „kommt darauf an" sagt, kommt es oft wirklich darauf an; er hat in genau diesem System selbstbewusste Antworten zusammenbrechen sehen. Aber der Raum kann verdiente Vorsicht nicht von Ausweichen unterscheiden, denn beide liefern dieselben drei Wörter. Also leiht sich jede leere Floskel im Chor die Glaubwürdigkeit des Veteranen, und Vagheit, von weit genug oben gesprochen, wird als Weisheit wahrgenommen.`,
  ],
  composite: `Falls das nach deinem Projekt klingt: Ich habe nicht dein Projekt beschrieben, und genau das ist das Vernichtendste daran. Es klingt nach allen.`,
  why: [
    `Warum wächst das alles? Sieh dir eine Szene an, zusammengesetzt wie die anderen. Ein Lieferant bekommt eine Frage vorgesetzt, die nur ein Infrastrukturteam beantworten könnte, eine Kostenanalyse, einen Kapazitätsplan, such dir eine aus, weil seine Server unterausgelastet auf einer Rechnung stehen, die der Kunde bezahlt. Der Lieferant ist ein Raum voller Wissenschaftler, die Spezialsoftware schreiben. Sie sind brillant in genau dem, wofür sie engagiert wurden, sie sind keine Infrastrukturleute, und alle Anwesenden wissen beides. Ein Manager sagt den Satz, den Manager in dieser Lage immer sagen. Er hat jedes Mal dieselben drei Teile: Das ist eure Verantwortung, wie ist mir egal, und wenn es nicht passiert, landen die Kosten bei euch.`,
    `Es ist verlockend, diesen Satz als schlechtes Management zu hören. Hör ihn stattdessen als Bestandsaufnahme. Der Manager kann den Code nicht reparieren, denn er ist eine Blackbox. Er kann den Betrieb nicht übernehmen, denn der Vertrag sagt, der Lieferant betreibt. Er kann der Arbeit nicht einmal zusehen, denn die Tickets leben in einem Jira, das niemand im Raum öffnen kann. Jeder echte Hebel wurde vor Jahren per Unterschrift abgegeben. Was bleibt, ist Verantwortung zuweisen und mit Kostenübertragung drohen. <strong>Schuldzuweisung ist das, was von Management übrig bleibt, wenn jeder echte Hebel wegverhandelt wurde.</strong>`,
    `Beachte, was die Drohung tatsächlich wert ist. Verantwortung jemandem zuzuweisen, dem die Fähigkeit fehlt, terminiert nur die Schuldzuweisung im Voraus. Die Partei, die die Server dimensioniert, bezahlt die Server nicht, also ist die Unterauslastung das Gleichgewicht. Und wenn das Geld lange vor der Arbeit gebunden ist, ist die Kostendrohung Theater auf Theater: Es ist längst ausgegeben. Jeder im Raum weiß das alles. Der Satz wird trotzdem gesagt, denn ihn zu sagen ist der einzige Zug, der auf dem Brett noch übrig ist.`,
    `Jetzt schließ den Kreis. Was presst dieser Druck aus dem Lieferanten heraus? Nicht die Antwort; die können sie nicht liefern. Er presst Sprache heraus: „Wir schauen uns das nächste Woche an." Schuld fließt nach unten, Floskeln fließen nach oben, und beide Seiten gehen mit einer Papierspur nach Hause, die beweist, dass sie ihren Teil getan haben. Schuld rein, Bullshit raus. Der Dialekt ist, wie Menschen in einem kaputten Modell atmen.`,
  ],
  build: `Der Instinkt des Ingenieurs an dieser Stelle ist, etwas zu bauen. Ich habe ihn selbst gespürt, und ich habe ihn bei anderen gesehen: Vor einem unsichtbaren Lieferanten-Backlog skizziert irgendwann immer jemand ein Werkzeug, das Tickets zwischen den beiden Jiras synchronisiert. Es ist ein ehrlicher Instinkt und eine dumme Idee, und sie überlebt keine Woche ehrlichen Nachdenkens. Die Grenze verschwindet nicht; jemand muss jetzt für immer entscheiden, welche Tickets sie überqueren. Der Sync selbst ist neue Software, die gewartet werden will. Und am Ende all dieser Arbeit hast du dir einen perfekten Blick auf Tickets erkauft, auf die du weiterhin nicht einwirken kannst: Du würdest alles sehen und nichts ändern. Aus einem Problem, das die Form eines Vertrags hat, kannst du dich nicht herausbauen, und jede neue Kopie der Wahrheit, so clever sie ist, reiht sich in die Menge ein, die sie in die Unterzahl bringt. Nichts in einem Projekt „kann nicht schaden". <strong>Alles, was nicht aktiv hilft, behindert aktiv.</strong>`,
  fix: [
    `Die Reparatur wohnt dort, wo der Bruch wohnt: im Modell. Wenn ein Lieferant zwei Jobs macht, teile sie in zwei Beziehungen, selbst wenn dieselben Leute bleiben. Die eine Hälfte wird eine echte Produktfirma. Sie behält ihren Code und ihre Roadmap, veröffentlicht Updates quartalsweise oder jährlich, verfolgt ihre eigenen Issues und schuldet dir klare Schnittstellen statt Transparenz. Du installierst ihre Blackbox auf deiner Infrastruktur, du betreibst sie, du baust deine eigenen Adapter darum, und du behältst das Recht zu gehen. Die andere Hälfte wird ein echtes Serviceteam. Sie arbeiten in deinem Jira, auf deinen Systemen, in deinem Auftrag. Was sie bauen, gehört dir, sie werden pro gelieferter Story bezahlt, und sie sind per Konstruktion ersetzbar. Du verlierst etwas bei der Teilung: Die Produkthälfte wird dir immer nur eine Roadmap geben, nie ein Datum. Aber sieh, was du zurückbekommst. Die Servicehälfte arbeitet jetzt dort, wo du sie sehen kannst, du weißt also genau, wann etwas die Produktion erreicht, und der Schalter, der ein Feature in deiner Welt einschaltet, liegt endlich in deiner Hand.`,
    `Beide Hälften davon existieren und funktionieren im großen Maßstab. Die größten Produktfirmen der Welt veröffentlichen Roadmaps für Hunderttausende Kunden, und diese Roadmaps sind nie voll verbindlich. Niemand geht daran unter, denn niemandes Architektur hängt an diesen Versprechen; die Vagheit bleibt auf der anderen Seite einer Schnittstelle, wo sie bloß Wetter ist. Aber hol sie in dein eigenes Backlog, und dein Release-Datum hängt plötzlich an einem „Wir schauen uns das an". Das ist das allgemeine Gesetz, das unter diesem ganzen Essay liegt: <strong>Bullshit-Toleranz ist eine Funktion der Kopplung.</strong> Und es zeigt auf die echte Reparatur. Von Menschen unter Druck mutigere Sätze zu verlangen repariert nichts. Du reparierst das Modell, bis schlichte Sätze wieder bezahlbar sind.`,
  ],
  audit: `Also prüfe deine Lieferanten mit vier Fragen. Wem gehört der Code? Wer betreibt ihn? Wer bezahlt die Rechnung? Wer kann die Arbeit sehen? Wenn sich die Antworten nicht zu einer der beiden ehrlichen Formen fügen, musst du nicht auf die Katastrophe warten. Geh über den Projektflur, und du findest sie schon beim Wachsen: eine Tabelle, die sich selbst wiederholt, ein Daily, dem niemand zusagt, eine Seite, die niemand findet, und einen Raum voller anständiger Leute, die eine Sprache sprechen, in der nichts falsch sein kann.`,
  closing: [
    `Ich behaupte nicht, dass die Reparatur im laufenden Betrieb leicht anzuwenden ist. Verträge wie das dritte Ding werden für Jahre unterschrieben, und das Problem klar zu sehen garantiert noch nicht das Standing, es auszusprechen. Doch Beständigkeit wirkt in beide Richtungen. Ein kaputtes Modell überdauert, weil es die Menschen überlebt, die dagegen ankämpfen; ein repariertes Modell überdauert auf genau dieselbe Weise. Repariere die Form einmal, und die Reparatur wirkt noch lange, nachdem alle Beteiligten das Projekt gewechselt haben. Einmal gehört zu werden genügt, und die Chancen dafür kommen immer wieder: jede Verlängerung, jede Erweiterung, jede Krise, in der eine Drohung ausgesprochen wird, weil nichts anderes mehr übrig ist.`,
    `Und wenn die Chance kommt, denk daran: Die Teilung kostet niemanden den Job. Es sind dieselben Leute, sortiert in Formen, in denen sie an dem gemessen werden, was sie wirklich gut können. Die Wissenschaftler dürfen Wissenschaftler sein. Der Manager bekommt echte Hebel statt Schuldzuweisungen. Niemand pflegt die Tabelle, niemand setzt das Daily an, niemand antwortet in Floskeln. Das ist die hoffnungsvollste Tatsache, die unter diesem Essay liegt: Niemand in diesen Räumen will den Bullshit. Nicht der Veteran, nicht der Manager, nicht der Lieferant. Also stell die vier Fragen, laut, selbst wenn du die neueste Person im Raum bist. Eine Frage ist keine Anklage. Menschen kehren zu schlichten Sätzen zurück, sobald schlichte Sätze wieder bezahlbar sind. <strong>Nicht die Menschen musst du reparieren, sondern das Modell.</strong>`,
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
    `هناك طريقتان نزيهتان لا ثالث لهما لشراء البرمجيات من شركةٍ أخرى.`,
    `يمكنك أن تشتري منتَجًا. يحتفظون بشيفرتهم وخارطة طريقهم، ويبقون على مسافةٍ منك. وتحصل أنت على واجهاتٍ واضحة وتوثيقٍ وحقِّ البحث عن بديل. أما غموض وعودهم فشأنهم وحدهم، لأنك اخترتهم لما يستطيعون فعله الآن، ولا شيء في خطتك يقوم أو يسقط بوعودهم.`,
    `أو يمكنك أن تشتري خدمة. يعملون في قائمة مهامك، وعلى بنيتك التحتية، ووفق أولوياتك، وكل ما يبنونه ملكٌ لك. يكسبون أجرهم عن كل قصةٍ مُسلَّمة، ويمكنك استبدالهم دون أن تخسر البرمجية، لأن البرمجية لم تكن يومًا ملكَهم.`,
    `لا تفتقر تقنية المعلومات في الشركات إلى الكوارث. لكن نوعًا واحدًا بعينه يبدأ دائمًا بالطريقة نفسها: شخصٌ ما يوقّع عقدًا على <strong>شيءٍ ثالث</strong>.`,
  ],
  thirdThing: `يبدو الشيء الثالث معقولًا على الورق. يحتفظ المورّد بملكيته الفكرية، كشركة منتَجات. لكنه يشغّل أيضًا ما يبنيه، على حساباتك السحابية، كشركة خدمات. تذاكرهم تعيش في Jira خاصّتهم التي لا تستطيع رؤيتها. وشيفرتهم صندوقٌ أسود لا تستطيع فتحه. وخوادمهم على فاتورتك التي لا تستطيع ضبط حجمها. صارت الملكية والتشغيل والرؤية تشير إلى ثلاث جهاتٍ مختلفة، وكلها تشير بعيدًا عنك.`,
  symptoms: [
    `ما ينمو في تلك الفجوات واحدٌ في كل مكان. لقد رأيته ينمو في شركاتٍ عدة على مدى سنواتٍ طويلة، والمشاهد التالية مزيجٌ منها جميعًا. يأتي الجدول أولًا. يحتاج أحدهم إلى تتبّع تقدّم المورّد، وتذاكر المورّد غير مرئية، فيظهر جدول Excel يُحدَّث يدويًا: عشرات الأعمدة، بعضها تكرارٌ لبعض، وكل صفٍّ ظلٌّ لتذكرةٍ تعيش أصلًا في مكانٍ لا تستطيع رؤيته. من المغري أن تضحك على الجدول. لا تفعل. فالجدول نسيجُ ندبة. كل جدول ظلٍّ في شركتك يُعلّم الموضع الذي يئست فيه المنظمة من أداةٍ مشتركة فأنبتت حلًّا التفافيًا مكانها.`,
    `ثم يأتي الاجتماع. تقدّم المورّد غير مرئيٍّ بين المحطات، فتظهر مكالمةٌ يومية كي يتسنّى لأحدهم أن يسأل المورّد عن حالة الأمور. يُدعى إليها العشرات. قلّةٌ يعتذرون. ومعظمهم لا يردّ أصلًا، لأن الاعتذار والقبول كليهما التزام، وأسلم جوابٍ عن أي سؤالٍ في مشروعٍ كهذا هو لا جواب. يحضر فعلًا نحو اثني عشر شخصًا، كلَّ صباح، لنصف ساعة. تحمل الدعوة اسمًا ودودًا فيه كلمة sync. إنها استطلاعُ حالةٍ في زيٍّ تنكّري. حين لا يُسمح للأنظمة بالمزامنة، يصير البشر آلية المزامنة، وهذه الآلية وقودها كشفُ الرواتب: اثنا عشر شخصًا، في نصف ساعة، في خمسة أيام، إلى الأبد. هذا هو الثمن الدائم لعدم مشاركة نظام التذاكر.`,
    `ثم تأتي الصفحات. تظهر صفحة Confluence لموضوعٍ سينتهي به المطاف متتبَّعًا في Jira على أي حال. وبعد أشهرٍ تظهر صفحةٌ ثانية، لأن الأولى ازدحمت وتنظيفها عمل، فيؤرشف أحدهم الصفحة القديمة ويستنسخ نسخةً جديدة. أما الرابط في دعوة الاجتماع الدوري فما يزال يشير إلى الأصل، وسيظل يشير إليه سنوات، لأن أحدًا لا يعدّل سلسلة اجتماعاتٍ أبدًا. لا خبث في شيءٍ من هذا. كل خطوةٍ تسهيلٌ صغير يمكن الدفاع عنه بمفرده.`,
    `لكن انظر إلى الحطام. لم يُخْفَ شيء، ومع ذلك لم يعد أحدٌ يقدر على العثور على الحقيقة الراهنة. لقد تكاثرت المعلومات حتى لم يعد أحدٌ يعرف أيَّ نسخةٍ يصدّق. <strong>الحقيقة لا تُخفى، بل تُغلَب بالعدد.</strong>`,
  ],
  dialectIntro: `وفوق كل شيءٍ تستقرّ طريقةٌ في الكلام. «في أقرب وقتٍ ممكن». «حيثما كان ذلك منطقيًا». «بأعلى أولوية». «سيتعيّن علينا دراسة الأمر». أصغِ إلى هذه الجمل كما يصغي المهندس: لا يمكن لأيٍّ منها أن تكون خاطئةً أبدًا. والجملة التي لا يمكن أن تكون خاطئة لا تحمل معلومة. إنها لا تستبعد شيئًا. كدّس ما يكفي منها فيصبح تقرير الحالة متوافقًا مع كل واقعٍ ممكن، وهذا بالضبط ما يحتاجه الجميع منه. عرّف الفيلسوف <a href="${FRANKFURT}" target="_blank" rel="noopener noreferrer">Harry Frankfurt</a> <a href="${ON_BULLSHIT}" target="_blank" rel="noopener noreferrer">الهراء</a> بأنه كلامٌ لا يبالي بالحقيقة. وكان بوسعه أن يوفّر على نفسه عناء الرسالة كلها ويكتفي بقراءة صفحة حالة مشروع.`,
  dialect: [
    `لهذه اللهجة أزمنةُ أفعال. العمل يسكن المستقبل: «سننظر في الأمر الأسبوع المقبل» تنضج لتصبح «نظرنا في الأمر، وسنعالجه الشهر المقبل». النظرُ في الأمر مُخرَجٌ يُنتج نظرًا آخر في الأمر؛ الأفق يتدحرج والوحدة تتضخّم، فيصير الأسبوع شهرًا. وللتصعيد جنسه الأدبي الخاص: تصعيدٌ لا يسلّم شيئًا سوى واقعة حدوثه، بلا تاريخٍ مرفق ولا أثرٍ مسمّى. وحين تتحوّل شارة الحالة أخيرًا من الأصفر إلى الأحمر، اقرأ الصفحة تحتها: الجمل هي نفسها. يتغيّر اللون ولا تتغيّر اللهجة. فالأحمر ليس إلا أصفر مع تهديدٍ بالعنف.`,
    `ما يجعل محاربة هذه اللهجة شبه مستحيلة أنها ليست الوثيقة كلها ولا شخصًا واحدًا بعينه. صفحات الحالة الحقيقية تحمل جملًا صادقةً محسوبةً بدقة إلى جوار الجمل المراوغة، فلا تستطيع الاعتراض على الصفحة، بل على شذراتٍ منها فقط، والاعتراض على الشذرات يبدو تنطّعًا. ثم إن اللهجة جوقةٌ لا صوتًا منفردًا. «الأمر يعتمد». «علينا أن ندرس الأمر». «لا أستطيع أن أجيبك». حين تقول أفواهٌ كافية هذه الأشياء، تكفّ اللهجة عن كونها طبعَ شخصٍ وتصبح اللغةَ الأمَّ للغرفة، الشيء الذي يتشرّبه القادمون الجدد بوصفه جزءًا من التأهيل. وتُكمل الأقدمية الحيلة، لا لأن المخضرم يخادع. فحين يقول مخضرمُ عقودٍ «الأمر يعتمد»، فالأمر غالبًا يعتمد فعلًا؛ لقد شاهد إجاباتٍ واثقة تنهار في هذا النظام بعينه. لكن الغرفة لا تستطيع التمييز بين الحذر المكتسَب والمراوغة، لأن كليهما يُسلّم الكلمات الثلاث نفسها. فيستعير كلُّ تحوّطٍ فارغ في الجوقة مصداقيةَ المخضرم، ويُحسَب الغموض، إذا قيل من مقامٍ عالٍ بما يكفي، حكمةً.`,
  ],
  composite: `إن كان هذا يشبه مشروعك، فأنا لم أكن أصف مشروعك، وهذا أشدّ ما يمكنني قوله إدانةً: إنه يشبه المشاريع كلَّها.`,
  why: [
    `لماذا ينمو كل هذا؟ راقب مشهدًا واحدًا، مركّبًا كسابقيه. يُسلَّم مورّدٌ سؤالًا لا يجيب عنه إلا فريق بنيةٍ تحتية، تحليلَ تكلفةٍ أو خطةَ سعة، اختر ما شئت، لأن خوادمه تقبع شبه خاملةٍ على فاتورةٍ يدفعها العميل. المورّد غرفةٌ من العلماء يكتبون برمجياتٍ متخصصة. إنهم بارعون تمامًا فيما استُقدموا لأجله، وليسوا أهل بنيةٍ تحتية، وكلُّ الحاضرين يعرفون الأمرين معًا. يقول مديرٌ الجملةَ التي يقولها المديرون في هذا الموقف دائمًا. ولها الأجزاء الثلاثة نفسها في كل مرة: هذه مسؤوليتكم، ولا يعنيني كيف، وإن لم يحدث الأمر فالتكاليف عليكم.`,
    `من المغري أن تسمع تلك الجملة إدارةً سيئة. اسمعها بدلًا من ذلك جردَ حساب. لا يستطيع المدير إصلاح الشيفرة، لأنها صندوقٌ أسود. ولا تولّي التشغيل، لأن العقد يقول إن المورّد هو من يشغّل. ولا حتى مشاهدة العمل وهو يجري، لأن التذاكر تعيش في Jira لا يستطيع أحدٌ في الغرفة فتحها. كلُّ رافعةٍ حقيقية جرى التنازل عنها بالتوقيع قبل سنوات. وما بقي هو إسناد المسؤولية والتهديد بنقل التكاليف. <strong>اللوم هو الشكل الذي تتخذه الإدارة بعد أن تُنتزَع منها بالعقود كلُّ رافعةٍ حقيقية.</strong>`,
    `لاحظ ما يساويه التهديد فعلًا. إسنادُ المسؤولية إلى من لا يملك القدرة مجرّدُ جدولةٍ للّوم مسبقًا. فالطرف الذي يحدّد حجم الخوادم لا يدفع ثمنها، وعليه فالخمول هو نقطة التوازن. وحين يُرصَد المال قبل العمل بزمنٍ طويل، يكون التهديد بالتكاليف مسرحًا فوق مسرح: فالمال أُنفق أصلًا. الجميع في الغرفة يعرفون هذا كله. وتُقال الجملة رغم ذلك، لأن قولها هو النقلة الوحيدة المتبقية على الرقعة.`,
    `الآن أغلق الحلقة. ماذا ينتزع ذلك الضغط من المورّد؟ ليس الجواب؛ فهم عاجزون عن إنتاجه. إنه ينتزع لغةً: «سننظر في الأمر الأسبوع المقبل». اللوم يتدفق نزولًا، والتحوّطات تتدفق صعودًا، ويغادر الطرفان وبيد كلٍّ منهما أثرٌ ورقي يثبت أنه أدّى دوره. لومٌ يدخل، هراءٌ يخرج. اللهجة هي طريقة الناس في التنفّس داخل نموذجٍ مكسور.`,
  ],
  build: `غريزة المهندس عند هذه النقطة أن يبني شيئًا. شعرتُ بها بنفسي، ورأيت آخرين يشعرون بها: أمام قائمة مهامّ مورّدٍ غير مرئية، يرسم أحدهم دائمًا أداةً تُزامن التذاكر بين نظامَي Jira. إنها غريزةٌ نزيهة وفكرةٌ غبية، ولا تصمد أمام أسبوعٍ من التفكير النزيه. الحدّ الفاصل لا يختفي؛ بل صار على أحدهم أن يقرّر، إلى الأبد، أيُّ التذاكر تعبره. والمزامنة نفسها برمجيةٌ جديدة تحتاج إلى صيانة. وفي نهاية كل ذلك الجهد، تشتري رؤيةً كاملة لتذاكر ما زلت عاجزًا عن التصرف فيها: سترى كل شيء ولن تغيّر شيئًا. لا يمكنك أن تشقّ بالأدوات طريقك للخروج من مشكلةٍ شكلُها عقد، وكل نسخةٍ جديدة من الحقيقة، مهما بلغت براعتها، تنضمّ إلى الحشد الذي يغلبها بالعدد. لا شيء في مشروعٍ «لا يضرّ». <strong>كل ما لا يساعد فعليًا يعيق فعليًا.</strong>`,
  fix: [
    `يسكن الإصلاح حيث يسكن العطب: في النموذج. إن كان المورّد يؤدي وظيفتين، فافصلهما إلى علاقتين، حتى لو بقي الأشخاص أنفسهم. يصبح النصف الأول شركةَ منتَجٍ حقيقية. يحتفظون بشيفرتهم وخارطة طريقهم، ينشرون التحديثات كل ربع سنةٍ أو كل سنة، يتتبّعون عيوبهم بأنفسهم، ويدينون لك بواجهاتٍ واضحة بدلًا من الشفافية. تثبّت صندوقهم الأسود على بنيتك التحتية، وتشغّله أنت، وتبني وصلاتك الخاصة حوله، وتحتفظ بحق الرحيل. ويصبح النصف الآخر فريقَ خدمةٍ حقيقيًا. يعملون في Jira خاصّتك، وعلى أنظمتك، ونيابةً عنك. ما يبنونه ملكٌ لك، ويتقاضون عن كل قصةٍ مُسلَّمة، وهم قابلون للاستبدال بحكم البناء نفسه. تخسر شيئًا في هذا الفصل: نصف المنتَج لن يعطيك أبدًا سوى خارطة طريق، لا موعدًا. لكن انظر إلى ما تستعيده. نصف الخدمة يعمل الآن حيث تستطيع رؤيته، فتعرف بالضبط متى يبلغ شيءٌ ما بيئة الإنتاج، والمفتاح الذي يشغّل ميزةً في عالمك صار أخيرًا في يدك.`,
    `نصفا هذا الحل موجودان ويعملان على أوسع نطاق. أكبر شركات المنتَجات في العالم تنشر خرائط طريقٍ لمئات الآلاف من العملاء، وتلك الخرائط لا تكون ملزِمةً تمامًا قط. ولا يغرق أحد، لأن أحدًا لا تعتمد معماريّته على تلك الوعود؛ يبقى الغموض على الضفة البعيدة من واجهة، حيث هو مجرّد أحوال طقس. لكن انقله إلى داخل قائمة مهامك، فإذا بموعد إطلاقك يعتمد على «سننظر في الأمر». هذا هو القانون العام المختبئ تحت هذا المقال كله: <strong>تحمُّل الهراء دالّةٌ في شدّة الاقتران.</strong> وهو يشير إلى الإصلاح الحقيقي. مطالبةُ أناسٍ واقعين تحت الضغط بجملٍ أشجع لا تُصلح شيئًا. أنت تُصلح النموذج، حتى تعود الجمل الصريحة في المتناول من جديد.`,
  ],
  audit: `فراجع مورّديك إذن بأربعة أسئلة. من يملك الشيفرة؟ من يشغّلها؟ من يدفع الفاتورة؟ من يستطيع رؤية العمل؟ إن لم تصطفّ الإجابات في أحد الشكلين النزيهين، فلا حاجة بك إلى انتظار الكارثة. امشِ في أرض المشروع وستجدها تنمو بالفعل: جدولٌ يكرّر نفسه، ومكالمةٌ يومية لا يقبل دعوتها أحد، وصفحةٌ لا يجدها أحد، وغرفةٌ مليئة بأناسٍ طيبين يتكلمون لغةً لا يمكن فيها لشيءٍ أن يكون خاطئًا.`,
  closing: [
    `لن أدّعي أن الإصلاح سهل التطبيق في منتصف الرحلة. فعقودٌ كالشيء الثالث تُوقَّع لسنوات، ورؤية المشكلة بوضوحٍ لا تضمن لك مقامًا تقولها منه. لكن الديمومة سلاحٌ ذو حدّين. النموذج المكسور يدوم لأنه يُعمّر أطول ممن يحاربونه؛ والنموذج المُصلَح يدوم بالطريقة نفسها تمامًا. أصلح الشكل مرةً واحدة، يبقَ الإصلاح يعمل طويلًا بعد أن يغادر كلُّ من صنعوه إلى مشاريع أخرى. يكفي أن تُسمَع مرةً واحدة، وفرص أن تُسمَع لا تنقطع: كل تجديدٍ للعقد، وكل تمديد، وكل أزمةٍ يُطلق فيها تهديدٌ لأن لا شيء آخر بقي.`,
    `وحين تأتي الفرصة، تذكّر أن الفصل لا يكلّف أحدًا وظيفته. إنهم الأشخاص أنفسهم، وقد فُرزوا في أشكالٍ يُقيَّمون فيها على ما يجيدونه فعلًا. العلماء يعودون علماء. والمدير ينال روافع حقيقيةً بدلًا من اللوم. لا أحد يصون الجدول، ولا أحد يجدول الاجتماع اليومي، ولا أحد يجيب بالتحوّطات. تلك أرجى حقيقةٍ تختبئ تحت هذا المقال كله: لا أحد في هذه الغرف يريد الهراء. لا المخضرم، ولا المدير، ولا المورّد. فاطرح الأسئلة الأربعة بصوتٍ مسموع، حتى لو كنت أحدثَ من في الغرفة. السؤال ليس اتهامًا. يعود الناس إلى الجمل الصريحة لحظةَ تصبح الجمل الصريحة في المتناول من جديد. <strong>ليس الناس هم من يحتاج إلى إصلاح، بل النموذج.</strong>`,
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
