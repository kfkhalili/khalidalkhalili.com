import type { Metadata } from "next";
import { StarPattern } from "@/components/geometry";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "A little about Khalid Alkhalili — builder, writer, and someone who loves people.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
      <section className="relative isolate">
        <div className="pointer-events-none absolute -inset-x-24 -top-20 -z-10 h-[300px] text-accent opacity-[0.05]">
          <StarPattern id="about-khatam" className="h-full w-full" />
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          About
        </h1>

        <div className="prose mt-8">
          <p>
            I&rsquo;m Khalid — I work in IT, and at heart I&rsquo;m a builder. I
            vibe-code my way through projects, following curiosity more than any
            roadmap, and I&rsquo;ve shipped more small things than I can count.
          </p>
          <p>
            Lately I&rsquo;m trying to grow toward consulting — to spend more
            time on the <em>why</em> behind what teams build, not just the{" "}
            <em>how</em>.
          </p>
          <p>
            When I&rsquo;m not building, I write. Sometimes essays, sometimes
            something more creative. I read online, I write online, and I like
            to think out loud in public.
          </p>
          <p>
            I&rsquo;m a Muslim, and I try to let that show up as care — for
            craft, for honesty, and above all for people. I love people.
            That&rsquo;s the short version.
          </p>
          <p>
            This site is my corner of the internet: a place for the ideas worth
            making interactive.
          </p>
          <p>
            Want to connect? Find me on{" "}
            <a href={site.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
