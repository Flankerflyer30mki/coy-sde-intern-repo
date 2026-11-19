import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Database from "better-sqlite3";
import { seed } from "./seed";

export type DB = Database.Database;

/** The single logged-in user. No auth in this assignment, so it is fixed. */
export const CURRENT_USER_ID = "me";

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS profiles (
    id         TEXT PRIMARY KEY,
    name       TEXT    NOT NULL,
    age        INTEGER NOT NULL,
    photo      TEXT    NOT NULL,
    bio        TEXT    NOT NULL,
    location   TEXT    NOT NULL,   -- city or college
    interests  TEXT    NOT NULL    -- JSON array of strings
  );

  -- One row per (swiper, target). The primary key makes it impossible to
  -- swipe on the same person twice, enforced by the database itself.
  -- Matches are NOT stored: a match is simply two likes pointing at each
  -- other, so it is derived with a query and can never go out of sync.
  CREATE TABLE IF NOT EXISTS swipes (
    swiper_id  TEXT NOT NULL REFERENCES profiles(id),
    target_id  TEXT NOT NULL REFERENCES profiles(id),
    action     TEXT NOT NULL CHECK (action IN ('like', 'pass')),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    PRIMARY KEY (swiper_id, target_id),
    CHECK (swiper_id <> target_id)
  );

  -- Speeds up "who liked X" lookups used for match checks.
  CREATE INDEX IF NOT EXISTS swipes_by_target ON swipes (target_id, action);
`;

/**
 * Opens a database, creates the tables and seeds it if it is empty.
 * Pass ":memory:" for a throwaway database (used by tests).
 */
export function openDb(file: string): DB {
  if (file !== ":memory:") {
    fs.mkdirSync(path.dirname(file), { recursive: true });
  }
  const db = new Database(file);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(SCHEMA);
  seed(db);
  return db;
}

// The database lives OUTSIDE the project folder on purpose. `next dev` watches
// the project for file changes, and SQLite updates its -wal/-shm files on every
// query, which the watcher mistakes for code edits: the page then reloads in an
// endless loop. COY_DB_FILE overrides the location (tests use ":memory:").
export const DB_FILE =
  process.env.COY_DB_FILE ?? path.join(os.homedir(), ".coy-discover", "coy.db");

// Reuse one connection across requests. Stored on globalThis so Next.js
// hot-reloading in dev doesn't open a new connection on every code change.
const globalForDb = globalThis as unknown as { coyDb?: DB };

export function getDb(): DB {
  if (!globalForDb.coyDb) {
    globalForDb.coyDb = openDb(DB_FILE);
    console.log(`[coy] database: ${DB_FILE}`);
  }
  return globalForDb.coyDb;
}

/** Test helper: forget the shared connection so the next getDb() starts fresh. */
export function resetDbForTests(): void {
  globalForDb.coyDb?.close();
  globalForDb.coyDb = undefined;
}
