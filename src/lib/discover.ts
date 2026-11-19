import type { DB } from "./db";

export type SwipeAction = "like" | "pass";

/** The only profile fields ever sent to the client. Nothing about who liked whom. */
export type Profile = {
  id: string;
  name: string;
  age: number;
  photo: string;
  bio: string;
  location: string;
  interests: string[];
  /** Hinge-style prompt, e.g. { question: "A perfect Sunday", answer: "…" }. */
  prompt: { question: string; answer: string };
};

export type Match = { profile: Profile; matchedAt: string };

export type SwipeResult = { match: false } | { match: true; profile: Profile };

export type SwipeErrorCode =
  | "INVALID_ACTION"
  | "NOT_FOUND"
  | "SELF_SWIPE"
  | "ALREADY_SWIPED";

export class SwipeError extends Error {
  constructor(public code: SwipeErrorCode, message: string) {
    super(message);
    this.name = "SwipeError";
  }
}

type ProfileRow = Omit<Profile, "interests" | "prompt"> & {
  interests: string;
  prompt_question: string;
  prompt_answer: string;
};

const PROFILE_COLUMNS =
  "p.id, p.name, p.age, p.photo, p.bio, p.location, p.interests, p.prompt_question, p.prompt_answer";

function toProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    name: row.name,
    age: row.age,
    photo: row.photo,
    bio: row.bio,
    location: row.location,
    interests: JSON.parse(row.interests) as string[],
    prompt: { question: row.prompt_question, answer: row.prompt_answer },
  };
}

/**
 * Profiles the user has not swiped on yet.
 *
 * Privacy: the query never reads other people's swipes on the user, so neither
 * the content nor the ORDER of the feed can reveal who liked them.
 */
export function getFeed(db: DB, userId: string): Profile[] {
  const rows = db
    .prepare(
      `SELECT ${PROFILE_COLUMNS}
         FROM profiles p
        WHERE p.id <> @userId
          AND NOT EXISTS (
                SELECT 1 FROM swipes s
                 WHERE s.swiper_id = @userId AND s.target_id = p.id)
        ORDER BY p.id`,
    )
    .all({ userId }) as ProfileRow[];
  return rows.map(toProfile);
}

/**
 * Records a like or pass and reports whether it created a match.
 *
 * Privacy: this response is the ONLY place the user can learn that someone
 * liked them, and only at the moment their own like completes the pair.
 */
export function recordSwipe(
  db: DB,
  userId: string,
  targetId: string,
  action: string,
): SwipeResult {
  if (action !== "like" && action !== "pass") {
    throw new SwipeError("INVALID_ACTION", `action must be "like" or "pass"`);
  }
  if (targetId === userId) {
    throw new SwipeError("SELF_SWIPE", "you cannot swipe on yourself");
  }

  // A transaction so the "already swiped?" check and the insert can't interleave
  // with another request for the same pair.
  return db.transaction((): SwipeResult => {
    const target = db
      .prepare(`SELECT ${PROFILE_COLUMNS} FROM profiles p WHERE p.id = ?`)
      .get(targetId) as ProfileRow | undefined;
    if (!target) throw new SwipeError("NOT_FOUND", "profile not found");

    const existing = db
      .prepare("SELECT action FROM swipes WHERE swiper_id = ? AND target_id = ?")
      .get(userId, targetId) as { action: SwipeAction } | undefined;

    if (existing) {
      // The same swipe again (double tap, network retry): answer as before, store nothing.
      // A different action: the first decision is final, so refuse.
      if (existing.action !== action) {
        throw new SwipeError("ALREADY_SWIPED", "you already swiped on this profile");
      }
    } else {
      db.prepare("INSERT INTO swipes (swiper_id, target_id, action) VALUES (?, ?, ?)")
        .run(userId, targetId, action);
    }

    if (action === "pass") return { match: false };

    const likedBack = db
      .prepare(
        "SELECT 1 FROM swipes WHERE swiper_id = ? AND target_id = ? AND action = 'like'",
      )
      .get(targetId, userId);

    return likedBack ? { match: true, profile: toProfile(target) } : { match: false };
  })();
}

/**
 * DEMO ONLY: erases the user's own swipes so the demo can be replayed.
 *
 * Other people's swipes (the seeded "already liked you" data) are kept, so the
 * same matches can happen again. Matches disappear on their own because they
 * are derived from swipes. A real app would not offer this: it would undo the
 * rule that a swiped profile never appears again.
 */
export function resetSwipes(db: DB, userId: string): number {
  return db.prepare("DELETE FROM swipes WHERE swiper_id = ?").run(userId).changes;
}

/** Mutual matches only: both sides liked each other. Newest first. */
export function getMatches(db: DB, userId: string): Match[] {
  const rows = db
    .prepare(
      `SELECT ${PROFILE_COLUMNS},
              MAX(mine.created_at, theirs.created_at) AS matchedAt
         FROM swipes mine
         JOIN swipes theirs
           ON theirs.swiper_id = mine.target_id
          AND theirs.target_id = mine.swiper_id
          AND theirs.action = 'like'
         JOIN profiles p ON p.id = mine.target_id
        WHERE mine.swiper_id = ? AND mine.action = 'like'
        ORDER BY matchedAt DESC, p.id`,
    )
    .all(userId) as (ProfileRow & { matchedAt: string })[];
  return rows.map(({ matchedAt, ...row }) => ({ profile: toProfile(row), matchedAt }));
}
