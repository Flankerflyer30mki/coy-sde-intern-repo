"use client";

import { animate, motion, useMotionValue, useTransform, type PanInfo } from "motion/react";
import { useImperativeHandle, useRef, type Ref } from "react";
import type { Profile, SwipeAction } from "@/lib/api-client";
import Avatar from "./Avatar";

export type SwipeCardHandle = { swipe: (action: SwipeAction) => void };

type Props = {
  profile: Profile;
  /** Only the top card can be dragged; the one behind it is just shown. */
  isTop: boolean;
  onSwiped: (profile: Profile, action: SwipeAction) => void;
  ref?: Ref<SwipeCardHandle>;
};

// How far (px) or how fast (px/s) a drag must go to count as a swipe.
const DISTANCE_THRESHOLD = 110;
const VELOCITY_THRESHOLD = 600;
const FLY_OUT_X = 600;

export default function SwipeCard({ profile, isTop, onSwiped, ref }: Props) {
  const x = useMotionValue(0);
  // Tilt and label opacity follow the drag position: the "clear feedback" while swiping.
  const rotate = useTransform(x, [-250, 250], [-14, 14]);
  const likeOpacity = useTransform(x, [20, DISTANCE_THRESHOLD], [0, 1]);
  const nopeOpacity = useTransform(x, [-DISTANCE_THRESHOLD, -20], [1, 0]);
  const leaving = useRef(false);

  function flyOut(action: SwipeAction) {
    if (leaving.current) return; // ignore double taps / drag + button at once
    leaving.current = true;
    animate(x, action === "like" ? FLY_OUT_X : -FLY_OUT_X, {
      duration: 0.3,
      ease: "easeOut",
    }).then(() => onSwiped(profile, action));
  }

  // Lets the Like / Pass buttons and arrow keys trigger the same animation as a drag.
  useImperativeHandle(ref, () => ({ swipe: flyOut }));

  function handleDragEnd(_: unknown, info: PanInfo) {
    const { offset, velocity } = info;
    if (offset.x > DISTANCE_THRESHOLD || velocity.x > VELOCITY_THRESHOLD) flyOut("like");
    else if (offset.x < -DISTANCE_THRESHOLD || velocity.x < -VELOCITY_THRESHOLD) flyOut("pass");
    else animate(x, 0, { type: "spring", stiffness: 500, damping: 30 }); // not far enough: snap back
  }

  return (
    <motion.article
      className="absolute inset-0 overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-black/5 touch-none"
      style={{ x, rotate, zIndex: isTop ? 2 : 1 }}
      drag={isTop ? "x" : false}
      onDragEnd={handleDragEnd}
      initial={false}
      animate={{ scale: isTop ? 1 : 0.95, y: isTop ? 0 : 12 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      aria-hidden={!isTop}
      aria-label={`${profile.name}, ${profile.age}`}
    >
      <div className="flex h-full flex-col">
        <div className="relative flex min-h-0 flex-1 items-center justify-center bg-rose-50 p-8">
          <Avatar
            src={profile.photo}
            alt=""
            className="aspect-square max-h-full w-full max-w-64 rounded-[2rem] shadow-md"
          />
        </div>
        <div className="px-5 pb-5 pt-4">
          <h2 className="text-2xl font-bold">
            {profile.name}, <span className="font-normal">{profile.age}</span>
          </h2>
          <p className="mt-0.5 text-sm text-zinc-500">📍 {profile.location}</p>
          <p className="mt-2 text-sm leading-snug text-zinc-700">{profile.bio}</p>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {profile.interests.map((interest) => (
              <li key={interest} className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-brand">
                {interest}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* LIKE / NOPE stamps fade in as you drag */}
      <motion.span
        style={{ opacity: likeOpacity }}
        className="pointer-events-none absolute left-5 top-6 -rotate-12 rounded-lg border-4 border-emerald-500 px-3 py-1 text-3xl font-black tracking-wider text-emerald-500"
      >
        LIKE
      </motion.span>
      <motion.span
        style={{ opacity: nopeOpacity }}
        className="pointer-events-none absolute right-5 top-6 rotate-12 rounded-lg border-4 border-rose-500 px-3 py-1 text-3xl font-black tracking-wider text-rose-500"
      >
        NOPE
      </motion.span>
    </motion.article>
  );
}
