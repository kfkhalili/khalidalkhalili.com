"use client";

import { useEffect, useState } from "react";
import { SHARE_TARGETS, shareIntent, type ShareTarget } from "@/lib/share";
import { useHydrated } from "@/components/use-hydrated";
import type { Dictionary } from "@/lib/i18n";

type ShareLabels = Dictionary["share"];

const ICON = {
  linkedin:
    "M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.72C24 .77 23.2 0 22.22 0z",
  x: "M18.9 1.7h3.4l-7.4 8.4 8.7 11.5h-6.8l-5.3-7-6.1 7H1.9l7.9-9-8.4-10.9h7l4.8 6.4 5.7-6.4zm-1.2 18h1.9L6.5 3.6H4.5l13.2 16.1z",
  whatsapp:
    "M17.5 14.4c-.3-.2-1.8-.9-2-1-.3-.1-.5-.2-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.4.1-.6l.5-.5c.1-.2.2-.3.3-.5 0-.2 0-.4-.1-.5L9.2 6.9c-.2-.5-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.2-.6-.4zM12 21.6h-.1c-1.7 0-3.4-.5-4.9-1.4l-.3-.2-3.7 1 1-3.6-.2-.4A9.5 9.5 0 0 1 2.4 12 9.6 9.6 0 0 1 12 2.4a9.5 9.5 0 0 1 6.8 2.8A9.5 9.5 0 0 1 21.6 12 9.6 9.6 0 0 1 12 21.6zM20.5 3.5A11.5 11.5 0 0 0 12 0C5.6 0 .4 5.2.4 11.6c0 2 .5 4 1.6 5.8L.3 24l6.7-1.8a11.6 11.6 0 0 0 5 1.3c6.4 0 11.6-5.2 11.6-11.6 0-3.1-1.2-6-3.4-8.2z",
} as const satisfies Record<ShareTarget, string>;

/** One 16px monochrome mark, same weight as the footer's LinkedIn glyph. */
function Glyph({ path }: { path: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d={path} />
    </svg>
  );
}

const linkClass =
  "text-faint transition-colors hover:text-foreground focus-visible:text-foreground";

/**
 * Sharing, without a toolbar. Phones get the one button that opens the OS sheet
 * (which already lists every app the reader has); everywhere else gets a quiet
 * row of marks. `navigator.share` is only known after mount, so the row is the
 * server-rendered default and the button replaces it on capable clients.
 */
export function ShareRow({
  url,
  title,
  labels,
}: {
  url: string;
  title: string;
  labels: ShareLabels;
}) {
  const [copied, setCopied] = useState(false);

  // Whether the OS sheet exists can't be known while rendering on the server,
  // so the row is the server-rendered default and the button replaces it once
  // hydrated on a client that has one.
  const canShare = useHydrated() && typeof navigator.share === "function";

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // No clipboard permission (or an insecure origin): leave the label alone
      // rather than claiming a copy that didn't happen.
    }
  }

  return (
    <div className="mt-16 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-border pt-6">
      <span className="font-mono text-sm text-faint">{labels.label}</span>

      {canShare ? (
        <button
          type="button"
          onClick={() => navigator.share({ title, url }).catch(() => {})}
          className={`inline-flex items-center gap-2 font-mono text-sm ${linkClass}`}
        >
          <ShareIcon />
          {labels.native}
        </button>
      ) : (
        <div className="flex items-center gap-4">
          {SHARE_TARGETS.map((target) => (
            <a
              key={target}
              href={shareIntent(target, { url, title })}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={labels[target]}
              title={labels[target]}
              className={linkClass}
            >
              <Glyph path={ICON[target]} />
            </a>
          ))}

          <button
            type="button"
            onClick={copy}
            aria-label={copied ? labels.copied : labels.copy}
            title={copied ? labels.copied : labels.copy}
            className={copied ? "text-accent-strong" : linkClass}
          >
            {copied ? <CheckIcon /> : <LinkIcon />}
          </button>
        </div>
      )}

      {/* Announced on copy without moving the row's layout. */}
      <span aria-live="polite" className="sr-only">
        {copied ? labels.copied : ""}
      </span>
    </div>
  );
}

function LinkIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
      <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
      <path d="M16 6l-4-4-4 4" />
      <path d="M12 2v14" />
    </svg>
  );
}
