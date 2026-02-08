---
{"dg-publish":true,"permalink":"/01-explorable-explanations/01-visualizing-the-drag-of-technical-debt/"}
---

Technical debt is often discussed as a metaphor, but it behaves more like a physical law: it is a drag coefficient on your team's velocity.

```tech-debt-sim
```

In *[A Philosophy of Software Design](https://www.amazon.com/dp/1732102201)*, John Ousterhout defines complexity as "anything related to the structure of a software system that makes it hard to understand and modify". This interactive model visualizes that friction. It explores the tension between **Tactical Programming** (shipping fast now) and **Strategic Programming** (investing in design for the future).

Complexity accumulates whether we like it or not. The only influence we have is how much time we set for dealing with it. More time to fix bugs and refactor code means you have less time to ship features, so you'll need some kind of strategy.

### Four Archetypes

- **Startup Rush (10%):** The "Tactical" approach. You ship fast early on, but you are borrowing against the future. Eventually, the debt load becomes so heavy that morale and velocity collapse.
- **Sustainable (30%):** The "Strategic" sweet spot. You invest just enough (about a third of your time) to keep debt flat. This yields the highest long-term velocity.
- **Enterprise Safe (50%):** A low-risk, lower-speed approach where stability is prioritized over new features.
- **Full Refactor (80%):** The emergency brake. You stop shipping to clean up the mess. It works, but it's a painful, slow recovery.

### How the Model Works

This simulation isn't random. It is driven by the battle between two opposing forces: **Entropy** and **Investment**.

1. **The Growth of Complexity (Entropy)** If you do nothing, debt grows. Software naturally tends toward disorder as features are added. In this model, if your "Refactor Allocation" is low, the debt climbs automatically.
2. **The Payback (Investment)** Refactoring is the only way to counteract entropy. By allocating time to cleanup (moving the slider right), you generate a "payback" rate. The goal is to find the equilibrium where your payback matches the natural growth of complexity.
3. **The Drag on Velocity** This is the core mechanic: Velocity isn't just about how fast you type. It is `100% - (Drag from Debt) - (Time Spent Refactoring)`.

**The Trap:** If you stop refactoring, you save time initially (velocity spikes). But as debt accumulates, the "Drag" component gets massive, eventually strangling your speed far more than the refactoring ever would have.

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
