import { TechDebtSim } from "@/components/tech-debt-sim";

/**
 * Body of the technical-debt explorable — the prose + live simulation. Rendered
 * inside the shared `.prose` wrapper by the article route via the explorables
 * registry (this is the "component adapter" behind the article render seam).
 */
export function TechnicalDebtArticle() {
  return (
    <>
      <p>
        Technical debt is often discussed as a metaphor, but it behaves more like
        a physical law: it is a drag coefficient on your team&rsquo;s velocity.
      </p>

      <TechDebtSim />

      <p>
        In{" "}
        <em>
          <a
            href="https://www.amazon.com/dp/1732102201"
            target="_blank"
            rel="noopener noreferrer"
          >
            A Philosophy of Software Design
          </a>
        </em>
        , John Ousterhout defines complexity as &ldquo;anything related to the
        structure of a software system that makes it hard to understand and
        modify&rdquo;. This interactive model visualizes that friction. It
        explores the tension between <strong>Tactical Programming</strong>{" "}
        (shipping fast now) and <strong>Strategic Programming</strong>{" "}
        (investing in design for the future).
      </p>

      <p>
        Complexity accumulates whether we like it or not. The only influence we
        have is how much time we set for dealing with it. More time to fix bugs
        and refactor code means you have less time to ship features, so
        you&rsquo;ll need some kind of strategy.
      </p>

      <h2>Four Archetypes</h2>

      <ul>
        <li>
          <strong>Startup Rush (10%):</strong> The &ldquo;Tactical&rdquo;
          approach. You ship fast early on, but you are borrowing against the
          future. Eventually, the debt load becomes so heavy that morale and
          velocity collapse.
        </li>
        <li>
          <strong>Sustainable (30%):</strong> The &ldquo;Strategic&rdquo; sweet
          spot. You invest just enough (about a third of your time) to keep debt
          flat. This yields the highest long-term velocity.
        </li>
        <li>
          <strong>Enterprise Safe (50%):</strong> A low-risk, lower-speed
          approach where stability is prioritized over new features.
        </li>
        <li>
          <strong>Full Refactor (80%):</strong> The emergency brake. You stop
          shipping to clean up the mess. It works, but it&rsquo;s a painful, slow
          recovery.
        </li>
      </ul>

      <h2>How the Model Works</h2>

      <p>
        This simulation isn&rsquo;t random. It is driven by the battle between
        two opposing forces: <strong>Entropy</strong> and{" "}
        <strong>Investment</strong>.
      </p>

      <ol>
        <li>
          <strong>The Growth of Complexity (Entropy).</strong> Software naturally
          tends toward disorder as features are added, and if you do nothing,
          debt grows &mdash; and the more it grows, the more it compounds.
        </li>
        <li>
          <strong>The Payback (Investment).</strong> By allocating time to
          cleanup, you generate a &ldquo;payback&rdquo; rate. The goal is to find
          the equilibrium where your payback matches the natural growth of
          complexity.
        </li>
        <li>
          <strong>The Drag on Velocity.</strong> This is the core mechanic:
          velocity isn&rsquo;t just about how fast you type. It is{" "}
          <code>
            100% &minus; (Drag from Debt) &minus; (Time Spent Refactoring)
          </code>
          .
        </li>
      </ol>

      <p>
        <strong>The Trap:</strong> If you stop refactoring, you save time
        initially (velocity spikes). But as debt accumulates, the
        &ldquo;Drag&rdquo; component gets massive, eventually strangling your
        speed far more than the refactoring ever would have.
      </p>

      <h2>Hindsight is 20/20</h2>

      <details>
        <summary>100% Velocity is a Warning Sign</summary>
        <p>
          If a team is moving at &ldquo;100,&rdquo; they are borrowing time from
          the future. The &ldquo;missing&rdquo; 30% velocity in a healthy team
          isn&rsquo;t waste; it is the <strong>Cost of Doing Business</strong>.
          Communication, design, and maintenance are hard work.
        </p>
      </details>

      <details>
        <summary>The Euphoric Developer is a Myth</summary>
        <p>
          A morale of 85&ndash;90% is the realistic ceiling. The gap between 85
          and 100 represents <strong>Professional Discipline</strong>&mdash; the
          necessary friction of writing tests, documentation, and code reviews.
          &ldquo;Perfectly happy&rdquo; usually implies skipping the hard parts.
        </p>
      </details>

      <details>
        <summary>Debt Earns Interest</summary>
        <p>
          Technical debt doesn&rsquo;t just sit there; it compounds. As
          complexity grows, the &ldquo;tax&rdquo; on every new line of code
          increases. If you wait too long, the <strong>Break-Even Point</strong>{" "}
          for refactoring becomes impossibly high.
        </p>
      </details>

      <details>
        <summary>Shipping is Oxygen</summary>
        <p>
          While developers hate bad code, they also hate <em>not</em>{" "}
          shipping. A strategy of 100% refactoring (Gold Plating) kills morale
          just as fast as 0% refactoring (Spaghetti Code). Engineers need to feel
          the momentum of delivery to stay engaged.
        </p>
      </details>

      <details>
        <summary>&ldquo;Economic&rdquo; Point of No Return</summary>
        <p>
          Technical debt is fatal not when code is unfixable, but when the{" "}
          <strong>cost of recovery</strong> becomes unpayable. At saturation, the
          required &ldquo;Full Refactor&rdquo; means shipping nothing for months.
          This is <strong>Economic Bankruptcy</strong>.
        </p>
      </details>

      <details>
        <summary>Clean Code is Not the Goal</summary>
        <p>
          <strong>70% Velocity</strong> (with its associated maintenance cost) is
          better than <strong>40% Velocity</strong> (perfect code). If you have
          0% debt but are moving slowly because you are polishing code, you are
          failing just as badly as the team with high debt. The goal is the{" "}
          <em>sustainable maximum</em>.
        </p>
      </details>

      <hr />

      <h2>Conclusion</h2>

      <p>
        The simulation demonstrates Ousterhout&rsquo;s central thesis:{" "}
        <strong>
          complexity accumulates when you don&rsquo;t invest in design.
        </strong>{" "}
        The most effective teams aren&rsquo;t the ones who type the fastest; they
        are the ones who maintain a &ldquo;Sustainable&rdquo; balance, preventing
        the drag coefficient from taking over.
      </p>

      <p>
        Check out the talk I attended at TNG&rsquo;s{" "}
        <a
          href="https://www.bigtechday.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Big Techday
        </a>{" "}
        24:
      </p>

      <iframe
        width="100%"
        style={{ aspectRatio: "16 / 9" }}
        src="https://www.youtube.com/embed/fPIuFo9V3Lk"
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </>
  );
}
