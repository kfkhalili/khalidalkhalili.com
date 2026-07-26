import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ShareRow } from "./share-row";
import { shareIntent, SHARE_TARGETS } from "@/lib/share";
import en from "@/dictionaries/en.json";

const labels = en.share;
const url = "https://khalidalkhalili.com/en/writing/the-third-thing";
const title = "The Third Thing";

const renderRow = () => render(<ShareRow url={url} title={title} labels={labels} />);

const user = () => userEvent.setup();

/**
 * The copy button is driven with fireEvent rather than userEvent: `setup()`
 * installs its own working clipboard stub on `navigator`, which would shadow
 * the one under test and make the failure path unreachable.
 */
const clickCopy = () =>
  fireEvent.click(screen.getByRole("button", { name: labels.copy }));

beforeEach(() => {
  // No OS share sheet by default: that is the desktop path, and the one the
  // server renders.
  Object.defineProperty(navigator, "share", { value: undefined, configurable: true });
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: vi.fn().mockResolvedValue(undefined) },
    configurable: true,
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("ShareRow, without an OS share sheet", () => {
  it("offers every network, each opening safely in a new tab", async () => {
    renderRow();
    for (const target of SHARE_TARGETS) {
      const link = screen.getByRole("link", { name: labels[target] });
      expect(link).toHaveAttribute("href", shareIntent(target, { url, title }));
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("carries the article's own URL and title into each intent", () => {
    renderRow();
    const x = screen.getByRole("link", { name: labels.x }).getAttribute("href")!;
    expect(x).toContain(encodeURIComponent(url));
    expect(x).toContain(encodeURIComponent(title));
  });

  it("labels the row, and offers a copy button beside the networks", () => {
    renderRow();
    expect(screen.getByText(labels.label)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: labels.copy })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: labels.native })).not.toBeInTheDocument();
  });

  it("copies the URL and says so", async () => {
    renderRow();
    clickCopy();

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(url);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: labels.copied })).toBeInTheDocument(),
    );
  });

  it("goes quiet again after a couple of seconds", async () => {
    vi.useFakeTimers();
    renderRow();
    clickCopy();

    // Let the clipboard promise settle before the timer it starts is advanced.
    await act(async () => {});
    expect(screen.getByRole("button", { name: labels.copied })).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(2000));
    expect(screen.getByRole("button", { name: labels.copy })).toBeInTheDocument();
  });

  it("announces the copy politely, without moving the row", async () => {
    renderRow();
    const live = document.querySelector("[aria-live='polite']")!;
    expect(live).toBeEmptyDOMElement();
    expect(live.className).toContain("sr-only");

    clickCopy();
    await waitFor(() => expect(live).toHaveTextContent(labels.copied));
  });

  it("stays honest when the clipboard refuses", async () => {
    // An insecure origin, or permission denied: claiming a copy that didn't
    // happen is worse than saying nothing.
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    renderRow();

    clickCopy();
    await act(async () => {});
    expect(writeText).toHaveBeenCalledWith(url);
    expect(screen.getByRole("button", { name: labels.copy })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: labels.copied })).not.toBeInTheDocument();
  });
});

describe("ShareRow, on a device with a share sheet", () => {
  beforeEach(() => {
    Object.defineProperty(navigator, "share", {
      value: vi.fn().mockResolvedValue(undefined),
      configurable: true,
    });
  });

  it("replaces the row with the one button that opens the sheet", () => {
    renderRow();
    expect(screen.getByRole("button", { name: labels.native })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: labels.linkedin })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: labels.copy })).not.toBeInTheDocument();
  });

  it("says the word once: the button is the label", () => {
    // The row's heading and the button carry the same word in every locale, so
    // rendering both reads "Share Share" on the phones that get the sheet.
    renderRow();
    expect(labels.label).toBe(labels.native);
    expect(screen.getAllByText(labels.label)).toHaveLength(1);
  });

  it("hands the article to the sheet", async () => {
    renderRow();
    await user().click(screen.getByRole("button", { name: labels.native }));
    expect(navigator.share).toHaveBeenCalledWith({ title, url });
  });

  it("shrugs off a dismissed sheet rather than throwing", async () => {
    Object.defineProperty(navigator, "share", {
      value: vi.fn().mockRejectedValue(new Error("AbortError")),
      configurable: true,
    });
    renderRow();
    await expect(
      user().click(screen.getByRole("button", { name: labels.native })),
    ).resolves.not.toThrow();
  });
});
