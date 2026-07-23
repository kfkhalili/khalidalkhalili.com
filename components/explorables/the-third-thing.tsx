import { WatermelonSim } from "@/components/watermelon-sim";
import { ZeroBitStatus } from "@/components/zero-bit-status";
import { ContractDiagnostic } from "@/components/contract-diagnostic";
import { getThirdThingContent } from "@/components/explorables/the-third-thing.content";

/** Render a block of authored (trusted) HTML as the given prose element. */
function Html({ as: Tag = "p", html }: { as?: "p" | "li"; html: string }) {
  return <Tag dangerouslySetInnerHTML={{ __html: html }} />;
}

/**
 * Body of the the-third-thing explorable: the essay's prose with three
 * interactive artifacts embedded where the argument produces them. One JSX
 * skeleton; all copy comes from the locale-keyed content module. Rendered inside
 * the shared `.prose` wrapper by the article route via the explorables registry.
 */
export function ThirdThingArticle({ lang }: { lang: string }) {
  const c = getThirdThingContent(lang);

  return (
    <>
      {c.opening.map((p, i) => (
        <Html key={i} html={p} />
      ))}

      <Html html={c.thirdThing} />

      {c.symptoms.map((p, i) => (
        <Html key={i} html={p} />
      ))}

      <Html html={c.dialectIntro} />

      <ZeroBitStatus strings={c.statusPage} />

      {c.dialect.map((p, i) => (
        <Html key={i} html={p} />
      ))}

      <Html html={c.composite} />

      <hr />

      {c.why.map((p, i) => (
        <Html key={i} html={p} />
      ))}

      <WatermelonSim strings={c.sim} />

      <Html html={c.build} />

      {c.fix.map((p, i) => (
        <Html key={i} html={p} />
      ))}

      <Html html={c.audit} />

      <ContractDiagnostic strings={c.diagnostic} />

      {c.closing.map((p, i) => (
        <Html key={i} html={p} />
      ))}
    </>
  );
}
