import { CURRENT_USER_ID, getDb } from "@/lib/db";
import { recordSwipe } from "@/lib/discover";
import { errorResponse, handleError, json } from "@/lib/http";

/**
 * POST /api/swipe  body: { "profileId": string, "action": "like" | "pass" }
 * Returns { match: false } or { match: true, profile }.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(400, "INVALID_JSON", "request body must be valid JSON");
  }

  const { profileId, action } = (body ?? {}) as Record<string, unknown>;
  if (typeof profileId !== "string" || profileId === "") {
    return errorResponse(400, "INVALID_PROFILE_ID", "profileId must be a non-empty string");
  }
  if (typeof action !== "string") {
    return errorResponse(400, "INVALID_ACTION", `action must be "like" or "pass"`);
  }

  try {
    return json(recordSwipe(getDb(), CURRENT_USER_ID, profileId, action));
  } catch (err) {
    return handleError(err);
  }
}
