"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ApiError,
  fetchFeed,
  postSwipe,
  type Profile,
  type SwipeAction,
} from "@/lib/api-client";
import MatchModal from "./MatchModal";
import SwipeCard, { type SwipeCardHandle } from "./SwipeCard";

type LoadState = "loading" | "ready" | "error";

export default function DiscoverDeck() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [match, setMatch] = useState<Profile | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const topCard = useRef<SwipeCardHandle>(null);

  const loadFeed = useCallback(() => {
    fetchFeed()
      .then((feed) => {
        setProfiles(feed);
        setLoadState("ready");
      })
      .catch(() => setLoadState("error"));
  }, []);

  useEffect(loadFeed, [loadFeed]);

  // Optimistic swipe: the card is already gone from the screen; the server is told in the background.
  const handleSwiped = useCallback((profile: Profile, action: SwipeAction) => {
    setProfiles((current) => current.filter((p) => p.id !== profile.id));

    postSwipe(profile.id, action)
      .then((result) => {
        if (result.match) setMatch(result.profile);
      })
      .catch((err) => {
        // 404: the profile no longer exists. 409: the server already has a swipe for it.
        // Either way the card should stay gone.
        if (err instanceof ApiError && (err.status === 404 || err.status === 409)) return;
        // Anything else (offline, server error): put the card back on top so the swipe isn't silently lost.
        setProfiles((current) => [profile, ...current.filter((p) => p.id !== profile.id)]);
        setToast("Couldn't save that swipe. Please try again.");
      });
  }, []);

  // Auto-hide the error message.
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Arrow keys on desktop: ← pass, → like.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (match) return;
      if (e.key === "ArrowRight") topCard.current?.swipe("like");
      if (e.key === "ArrowLeft") topCard.current?.swipe("pass");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [match]);

  const closeMatch = useCallback(() => setMatch(null), []);

  if (loadState === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center" aria-live="polite">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-100 border-t-brand" />
        <span className="sr-only">Loading profiles…</span>
      </div>
    );
  }

  if (loadState === "error") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
        <p className="text-zinc-600">Couldn&apos;t load profiles.</p>
        <button
          onClick={() => {
            setLoadState("loading");
            loadFeed();
          }}
          className="rounded-full bg-brand px-5 py-2 font-semibold text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  // Only the top two cards are rendered: the one you swipe and the one peeking behind it.
  const visible = profiles.slice(0, 2);
  const isEmpty = profiles.length === 0;

  return (
    <div className="flex flex-1 flex-col px-4 pb-4">
      <div className="relative flex-1">
        {isEmpty ? (
          <EmptyState />
        ) : (
          visible
            .map((profile, i) => (
              <SwipeCard
                key={profile.id}
                ref={i === 0 ? topCard : undefined}
                profile={profile}
                isTop={i === 0}
                onSwiped={handleSwiped}
              />
            ))
            .reverse() // render the back card first so the top card sits above it
        )}
      </div>

      {!isEmpty && (
        <div className="mt-4 flex items-center justify-center gap-8">
          <ActionButton label="Pass" onClick={() => topCard.current?.swipe("pass")} className="text-rose-500">
            ✕
          </ActionButton>
          <ActionButton label="Like" onClick={() => topCard.current?.swipe("like")} className="text-emerald-500">
            ♥
          </ActionButton>
        </div>
      )}

      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            // Top of the screen and click-through, so it never blocks the Like / Pass buttons.
            className="pointer-events-none fixed left-1/2 top-16 z-40 w-max max-w-[90vw] -translate-x-1/2 rounded-full bg-zinc-900 px-4 py-2 text-sm text-white shadow-lg"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {match && <MatchModal profile={match} onClose={closeMatch} />}
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  className,
  children,
}: {
  label: string;
  onClick: () => void;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={`${label} (${label === "Like" ? "→" : "←"})`}
      className={`flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl shadow-lg ring-1 ring-black/5 transition hover:scale-105 active:scale-95 ${className}`}
    >
      {children}
    </button>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
      <span className="text-5xl" aria-hidden>
        🌙
      </span>
      <h2 className="text-xl font-bold">You&apos;re all caught up</h2>
      <p className="text-zinc-500">You&apos;ve seen everyone for now. Check back later for new people.</p>
      <Link href="/discover/matches" className="mt-2 rounded-full bg-brand px-5 py-2 font-semibold text-white">
        See your matches
      </Link>
    </div>
  );
}
