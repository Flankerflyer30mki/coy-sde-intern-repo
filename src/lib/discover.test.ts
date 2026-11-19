import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { CURRENT_USER_ID as ME, openDb, type DB } from "./db";
import { getFeed, getMatches, recordSwipe, SwipeError } from "./discover";
import { SEED_PROFILES } from "./seed";

const likedMe = SEED_PROFILES.filter((p) => p.swipedMe === "like").map((p) => p.id);
const passedMe = SEED_PROFILES.filter((p) => p.swipedMe === "pass").map((p) => p.id);
const neutral = SEED_PROFILES.filter((p) => !p.swipedMe).map((p) => p.id);

function expectSwipeError(fn: () => unknown, code: string) {
  try {
    fn();
  } catch (err) {
    expect(err).toBeInstanceOf(SwipeError);
    expect((err as SwipeError).code).toBe(code);
    return;
  }
  throw new Error(`expected SwipeError ${code}, but nothing was thrown`);
}

let db: DB;
beforeEach(() => {
  db = openDb(":memory:");
});

describe("seed data", () => {
  it("has at least 30 complete profiles", () => {
    expect(SEED_PROFILES.length).toBeGreaterThanOrEqual(30);
    for (const p of getFeed(db, ME)) {
      expect(p.name).toBeTruthy();
      expect(p.age).toBeGreaterThanOrEqual(18);
      expect(p.photo).toMatch(/^https:\/\//);
      expect(p.bio).toBeTruthy();
      expect(p.location).toBeTruthy();
      expect(p.interests.length).toBeGreaterThan(0);
    }
  });

  it("includes profiles that already liked the user, so a demo can produce matches", () => {
    expect(likedMe.length).toBeGreaterThan(0);
    expect(neutral.length).toBeGreaterThan(0);
  });

  it("does not seed twice when the database is reopened", () => {
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "coy-")), "test.db");
    openDb(file).close();
    const reopened = openDb(file);
    expect(getFeed(reopened, ME)).toHaveLength(SEED_PROFILES.length);
    reopened.close();
  });
});

describe("GET /feed logic", () => {
  it("returns every other profile before any swipes, never the user themselves", () => {
    const feed = getFeed(db, ME);
    expect(feed).toHaveLength(SEED_PROFILES.length);
    expect(feed.map((p) => p.id)).not.toContain(ME);
  });

  it("never returns a profile the user already liked or passed", () => {
    recordSwipe(db, ME, neutral[0], "like");
    recordSwipe(db, ME, neutral[1], "pass");
    const ids = getFeed(db, ME).map((p) => p.id);
    expect(ids).not.toContain(neutral[0]);
    expect(ids).not.toContain(neutral[1]);
    expect(ids).toHaveLength(SEED_PROFILES.length - 2);
  });

  it("is empty once the user has swiped on everyone", () => {
    for (const p of getFeed(db, ME)) recordSwipe(db, ME, p.id, "pass");
    expect(getFeed(db, ME)).toEqual([]);
  });
});

describe("privacy: never reveal who liked the user unless it is mutual", () => {
  it("feed items expose only public profile fields", () => {
    for (const p of getFeed(db, ME)) {
      expect(Object.keys(p).sort()).toEqual(
        ["age", "bio", "id", "interests", "location", "name", "photo"],
      );
    }
  });

  it("feed content and order are identical whether or not someone liked the user", () => {
    const before = getFeed(db, ME);
    // Everyone left in the database now likes the user...
    db.prepare("INSERT OR REPLACE INTO swipes (swiper_id, target_id, action) SELECT id, ?, 'like' FROM profiles WHERE id <> ?")
      .run(ME, ME);
    // ...and nothing about the feed changes.
    expect(getFeed(db, ME)).toEqual(before);
  });

  it("someone liking the user does not create a match on its own", () => {
    expect(getMatches(db, ME)).toEqual([]);
  });

  it("passing on someone who liked the user does not reveal the like", () => {
    expect(recordSwipe(db, ME, likedMe[0], "pass")).toEqual({ match: false });
    expect(getMatches(db, ME)).toEqual([]);
  });

  it("a like response looks the same for 'they passed on you' and 'they never swiped'", () => {
    expect(recordSwipe(db, ME, passedMe[0], "like")).toEqual({ match: false });
    expect(recordSwipe(db, ME, neutral[0], "like")).toEqual({ match: false });
  });
});

