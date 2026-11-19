# Coy · Discover tab

A swipe-based **Discover** tab for Coy, built as a standalone Next.js app for the SDE intern assignment.
You swipe right to like and left to pass, and a match only happens when both people liked each other. The app never reveals who liked you unless the like is mutual.

- **Part A** (two feature suggestions): see [PART_A.md](PART_A.md)
- **Part B** (this app): everything below

---

## Quick start

Requires **Node.js 22 or newer** (tested on Node 24).

```bash
npm install
npm run dev
```

Open **http://localhost:3000/discover**. It's built mobile-first, so it looks best in a phone-sized window (Chrome: `F12`, then `Ctrl+Shift+M`).

| Command | What it does |
|---|---|
| `npm run dev` | Start the app at http://localhost:3000 |
| `npm test` | Run the 44 backend tests |
| `npm run db:reset` | Delete the whole database and re-seed (restart the dev server afterwards). For a quick replay, use the in-app **Start over** button instead. |
| `npm run build && npm start` | Production build |

No accounts, keys or external services are needed. The database is created and seeded automatically on the first request.

---

## Demo walkthrough

1. Open **Discover**. Cards appear one at a time.
2. **Drag** a card (touch or mouse), or use the **✕ / ♥ buttons** or the **← / → arrow keys**. The card tilts and shows a LIKE or NOPE stamp as you drag. A short drag snaps back.
3. The 2nd card, **Rohan**, has already liked you. Like him and you get **"It's a match!"**.
4. Tap **💘 Matches** to see your mutual matches.
5. **Reload the page.** Swiped profiles never come back, and matches stay.
6. Swipe through everyone to reach the **"You're all caught up"** empty state.
7. Tap **↺ Start over** (demo only) to clear your swipes and matches and run it again from the first card.

Seeded profiles that have already liked you (so a demo can produce matches): **Rohan, Sana, Riya, Dev, Aarav, Karan, Myra, Ishaan** (p02, p07, p11, p16, p20, p24, p29, p32). Three profiles have passed on you, and the other 21 haven't swiped. Nothing in the app tells you which is which. That's the point.

---

## How it's built

Everything is one Next.js app: React pages for the UI and Next.js API routes for the backend, so there's one server, one port, and no CORS.

```
Browser (React)        cards · drag/buttons · match screen · matches list
     │  fetch /api/...
API routes             check the request shape → call the logic → map errors to HTTP statuses
     │  function calls
Logic  (discover.ts)   getFeed · recordSwipe · getMatches    ← all privacy rules live here
     │  SQL
SQLite                 profiles · swipes   (matches are derived, never stored)
```

| Layer | Files |
|---|---|
| Pages | `src/app/page.tsx` (Home, blank as requested) · `src/app/discover/` · `src/app/discover/matches/` |
| Components | `src/components/`: `DiscoverDeck`, `SwipeCard`, `MatchModal`, `MatchesList`, `TabBar` |
| API routes | `src/app/api/feed`, `/swipe`, `/matches` |
| Logic | `src/lib/discover.ts` |
| Database | `src/lib/db.ts` (schema, connection) · `src/lib/seed.ts` (32 profiles) |
| Tests | `src/lib/discover.test.ts` · `src/app/api/routes.test.ts` |

**Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Motion (drag and animations), SQLite via `better-sqlite3`, Vitest.

---

## API

The brief's exact paths (`/feed`, `/swipe`, `/matches`) work, and so do the same routes under `/api/`.

### `GET /feed`
Profiles the user hasn't swiped on yet.
```json
{ "profiles": [ { "id": "p01", "name": "Aanya", "age": 21, "photo": "/avatar-placeholder.svg", "bio": "…", "location": "Delhi University", "interests": ["Music", "Chai", "Poetry"], "prompt": { "question": "A perfect Sunday", "answer": "…" } } ] }
```

### `POST /swipe`
Body: `{ "profileId": "p02", "action": "like" | "pass" }`
```json
{ "match": true, "profile": { "id": "p02", "name": "Rohan", … } }
{ "match": false }
```

| Status | Code | When |
|---|---|---|
| 400 | `INVALID_JSON` | Body isn't valid JSON |
| 400 | `INVALID_PROFILE_ID` | `profileId` missing or not a string |
| 400 | `INVALID_ACTION` | `action` isn't `like` or `pass` |
| 400 | `SELF_SWIPE` | Swiping on yourself |
| 404 | `NOT_FOUND` | No such profile (e.g. deleted after the feed loaded) |
| 409 | `ALREADY_SWIPED` | Changing an earlier decision (pass → like) |

Errors look like `{ "error": { "code": "NOT_FOUND", "message": "profile not found" } }`.

### `GET /matches`
Mutual matches, newest first.
```json
{ "matches": [ { "profile": { … }, "matchedAt": "2026-11-19T10:15:32.022Z" } ] }
```

### `POST /api/reset` (demo only)
Erases the user's own swipes so the demo can be replayed. This is what the **Start over** button calls. Other people's seeded swipes are kept, so the same matches can happen again.
```json
{ "reset": true, "removedSwipes": 32 }
```
A real app wouldn't expose this, because it undoes "a swiped profile never appears again". It's here only so reviewers can rerun the demo without the terminal.

