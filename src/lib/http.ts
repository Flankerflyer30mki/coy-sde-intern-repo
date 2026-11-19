import { SwipeError, type SwipeErrorCode } from "./discover";

// Every API response is personal, live data: never let a browser or proxy cache it.
const NO_STORE = { "Cache-Control": "no-store" };

export function json(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: NO_STORE });
}

export function errorResponse(status: number, code: string, message: string): Response {
  return json({ error: { code, message } }, status);
}

const STATUS_BY_CODE: Record<SwipeErrorCode, number> = {
  INVALID_ACTION: 400,
  SELF_SWIPE: 400,
  NOT_FOUND: 404,
  ALREADY_SWIPED: 409,
};

/** Turns a known SwipeError into a clean 4xx; anything else is a 500 that hides internals. */
export function handleError(err: unknown): Response {
  if (err instanceof SwipeError) {
    return errorResponse(STATUS_BY_CODE[err.code], err.code, err.message);
  }
  console.error(err);
  return errorResponse(500, "INTERNAL", "something went wrong");
}