describe("POST /swipe logic", () => {
  it("liking someone who already liked the user creates a match and returns their profile", () => {
    const result = recordSwipe(db, ME, likedMe[0], "like");
    expect(result.match).toBe(true);
    if (result.match) expect(result.profile.id).toBe(likedMe[0]);
  });

  it("liking someone who has not liked the user is not a match", () => {
    expect(recordSwipe(db, ME, neutral[0], "like")).toEqual({ match: false });
  });

  it("a pass is never a match", () => {
    expect(recordSwipe(db, ME, neutral[0], "pass")).toEqual({ match: false });
  });

  it("repeating the same swipe (double tap / retry) gives the same answer and stores one row", () => {
    const first = recordSwipe(db, ME, likedMe[0], "like");
    const second = recordSwipe(db, ME, likedMe[0], "like");
    expect(second).toEqual(first);
    const { n } = db.prepare("SELECT COUNT(*) AS n FROM swipes WHERE swiper_id = ? AND target_id = ?")
      .get(ME, likedMe[0]) as { n: number };
    expect(n).toBe(1);
    expect(getMatches(db, ME)).toHaveLength(1);
  });

  it("the first decision is final: a pass cannot be changed into a like", () => {
    recordSwipe(db, ME, likedMe[0], "pass");
    expectSwipeError(() => recordSwipe(db, ME, likedMe[0], "like"), "ALREADY_SWIPED");
    expect(getMatches(db, ME)).toEqual([]);
  });

  it("rejects an action other than like or pass", () => {
    expectSwipeError(() => recordSwipe(db, ME, neutral[0], "superlike"), "INVALID_ACTION");
  });

  it("rejects a profile id that does not exist", () => {
    expectSwipeError(() => recordSwipe(db, ME, "nope", "like"), "NOT_FOUND");
  });

  it("rejects swiping on yourself", () => {
    expectSwipeError(() => recordSwipe(db, ME, ME, "like"), "SELF_SWIPE");
  });

  it("stores nothing when a swipe is rejected", () => {
    expectSwipeError(() => recordSwipe(db, ME, "nope", "like"), "NOT_FOUND");
    expect(getFeed(db, ME)).toHaveLength(SEED_PROFILES.length);
  });
});

describe("GET /matches logic", () => {
  it("lists only mutual likes", () => {
    recordSwipe(db, ME, likedMe[0], "like"); // mutual
    recordSwipe(db, ME, likedMe[1], "like"); // mutual
    recordSwipe(db, ME, neutral[0], "like"); // one-sided
    recordSwipe(db, ME, passedMe[0], "like"); // they passed
    recordSwipe(db, ME, likedMe[2], "pass"); // they liked, user passed

    const ids = getMatches(db, ME).map((m) => m.profile.id).sort();
    expect(ids).toEqual([likedMe[0], likedMe[1]].sort());
  });

  it("includes when the match happened", () => {
    recordSwipe(db, ME, likedMe[0], "like");
    const [m] = getMatches(db, ME);
    expect(Number.isNaN(Date.parse(m.matchedAt))).toBe(false);
  });
});

describe("persistence", () => {
  it("swipes and matches survive closing and reopening the database", () => {
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "coy-")), "test.db");
    const first = openDb(file);
    recordSwipe(first, ME, likedMe[0], "like");
    recordSwipe(first, ME, neutral[0], "pass");
    first.close();

    const reopened = openDb(file);
    expect(getMatches(reopened, ME).map((m) => m.profile.id)).toEqual([likedMe[0]]);
    expect(getFeed(reopened, ME).map((p) => p.id)).not.toContain(neutral[0]);
    reopened.close();
  });
});
