---
{"dg-publish":true,"permalink":"/01-explorable-explanations/01-visualizing-the-drag-of-technical-debt/","created":"2026-02-07T20:14:17.314+01:00"}
---

Technical debt is often discussed as a metaphor, but it behaves more like a physical law: it is a drag coefficient on your team's velocity.

```tech-debt-sim
```

In *[A Philosophy of Software Design](https://www.amazon.com/dp/1732102201)*, John Ousterhout defines complexity as "anything related to the structure of a software system that makes it hard to understand and modify". This interactive model visualizes that friction. It explores the tension between **Tactical Programming** (shipping fast now) and **Strategic Programming** (investing in design for the future).

Complexity accumulates whether we like it or not. The only influence we have is how much time we set for dealing with it. More time to fix bugs and refactor code means you have less time to ship features, so you'll need some kind of strategy.

## Four Archetypes

- **Startup Rush (10%):** The "Tactical" approach. You ship fast early on, but you are borrowing against the future. Eventually, the debt load becomes so heavy that morale and velocity collapse.
- **Sustainable (30%):** The "Strategic" sweet spot. You invest just enough (about a third of your time) to keep debt flat. This yields the highest long-term velocity.
- **Enterprise Safe (50%):** A low-risk, lower-speed approach where stability is prioritized over new features.
- **Full Refactor (80%):** The emergency brake. You stop shipping to clean up the mess. It works, but it's a painful, slow recovery.

## How the Model Works

This simulation isn't random. It is driven by the battle between two opposing forces: **Entropy** and **Investment**.

1. **The Growth of Complexity (Entropy)** Software naturally tends toward disorder as features are added, and if you do nothing, debt grows, and the more it grows, the more it compounds.
2. **The Payback (Investment)** By allocating time to cleanup, you generate a "payback" rate. The goal is to find the equilibrium where your payback matches the natural growth of complexity.
3. **The Drag on Velocity** This is the core mechanic: Velocity isn't just about how fast you type. It is `100% - (Drag from Debt) - (Time Spent Refactoring)`.

**The Trap:** If you stop refactoring, you save time initially (velocity spikes). But as debt accumulates, the "Drag" component gets massive, eventually strangling your speed far more than the refactoring ever would have.

## Hindsight is 20/20
- **100% Velocity is a Warning Sign.** If a team is moving at "100," they are borrowing time from the future, and that's reckless. The "missing" 30% velocity in a healthy team isn't waste; it is the **Cost of Doing Business**. Communication, design, and maintenance are hard work.
- **The Myth of the Euphoric Developer.** A morale of 85–90% is the realistic ceiling. The gap between 85 and 100 represents **Professional Discipline**, the necessary friction of writing tests, documentation, and code reviews. A team that is "perfectly happy" usually implies they are skipping the hard parts.
- **Debt Earns Interest.** Technical debt doesn't just sit there; it compounds. As complexity grows, the "tax" on every new line of code increases. If you wait too long, the **Break-Even Point** for refactoring will completely kill velocity.
- **Shipping is Oxygen.** While developers hate bad code, they also hate _not_ shipping. A strategy of 100% refactoring (Gold Plating) kills morale just as fast as 0% refactoring (Spaghetti Code). Engineers need to feel the momentum of delivery to stay engaged.
- **The Point of No Return Exists.** Tech debt is fatal not when code is unfixable, but when the **cost of recovery** becomes unpayable. A full refactor might save the codebase, but not shipping for months means you will have lost the market. This is **Economic Bankruptcy**.
- **Clean Code is Not the Goal.** We learned that **70% Velocity** (with its associated maintenance cost) is better than **40% Velocity** (perfect code). If you have 0% debt but are moving slowly because you are polishing code that works, you are failing just as badly as the team with high debt. The goal is the _sustainable maximum_, not perfection.

## Conclusion

The simulation demonstrates Ousterhout’s central thesis: **Complexity accumulates when you don't invest in design.** The most effective teams aren't the ones who type the fastest; they are the ones who maintain a "Sustainable" balance, preventing the drag coefficient from taking over.

Check out the talk I attended at at TNG's [Big Techday](https://www.bigtechday.com/) 24

<iframe 
  width="100%" 
  style="aspect-ratio: 16/9" 
  src="https://www.youtube.com/embed/fPIuFo9V3Lk" 
  title="YouTube video player" 
  frameborder="0" 
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
  allowfullscreen>
</iframe>
