"use client";

/** A stable per-browser id so a viewer's poll vote can be updated, not duplicated. */
export function getVoterSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  const key = "fd_voter_session";
  try {
    let id = localStorage.getItem(key);
    if (!id) {
      id =
        (crypto.randomUUID && crypto.randomUUID()) ||
        `v_${Math.random().toString(36).slice(2)}_${Date.now()}`;
      localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return "anon";
  }
}
