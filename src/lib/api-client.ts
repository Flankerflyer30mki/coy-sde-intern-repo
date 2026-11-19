// Browser-side helpers for calling our API. Types are shared with the server
// via a type-only import, so no server code ends up in the browser bundle.
import type { Match, Profile, SwipeAction, SwipeResult } from "./discover";

export type { Match, Profile, SwipeAction, SwipeResult };

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { cache: "no-store", ...init });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(
      res.status,
      body?.error?.code ?? "UNKNOWN",
      body?.error?.message ?? `request failed (${res.status})`,
    );
  }
  return body as T;
}

export async function fetchFeed(): Promise<Profile[]> {
  return (await request<{ profiles: Profile[] }>("/api/feed")).profiles;
}

export async function fetchMatches(): Promise<Match[]> {
  return (await request<{ matches: Match[] }>("/api/matches")).matches;
}

/** DEMO ONLY: erase the user's swipes so the demo starts over. */
export async function resetDemo(): Promise<void> {
  await request<{ reset: true }>("/api/reset", { method: "POST" });
}

export function postSwipe(profileId: string, action: SwipeAction): Promise<SwipeResult> {
  return request<SwipeResult>("/api/swipe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profileId, action }),
  });
}
