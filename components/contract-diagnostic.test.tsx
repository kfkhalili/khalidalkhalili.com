import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContractDiagnostic } from "./contract-diagnostic";
import type { DiagnosticStrings } from "./explorables/the-third-thing.content";
import { TT_CONTENT } from "./explorables/the-third-thing.content";

const strings: DiagnosticStrings = {
  heading: "Four questions",
  prompt: "Answer all four.",
  countdown: ["One left.", "Two left.", "Three left."],
  questions: [
    { q: "Who owns the code?", options: ["We do", "The vendor"] },
    { q: "Who operates it?", options: ["We do", "The vendor"] },
    { q: "Who pays the bill?", options: ["We do", "The vendor"] },
    { q: "Who can see the work?", options: ["We can", "We cannot"] },
  ],
  verdictLabel: "Verdict",
  verdicts: {
    product: "You bought a product.",
    service: "You bought a service.",
    thirdThing: "You bought the third thing.",
    hosted: "You bought a hosted product.",
    blind: "You bought a service you cannot see.",
  },
};

/** Answer question `qi` with option `oi` (0 = first option). */
async function answer(qi: number, oi: 0 | 1) {
  const group = screen.getByRole("radiogroup", { name: strings.questions[qi].q });
  await userEvent.click(within(group).getAllByRole("radio")[oi]);
}

/** Answer all four in order: [owns, operates, pays, sees]. */
async function answerAll(picks: [0 | 1, 0 | 1, 0 | 1, 0 | 1]) {
  for (const [qi, oi] of picks.entries()) await answer(qi, oi);
}

describe("ContractDiagnostic", () => {
  it("asks all four questions with two options each", () => {
    render(<ContractDiagnostic strings={strings} />);
    expect(screen.getByText(strings.heading)).toBeInTheDocument();
    expect(screen.getAllByRole("radiogroup")).toHaveLength(4);
    for (const question of strings.questions) {
      const group = screen.getByRole("radiogroup", { name: question.q });
      expect(within(group).getAllByRole("radio")).toHaveLength(2);
    }
  });

  it("prompts before any answer, then counts down", async () => {
    render(<ContractDiagnostic strings={strings} />);
    expect(screen.getByRole("status")).toHaveTextContent(strings.prompt);

    await answer(0, 0);
    expect(screen.getByRole("status")).toHaveTextContent(strings.countdown[2]);
    await answer(1, 0);
    expect(screen.getByRole("status")).toHaveTextContent(strings.countdown[1]);
    await answer(2, 0);
    expect(screen.getByRole("status")).toHaveTextContent(strings.countdown[0]);
  });

  it("checks the option the reader picked, and only that one", async () => {
    render(<ContractDiagnostic strings={strings} />);
    const group = screen.getByRole("radiogroup", { name: strings.questions[0].q });
    const [ours, theirs] = within(group).getAllByRole("radio");

    await userEvent.click(theirs);
    expect(theirs).toHaveAttribute("aria-checked", "true");
    expect(ours).toHaveAttribute("aria-checked", "false");

    await userEvent.click(ours);
    expect(ours).toHaveAttribute("aria-checked", "true");
    expect(theirs).toHaveAttribute("aria-checked", "false");
  });

  it("names the third thing: vendor-owned, vendor-operated, on your bill", async () => {
    render(<ContractDiagnostic strings={strings} />);
    await answerAll([1, 1, 0, 0]);
    expect(screen.getByRole("status")).toHaveTextContent(strings.verdicts.thirdThing);
    expect(screen.getByText(strings.verdictLabel)).toBeInTheDocument();
  });

  it("calls it a hosted product when the vendor also pays for the servers", async () => {
    render(<ContractDiagnostic strings={strings} />);
    await answerAll([1, 1, 1, 0]);
    expect(screen.getByRole("status")).toHaveTextContent(strings.verdicts.hosted);
  });

  it("calls vendor-owned but self-operated a product, however the rest is answered", async () => {
    render(<ContractDiagnostic strings={strings} />);
    await answerAll([1, 0, 0, 1]);
    expect(screen.getByRole("status")).toHaveTextContent(strings.verdicts.product);
  });

  it("calls it a service when the work is ours and visible", async () => {
    render(<ContractDiagnostic strings={strings} />);
    await answerAll([0, 0, 0, 0]);
    expect(screen.getByRole("status")).toHaveTextContent(strings.verdicts.service);
  });

  it("warns when we own the code but cannot see the work", async () => {
    render(<ContractDiagnostic strings={strings} />);
    await answerAll([0, 1, 1, 1]);
    expect(screen.getByRole("status")).toHaveTextContent(strings.verdicts.blind);
  });

  it("colours the verdict by how bad it is", async () => {
    const { container, unmount } = render(<ContractDiagnostic strings={strings} />);
    await answerAll([1, 1, 0, 0]);
    expect(container.querySelector('[style*="--sim-bad"]')).toBeInTheDocument();
    unmount();

    render(<ContractDiagnostic strings={strings} />);
    await answerAll([0, 1, 1, 1]);
    expect(document.querySelector('[style*="--sim-warn"]')).toBeInTheDocument();
  });

  it("revises the verdict when the reader changes an answer", async () => {
    render(<ContractDiagnostic strings={strings} />);
    await answerAll([1, 1, 0, 0]);
    expect(screen.getByRole("status")).toHaveTextContent(strings.verdicts.thirdThing);

    await answer(2, 1);
    expect(screen.getByRole("status")).toHaveTextContent(strings.verdicts.hosted);
  });

  it("renders the real article copy, in every locale", () => {
    for (const locale of ["en", "de", "ar"] as const) {
      const diagnostic = TT_CONTENT[locale].diagnostic;
      const { unmount } = render(<ContractDiagnostic strings={diagnostic} />);
      expect(screen.getByText(diagnostic.heading)).toBeInTheDocument();
      expect(screen.getAllByRole("radio")).toHaveLength(8);
      unmount();
    }
  });
});
