---
{"dg-publish":true,"permalink":"/01-explorable-explanations/01-my-thoughts-on-technical-debt/"}
---

Technical debt isn't just a metaphor; it's a mathematical drag coefficient on your velocity.

```tech-debt-sim

```

The Technical Debt Simulator models a **running project** over time. Each tick is one “week”; the simulation advances automatically. The only input you control is **refactor allocation** (the slider): the share of effort going to paying down technical debt instead of new features. You can jump to a strategy with **presets** (Startup rush, Sustainable, Enterprise safe, Full refactor) or move the slider yourself. The simulation **pauses when the tab is hidden** so “weeks” don’t advance in the background.
### Presets

- **Startup rush** (10%) — Ship fast; debt builds and will eventually drag velocity and morale down.

- **Sustainable** (30%) — Roughly steady state: debt flat, velocity and morale healthy. The “invest a bit in design” sweet spot.

- **Enterprise safe** (50%) — More time on refactor; debt stays low but feature velocity is lower.

- **Full refactor** (80%) — Almost all effort on cleanup; debt drops but you ship few new features.
### How tech debt is calculated

#### Debt growth (per week)

If you allocate little time to refactoring, debt grows. The model uses:

- **Growth** = `(1 − refactor%) × 1.5` — so at 0% refactor, debt grows by 1.5 per week; at 30%, by 1.05.

- **Payback** = `refactor% × 3.5` — so at 30% refactor, you pay back 1.05 per week.
#### Steady state

At **30% refactor**, growth and payback are equal (1.05 vs 1.05), so debt stays roughly flat. That’s the “healthy” baseline. If you **lower** the slider, growth exceeds payback and debt climbs; if you **raise** it, you pay debt down.

#### Velocity

Feature velocity is reduced by:

1. **Debt drag**: existing debt slows you down (debt × 0.35).
2. **Refactor tax**: time spent refactoring isn’t spent on features (refactor% × 0.25).

So velocity = `100 − debtDrag − refactorTax`, clamped to 0–100.
#### Morale

Morale drops when debt is high or velocity is low (team frustration). It’s computed from debt and the gap between current and “ideal” velocity, then clamped to 0–100.

The point of the model: **complexity (debt) accumulates when you don’t invest in design;** investing a steady fraction in refactoring keeps the system in balance, and cutting that investment makes things worse over time.

---
## References

In *[A Philosophy of Software Design](https://www.amazon.com/dp/1732102201)*, **John Ousterhout** defines complexity as *“anything related to the structure of a software system that makes it hard to understand and modify.”* He distinguishes **tactical programming** (ship the feature fast, add a bit of complexity) from **strategic programming** (invest in design so the system stays simple and easy to change). The simulator’s “refactor allocation” is exactly that investment: spending 10–20% of effort on design and cleanup so complexity doesn’t pile up. When you modify existing code, he argues you should **stay strategic**: *“refactor the system so that you end up with the best possible design”* rather than the smallest possible change.

<iframe 
  width="100%" 
  style="aspect-ratio: 16/9" 
  src="https://www.youtube.com/embed/fPIuFo9V3Lk" 
  title="YouTube video player" 
  frameborder="0" 
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
  allowfullscreen>
</iframe>

I attended this talk at TNG's [Big Techday](https://www.bigtechday.com/) 24; it’s a clear summary of the main ideas (tactical vs strategic, complexity, and the investment mindset).