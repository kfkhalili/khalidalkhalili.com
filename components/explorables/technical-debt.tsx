import { TechDebtSim } from "@/components/tech-debt-sim";
import { getTechDebtContent } from "@/components/explorables/technical-debt.content";

/** Render a block of authored (trusted) HTML as the given prose element. */
function Html({ as: Tag = "p", html }: { as?: "p" | "li"; html: string }) {
  return <Tag dangerouslySetInnerHTML={{ __html: html }} />;
}

/**
 * Body of the technical-debt explorable — the prose + live simulation, in the
 * page's language. One JSX skeleton; all copy comes from the locale-keyed content
 * module. Rendered inside the shared `.prose` wrapper by the article route via the
 * explorables registry (the "component adapter" behind the article render seam).
 */
export function TechnicalDebtArticle({ lang }: { lang: string }) {
  const c = getTechDebtContent(lang);

  return (
    <>
      <Html html={c.intro} />

      <TechDebtSim strings={c.sim} />

      <Html html={c.ousterhout} />
      <Html html={c.accumulate} />

      <h2>{c.archetypesHeading}</h2>
      <ul>
        {c.archetypes.map((item, i) => (
          <Html key={i} as="li" html={item} />
        ))}
      </ul>

      <h2>{c.modelHeading}</h2>
      <Html html={c.modelIntro} />
      <ol>
        {c.modelSteps.map((item, i) => (
          <Html key={i} as="li" html={item} />
        ))}
      </ol>

      <Html html={c.trap} />

      <h2>{c.hindsightHeading}</h2>
      {c.details.map(([summary, body], i) => (
        <details key={i}>
          <summary>{summary}</summary>
          <Html html={body} />
        </details>
      ))}

      <hr />

      <h2>{c.conclusionHeading}</h2>
      <Html html={c.conclusion} />

      <Html html={c.talkIntro} />

      <iframe
        width="100%"
        style={{ aspectRatio: "16 / 9" }}
        src="https://www.youtube.com/embed/fPIuFo9V3Lk"
        title={c.videoTitle}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </>
  );
}
