"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { fetchMatches, type Match } from "@/lib/api-client";
import Avatar from "./Avatar";

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/** "just now", "5 minutes ago", "yesterday"… */
function timeAgo(iso: string): string {
  const seconds = Math.round((Date.parse(iso) - Date.now()) / 1000);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit);
  }
  return "just now";
}

export default function MatchesList() {
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(() => {
    fetchMatches()
      .then((m) => {
        setMatches(m);
        setFailed(false);
      })
      .catch(() => setFailed(true));
  }, []);

  useEffect(load, [load]);

  if (failed) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
        <p className="text-zinc-600">Couldn&apos;t load your matches.</p>
        <button onClick={load} className="rounded-full bg-brand px-5 py-2 font-semibold text-white">
          Try again
        </button>
      </div>
    );
  }

  if (!matches) {
    return (
      <div className="flex flex-1 items-center justify-center" aria-live="polite">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-100 border-t-brand" />
        <span className="sr-only">Loading matches…</span>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
        <span className="text-5xl" aria-hidden>
          💌
        </span>
        <h2 className="text-xl font-bold">No matches yet</h2>
        <p className="text-zinc-500">When someone you like likes you back, they&apos;ll show up here.</p>
        <Link href="/discover" className="mt-2 rounded-full bg-brand px-5 py-2 font-semibold text-white">
          Start swiping
        </Link>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-zinc-100 px-4">
      {matches.map(({ profile, matchedAt }) => (
        <li key={profile.id} className="flex items-center gap-3 py-3">
          <Avatar seed={profile.id} src={profile.photo} alt="" className="h-14 w-14 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">
              {profile.name}, <span className="font-normal">{profile.age}</span>
            </p>
            <p className="truncate text-sm text-zinc-500">📍 {profile.location}</p>
          </div>
          <span className="shrink-0 text-xs text-zinc-400">{timeAgo(matchedAt)}</span>
        </li>
      ))}
    </ul>
  );
}
