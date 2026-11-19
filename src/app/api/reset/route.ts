import { CURRENT_USER_ID, getDb } from "@/lib/db";
import { resetSwipes } from "@/lib/discover";
import { handleError, json } from "@/lib/http";

/**
 * POST /api/reset: DEMO ONLY. Erases the user's own swipes so the demo can be
 * replayed from the start ("Start over" button). Seeded likes are kept, so the
 * same matches can happen again. Not something a real app would expose.
 */
export async function POST() {
  try {
    return json({ reset: true, removedSwipes: resetSwipes(getDb(), CURRENT_USER_ID) });
  } catch (err) {
    return handleError(err);
  }
}
