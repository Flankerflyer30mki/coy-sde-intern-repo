"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import type { Profile } from "@/lib/api-client";
import Avatar from "./Avatar";

type Props = { profile: Profile; onClose: () => void };

export default function MatchModal({ profile, onClose }: Props) {
  const closeButton = useRef<HTMLButtonElement>(null);

  // Focus the main button and let Escape close the dialog (keyboard users).
  useEffect(() => {
    closeButton.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="match-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-linear-to-b from-brand to-rose-600 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="flex w-full max-w-sm flex-col items-center text-center text-white"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.05 }}
      >
        <h2 id="match-title" className="text-4xl font-black italic tracking-tight">
          It&apos;s a match!
        </h2>
        <p className="mt-2 text-white/90">You and {profile.name} like each other.</p>

        <div className="relative mt-8">
          <Avatar
            seed={profile.id}
            src={profile.photo}
            alt={profile.name}
            className="h-40 w-40 rounded-full border-4 border-white shadow-2xl"
          />
          <span className="absolute -bottom-2 -right-2 flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl shadow-lg" aria-hidden>
            💘
          </span>
        </div>

        <div className="mt-10 flex w-full flex-col gap-3">
          <button
            ref={closeButton}
            onClick={onClose}
            className="rounded-full bg-white py-3 font-semibold text-brand shadow-lg active:scale-[0.98]"
          >
            Keep swiping
          </button>
          <Link
            href="/discover/matches"
            className="rounded-full border-2 border-white/80 py-3 font-semibold text-white active:scale-[0.98]"
          >
            See your matches
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
