import crypto from "node:crypto";

/**
 * v1 admin gate. A single shared admin account, credentials from env:
 *   ADMIN_EMAIL      the login (defaults to "admin" for local dev)
 *   ADMIN_PASSWORD   defaults to the value below
 *   ADMIN_AUTH_SECRET  optional extra secret; falls back to the password
 *
 * NOTE: this only gates the /admin UI. The Convex admin functions are still
 * callable directly by anyone who knows the deployment URL — add real auth
 * (Convex Auth / Clerk) before launch.
 */
export const ADMIN_COOKIE = "fd_admin";
const DEFAULT_PASSWORD = "Tool4life123!@#";

export function adminEmail() {
  return process.env.ADMIN_EMAIL || "admin";
}
function adminPassword() {
  return process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;
}
function secret() {
  return process.env.ADMIN_AUTH_SECRET || adminPassword();
}

/** The cookie value we set on login and compare on every guarded request. */
export function sessionToken() {
  return crypto
    .createHash("sha256")
    .update(`fd-admin-v1|${adminEmail()}|${adminPassword()}|${secret()}`)
    .digest("hex");
}

export function checkCredentials(email: string, password: string) {
  const a = Buffer.from((email || "").trim().toLowerCase());
  const b = Buffer.from(adminEmail().trim().toLowerCase());
  const emailOk = a.length === b.length && crypto.timingSafeEqual(a, b);
  const p = Buffer.from(password || "");
  const q = Buffer.from(adminPassword());
  const passOk = p.length === q.length && crypto.timingSafeEqual(p, q);
  return emailOk && passOk;
}

export function isValidSession(cookieValue: string | undefined) {
  if (!cookieValue) return false;
  const a = Buffer.from(cookieValue);
  const b = Buffer.from(sessionToken());
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
