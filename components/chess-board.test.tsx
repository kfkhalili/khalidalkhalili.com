import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChessBoard } from "./chess-board";

const boardOptions = vi.hoisted(() => ({ current: {} as Record<string, unknown> }));

// The board itself is a third-party widget; what matters here is the position
// this component hands it and the controls that change it.
vi.mock("react-chessboard", () => ({
  Chessboard: ({ options }: { options: Record<string, unknown> }) => {
    boardOptions.current = options;
    return <div data-testid="board" data-position={String(options.position)} />;
  },
}));

const FENS = ["fen-start", "fen-1", "fen-2", "fen-3", "fen-4"];
const SANS = ["e4", "e5", "Nf3", "Nc6"];

const position = () => screen.getByTestId("board").getAttribute("data-position");
const button = (name: string) => screen.getByRole("button", { name });

describe("ChessBoard", () => {
  it("opens on the final position", () => {
    render(<ChessBoard fens={FENS} sans={SANS} />);
    expect(position()).toBe("fen-4");
    expect(screen.getByText(/2\. Nc6/)).toBeInTheDocument();
    expect(screen.getByText(/4\/4/)).toBeInTheDocument();
  });

  it("steps back one move at a time", async () => {
    render(<ChessBoard fens={FENS} sans={SANS} />);
    await userEvent.click(button("Previous move"));
    expect(position()).toBe("fen-3");
    expect(screen.getByText(/2\. Nf3/)).toBeInTheDocument();

    await userEvent.click(button("Previous move"));
    expect(position()).toBe("fen-2");
    expect(screen.getByText(/1\. e5/)).toBeInTheDocument();
  });

  it("steps forward again", async () => {
    render(<ChessBoard fens={FENS} sans={SANS} />);
    await userEvent.click(button("Start"));
    await userEvent.click(button("Next move"));
    expect(position()).toBe("fen-1");
    expect(screen.getByText(/1\. e4/)).toBeInTheDocument();
  });

  it("jumps to the start and back to the end", async () => {
    render(<ChessBoard fens={FENS} sans={SANS} />);
    await userEvent.click(button("Start"));
    expect(position()).toBe("fen-start");
    expect(screen.getByText(/start/)).toBeInTheDocument();
    expect(screen.getByText(/0\/4/)).toBeInTheDocument();

    await userEvent.click(button("End"));
    expect(position()).toBe("fen-4");
  });

  it("disables the controls that would run off either end", async () => {
    render(<ChessBoard fens={FENS} sans={SANS} />);
    expect(button("Next move")).toBeDisabled();
    expect(button("End")).toBeDisabled();
    expect(button("Previous move")).toBeEnabled();

    await userEvent.click(button("Start"));
    expect(button("Previous move")).toBeDisabled();
    expect(button("Start")).toBeDisabled();
    expect(button("Next move")).toBeEnabled();
  });

  it("numbers the moves in pairs, as chess does", async () => {
    render(<ChessBoard fens={FENS} sans={SANS} />);
    await userEvent.click(button("Start"));

    for (const expected of ["1. e4", "1. e5", "2. Nf3", "2. Nc6"]) {
      await userEvent.click(button("Next move"));
      expect(screen.getByText(new RegExp(expected.replace(".", "\\.")))).toBeInTheDocument();
    }
  });

  it("orients the board for the side that was played", () => {
    const { unmount } = render(<ChessBoard fens={FENS} sans={SANS} />);
    expect(boardOptions.current.boardOrientation).toBe("white");
    unmount();

    render(<ChessBoard fens={FENS} sans={SANS} orientation="black" />);
    expect(boardOptions.current.boardOrientation).toBe("black");
  });

  it("is a replay, not a game: dragging is off", () => {
    render(<ChessBoard fens={FENS} sans={SANS} />);
    expect(boardOptions.current.allowDragging).toBe(false);
    expect(boardOptions.current.showNotation).toBe(true);
  });

  it("stays left-to-right even on an Arabic page", () => {
    const { container } = render(<ChessBoard fens={FENS} sans={SANS} />);
    expect(container.firstElementChild).toHaveAttribute("dir", "ltr");
  });

  it("handles a game that is only a starting position", () => {
    render(<ChessBoard fens={["fen-start"]} sans={[]} />);
    expect(position()).toBe("fen-start");
    expect(button("Previous move")).toBeDisabled();
    expect(button("Next move")).toBeDisabled();
    expect(screen.getByText(/0\/0/)).toBeInTheDocument();
  });
});
