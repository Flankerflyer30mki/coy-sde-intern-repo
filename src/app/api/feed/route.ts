import { connection } from "next/server";
import { CURRENT_USER_ID, getDb } from "@/lib/db";
import { getFeed } from "@/lib/discover";
import { handleError, json } from "@/lib/http";

/** GET /api/feed: profiles the user has not swiped on yet. */
export async function GET() {
  // better-sqlite3 is synchronous, so without this Next.js would run the query
  // once at build time and serve that frozen result forever.
  await connection();
  try {
    return json({ profiles: getFeed(getDb(), CURRENT_USER_ID) });
  } catch (err) {
    return handleError(err);
  }
}
