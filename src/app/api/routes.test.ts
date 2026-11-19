import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

// connection() only works inside a real Next.js request; in tests it's a no-op.
vi.mock("next/server", () => ({ connection: async () => {} }));

process.env.COY_DB_FILE = ":memory:";

const { resetDbForTests } = await import("@/lib/db");
const { SEED_PROFILES } = await import("@/lib/seed");
const feedRoute = await import("./feed/route");
const swipeRoute = await import("./swipe/route");
const matchesRoute = await import("./matches/route");
const resetRoute = await import("./reset/route");

const liker = SEED_PROFILES.find((p) => p.swipedMe === "like")!.id;
const neutral = SEED_PROFILES.find((p) => !p.swipedMe)!.id;

function swipe(body: unknown) {
  return swipeRoute.POST(
    new Request("http://test/api/swipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

beforeEach(() => resetDbForTests()); // fresh in-memory database per test
afterAll(() => resetDbForTests());

describe("GET /api/feed", () => {
  it("returns 200 with all unswiped profiles and is never cached", async () => {
    const res = await feedRoute.GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    const { profiles } = await res.json();
    expect(profiles).toHaveLength(SEED_PROFILES.length);
  });

  it("reflects a swipe on the very next request", async () => {
    await swipe({ profileId: neutral, action: "pass" });
    const { profiles } = await (await feedRoute.GET()).json();
    expect(profiles.map((p: { id: string }) => p.id)).not.toContain(neutral);
  });

  it("response body never mentions swipes or likes", async () => {
    const text = await (await feedRoute.GET()).text();
    expect(text).not.toMatch(/liked|swiped|likes|action/i);
  });
});

describe("POST /api/swipe", () => {
  it("returns { match: true, profile } when the like is mutual", async () => {
    const res = await swipe({ profileId: liker, action: "like" });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.match).toBe(true);
    expect(body.profile.id).toBe(liker);
  });

  it("returns exactly { match: false } when it is not", async () => {
    const res = await swipe({ profileId: neutral, action: "like" });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ match: false });
  });

  it.each([
    ["malformed JSON", "{not json", 400, "INVALID_JSON"],
    ["missing profileId", { action: "like" }, 400, "INVALID_PROFILE_ID"],
    ["non-string profileId", { profileId: 42, action: "like" }, 400, "INVALID_PROFILE_ID"],
    ["missing action", { profileId: "p01" }, 400, "INVALID_ACTION"],
    ["unknown action", { profileId: "p01", action: "superlike" }, 400, "INVALID_ACTION"],
    ["swiping on yourself", { profileId: "me", action: "like" }, 400, "SELF_SWIPE"],
    ["unknown profile", { profileId: "nobody", action: "like" }, 404, "NOT_FOUND"],
    ["JSON null body", "null", 400, "INVALID_PROFILE_ID"],
  ])("rejects %s", async (_label, body, status, code) => {
    const res = await swipe(body);
    expect(res.status).toBe(status);
    expect((await res.json()).error.code).toBe(code);
  });

  it("returns 409 when changing a pass into a like", async () => {
    await swipe({ profileId: liker, action: "pass" });
    const res = await swipe({ profileId: liker, action: "like" });
    expect(res.status).toBe(409);
    expect((await res.json()).error.code).toBe("ALREADY_SWIPED");
  });
});

describe("GET /api/matches", () => {
  it("is empty at first, even though some profiles already liked the user", async () => {
    const { matches } = await (await matchesRoute.GET()).json();
    expect(matches).toEqual([]);
  });

  it("lists a match after a mutual like", async () => {
    await swipe({ profileId: liker, action: "like" });
    await swipe({ profileId: neutral, action: "like" });
    const res = await matchesRoute.GET();
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    const { matches } = await res.json();
    expect(matches.map((m: { profile: { id: string } }) => m.profile.id)).toEqual([liker]);
  });
});

describe("POST /api/reset (demo only)", () => {
  it("brings swiped profiles back and clears matches", async () => {
    await swipe({ profileId: liker, action: "like" });
    await swipe({ profileId: neutral, action: "pass" });

    const res = await resetRoute.POST();
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    expect(await res.json()).toEqual({ reset: true, removedSwipes: 2 });

    const { profiles } = await (await feedRoute.GET()).json();
    expect(profiles).toHaveLength(SEED_PROFILES.length);
    const { matches } = await (await matchesRoute.GET()).json();
    expect(matches).toEqual([]);
  });
});
