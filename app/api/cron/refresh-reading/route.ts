import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

// Hit daily by the Vercel cron (see vercel.json) to keep the Goodreads shelf
// fresh regardless of traffic. Invalidates the cached RSS so the next render of
// /reading re-fetches. Idempotent and cheap — no rebuild.
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  // Vercel auto-sends this header when a CRON_SECRET env var is set; the check
  // is skipped (endpoint open) until you add one.
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // "max" = stale-while-revalidate: mark stale now, refresh on the next visit.
  revalidateTag("goodreads", "max");
  return NextResponse.json({ revalidated: true, tag: "goodreads" });
}
