"use client";

import { useState } from "react";
import { Chessboard } from "react-chessboard";

const BTN =
  "inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted transition-colors hover:text-foreground disabled:opacity-30";

export function ChessBoard({
  fens,
  sans,
  orientation = "white",
}: {
  fens: string[];
  sans: string[];
  orientation?: "white" | "black";
}) {
  const last = fens.length - 1;
  const [ply, setPly] = useState(last); // open on the final position

  return (
    <div dir="ltr" className="not-prose">
      <div className="mx-auto w-full max-w-sm">
        <Chessboard
          options={{
            id: "last-game",
            position: fens[ply],
            boardOrientation: orientation,
            allowDragging: false,
            showNotation: true,
            boardStyle: { borderRadius: "0.5rem" },
            darkSquareStyle: { backgroundColor: "#769656" },
            lightSquareStyle: { backgroundColor: "#eeeed2" },
          }}
        />
      </div>

      <div className="mx-auto mt-3 flex max-w-sm items-center justify-between gap-2">
        <div className="flex gap-1">
          <button
            type="button"
            className={BTN}
            onClick={() => setPly(0)}
            disabled={ply === 0}
            aria-label="Start"
          >
            ⏮
          </button>
          <button
            type="button"
            className={BTN}
            onClick={() => setPly((p) => Math.max(0, p - 1))}
            disabled={ply === 0}
            aria-label="Previous move"
          >
            ◀
          </button>
          <button
            type="button"
            className={BTN}
            onClick={() => setPly((p) => Math.min(last, p + 1))}
            disabled={ply === last}
            aria-label="Next move"
          >
            ▶
          </button>
          <button
            type="button"
            className={BTN}
            onClick={() => setPly(last)}
            disabled={ply === last}
            aria-label="End"
          >
            ⏭
          </button>
        </div>
        <span className="font-mono text-sm text-muted">
          {ply === 0 ? "start" : `${Math.ceil(ply / 2)}. ${sans[ply - 1]}`}
          <span className="text-faint">
            {" "}
            · {ply}/{last}
          </span>
        </span>
      </div>
    </div>
  );
}
