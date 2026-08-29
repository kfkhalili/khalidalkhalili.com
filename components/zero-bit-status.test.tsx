import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ZeroBitStatus } from "./zero-bit-status";
import type { StatusPageStrings } from "./explorables/the-third-thing.content";
import { TT_CONTENT } from "./explorables/the-third-thing.content";

const strings: StatusPageStrings = {
  heading: "Platform status",
  badge: "YELLOW",
  badgeRed: "RED",
  escalate: "Escalate",
  deescalate: "De-escalate",
  hint: "Tap a sentence.",
  sentences: [
    { calm: "We are looking into it.", loud: "WE ARE ALL OVER IT.", note: "No date." },
    { calm: "Rollout paused at 40%.", note: "A number. The one honest line." },
    { calm: "Fix lands where it makes sense.", loud: "FIX LANDS ASAP.", note: "Unfalsifiable." },
  ],
  footer: "Next update tomorrow.",
  aftermath: "Same sentences, louder.",
};

const escalateButton = () => screen.getByRole("button", { name: strings.escalate });
const deescalateButton = () => screen.getByRole("button", { name: strings.deescalate });

describe("ZeroBitStatus", () => {
  it("opens calm: yellow badge, calm sentences, nothing announced", () => {
    render(<ZeroBitStatus strings={strings} />);
    expect(screen.getByText(strings.heading)).toBeInTheDocument();
    expect(screen.getByText(strings.badge)).toBeInTheDocument();
    expect(screen.getByText(strings.hint)).toBeInTheDocument();
    expect(screen.getByText(strings.footer)).toBeInTheDocument();
    for (const sentence of strings.sentences) {
      expect(screen.getByText(sentence.calm)).toBeInTheDocument();
    }
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("keeps every annotation hidden until its sentence is tapped", () => {
    render(<ZeroBitStatus strings={strings} />);
    for (const sentence of strings.sentences) {
      expect(screen.getByText(sentence.note)).not.toBeVisible();
    }
  });

  it("reveals one annotation on tap and hides it again", async () => {
    render(<ZeroBitStatus strings={strings} />);
    const first = screen.getByRole("button", { name: /We are looking into it/ });

    expect(first).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(first);
    expect(first).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(strings.sentences[0].note)).toBeVisible();
    expect(screen.getByText(strings.sentences[1].note)).not.toBeVisible();

    await userEvent.click(first);
    expect(first).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText(strings.sentences[0].note)).not.toBeVisible();
  });

  it("keeps several annotations open at once", async () => {
    render(<ZeroBitStatus strings={strings} />);
    await userEvent.click(screen.getByRole("button", { name: /We are looking into it/ }));
    await userEvent.click(screen.getByRole("button", { name: /Rollout paused/ }));
    expect(screen.getByText(strings.sentences[0].note)).toBeVisible();
    expect(screen.getByText(strings.sentences[1].note)).toBeVisible();
  });

  it("ties each annotation to the sentence that controls it", () => {
    render(<ZeroBitStatus strings={strings} />);
    const trigger = screen.getByRole("button", { name: /Rollout paused/ });
    const panelId = trigger.getAttribute("aria-controls")!;
    // Always mounted, so aria-controls resolves even while closed.
    expect(document.getElementById(panelId)).toHaveTextContent(strings.sentences[1].note);
  });

  it("escalating turns the badge red and rewrites the sentences louder", async () => {
    render(<ZeroBitStatus strings={strings} />);
    await userEvent.click(escalateButton());

    expect(screen.getByText(strings.badgeRed)).toBeInTheDocument();
    expect(screen.queryByText(strings.badge)).not.toBeInTheDocument();
    expect(screen.getByText(strings.sentences[0].loud!)).toBeInTheDocument();
    expect(screen.queryByText(strings.sentences[0].calm)).not.toBeInTheDocument();
  });

  it("leaves the one honest sentence untouched: urgency has nothing to inflate", async () => {
    render(<ZeroBitStatus strings={strings} />);
    await userEvent.click(escalateButton());
    expect(screen.getByText(strings.sentences[1].calm)).toBeInTheDocument();
  });

  it("carries exactly the same information into the red state", async () => {
    render(<ZeroBitStatus strings={strings} />);
    await userEvent.click(screen.getByRole("button", { name: /We are looking into it/ }));
    const noteBefore = screen.getByText(strings.sentences[0].note).textContent;

    await userEvent.click(escalateButton());
    expect(screen.getByText(strings.sentences[0].note).textContent).toBe(noteBefore);
    expect(screen.getByText(strings.sentences[0].note)).toBeVisible();
  });

  it("announces the aftermath politely while red, and clears it on the way back", async () => {
    render(<ZeroBitStatus strings={strings} />);
    const live = screen.getByRole("status");
    expect(live).toHaveAttribute("aria-live", "polite");

    await userEvent.click(escalateButton());
    expect(live).toHaveTextContent(strings.aftermath);

    await userEvent.click(deescalateButton());
    expect(live).toBeEmptyDOMElement();
  });

  it("presses the escalate control while red, and offers the way back", async () => {
    render(<ZeroBitStatus strings={strings} />);
    expect(escalateButton()).toHaveAttribute("aria-pressed", "false");

    await userEvent.click(escalateButton());
    expect(deescalateButton()).toHaveAttribute("aria-pressed", "true");

    await userEvent.click(deescalateButton());
    expect(screen.getByText(strings.badge)).toBeInTheDocument();
    expect(screen.getByText(strings.sentences[0].calm)).toBeInTheDocument();
  });

  it("renders the real article copy", () => {
    const page = TT_CONTENT.statusPage;
    render(<ZeroBitStatus strings={page} />);
    expect(screen.getByText(page.heading)).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(page.sentences.length + 1);
  });
});