Try it:
```bash
curl localhost:3000/feed
curl -X POST localhost:3000/swipe -H "Content-Type: application/json" -d '{"profileId":"p02","action":"like"}'
curl localhost:3000/matches
```

All responses send `Cache-Control: no-store`, because the data is personal and changes after every swipe.

---

## Privacy: never reveal who liked you unless it's mutual

This is Coy's core promise, so it's enforced on the server, not just hidden in the UI:

- **Only one place reads "who liked me".** It's the match check in `recordSwipe`, and it only runs right after *you* like someone. No other code path looks at other people's swipes on you.
- **The feed can't leak it, not even through order.** The feed query never touches other people's swipes, and it's sorted by profile id. The seeded likers are spread through the list so the first cards aren't all likers.
- **A like gets the same answer whether they passed on you or never swiped.** Both return exactly `{ "match": false }`, so liking someone can't be used to find out they passed.
- **Passing on someone who liked you reveals nothing.** No match, and nothing in any later response.
- **Responses only carry public profile fields.** There's no `likedYou` flag or similar anywhere.

These rules have their own tests. For example, one test makes *every* profile like the user and checks that the feed's content and order don't change at all. I confirmed the tests catch real bugs by temporarily sorting likers to the top of the feed: the order test failed straight away.

---

## Design decisions

**Data model**
- Two tables: `profiles` and `swipes (swiper_id, target_id, action, created_at)`. The logged-in user is a fixed profile with id `me`, since the brief says no auth is needed.
- **Matches are derived, not stored.** A match is just two likes pointing at each other, so a query finds them, and there's no separate table that could drift out of sync with the swipes.
- **"A swiped profile never appears again" is enforced by the database.** The primary key `(swiper_id, target_id)` makes a second swipe on the same person impossible, even if application code had a bug. CHECK constraints reject unknown actions and self-swipes.

**Swipe behaviour**
- **Repeating the same swipe is safe.** A double tap or network retry gets the same answer and stores nothing new.
- **The first decision is final.** Changing pass → like returns 409.
- **Each swipe runs in a transaction**, so two simultaneous requests for the same pair can't both get through.
- **The server validates everything,** even though the UI only ever sends valid swipes. The API is public, so a profile can be deleted mid-session and anyone can send a hand-made request.

**Frontend**
- **Optimistic swipes:** the card flies away instantly and the request runs in the background. If saving fails (e.g. offline), the card comes back with a "Couldn't save that swipe" message, so a swipe is never silently lost.
- A drag counts as a swipe past **110 px or a fast flick**, as in other swipe apps. Buttons, arrow keys and drag share one animation path, and a card ignores a second swipe once it's leaving.
- Only the top two cards are rendered.
- Photos are a **plain human-silhouette placeholder** served by the app itself (`public/avatar-placeholder.svg`), tinted per profile. No real people's photos are used, and the demo works offline.
- **Card layout:** the details take the height their text needs and the photo fills the rest, so there's no empty gap on any screen size. Each profile also has a Hinge-style **prompt** ("A perfect Sunday…"), placed below the required fields so it's the one that gets squeezed on very small screens. Short screens (under 700px, e.g. iPhone SE) get tighter type and spacing.
- **Schema upgrades are handled:** a database created before a column existed gets it added on startup and filled in, without touching swipes. In dev, a schema version bump makes the server reopen its cached connection after a hot reload.

**Two things worth knowing**
- **GET routes call `connection()`.** With Next.js 16's Cache Components, a GET route can be pre-rendered once at build time. `better-sqlite3` is synchronous, so its queries would run during the build and the feed would be frozen. `connection()` makes the routes run per request; the build output marks them `ƒ (Dynamic)`.
- **The database lives outside the project folder,** at `~/.coy-discover/coy.db` (the server logs the path on startup; set `COY_DB_FILE` to change it). With the file inside the project, `next dev`'s file watcher mistook SQLite's `-wal`/`-shm` updates for code changes and reloaded the page in an endless loop.

---

## Testing

```bash
npm test
```

**44 tests**, each starting from a fresh in-memory database (the persistence and upgrade tests use a temporary file instead):

- **Logic (27):** seed data, feed filtering, matching, every privacy rule above, idempotent retries, rejected input, persistence across reopening the database, upgrading an older database, and the demo reset (only the user's own swipes are removed).
- **API routes (17):** status codes, error codes, malformed and `null` JSON bodies, response shapes, the `no-store` header, and the reset endpoint.

Beyond unit tests, I ran the app in headless Chrome at phone size: dragging, buttons, arrow keys, the match screen, reload persistence, offline rollback, double clicks and the empty state. That pass found and fixed two real bugs: an error message that covered the Like/Pass buttons, and the dev-server reload loop described above.

---

## What I'd do next

- **Real users and auth.** Replace the fixed `me` with a session, and use random UUIDs for profile ids. Sequential ids like `p01` let anyone list every profile via the 404 response.
- **Profiles for strangers.** Discover means people who don't know you will see you, so users need a profile they control. That changes Coy's crush-list model, which is why the Home tab stays blank here as the brief asked.
- **Undo for the last swipe**, with care: undoing a pass must not become a way to re-probe someone.
- **Scale:** paginate the feed, and store matches in a table written in the same transaction as the swipe once lists get long.
- **Postgres** (or a hosted SQLite like Turso) for deployment, since SQLite files don't persist on serverless hosts.
