/** Shared PBKDF2 password hashing for founder + investor accounts. */
const ITER = 120_000;
const enc = new TextEncoder();

function b64(bytes: Uint8Array) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}
function unb64(str: string) {
  const s = atob(str);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: ITER, hash: "SHA-256" },
    key,
    256,
  );
  return `pbkdf2$${ITER}$${b64(salt)}$${b64(new Uint8Array(bits))}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [, iterStr, saltB64, hashB64] = stored.split("$");
  if (!iterStr || !saltB64 || !hashB64) return false;
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: unb64(saltB64), iterations: Number(iterStr), hash: "SHA-256" },
    key,
    256,
  );
  const got = b64(new Uint8Array(bits));
  if (got.length !== hashB64.length) return false;
  let diff = 0;
  for (let i = 0; i < got.length; i++) diff |= got.charCodeAt(i) ^ hashB64.charCodeAt(i);
  return diff === 0;
}

export const SESSION_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
export const newSessionToken = () =>
  b64(crypto.getRandomValues(new Uint8Array(24))).replace(/[^a-zA-Z0-9]/g, "");
