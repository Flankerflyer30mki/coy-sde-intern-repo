import { connection } from "next/server";
import { CURRENT_USER_ID, getDb } from "@/lib/db";
import { getMatches } from "@/lib/discover";
import { handleError, json } from "@/lib/http";

/** GET /api/matches: the user's mutual matches, newest first. */
export async function GET() {
  await connection(); // see api/feed/route.ts: must run per request, not at build time
  try {
    return json({ matches: getMatches(getDb(), CURRENT_USER_ID) });
  } catch (err) {
    return handleError(err);
  }
}
