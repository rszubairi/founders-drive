import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

export const FOUNDER_COOKIE = "fd_founder";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function client() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
  return new ConvexHttpClient(url);
}

/** Pull the human message out of a Convex action error string. */
function cleanError(raw: string) {
  const m = raw.match(/Uncaught Error:\s*(.+?)(?:\n|$)/);
  return (m ? m[1] : raw).trim() || "Sign in failed.";
}

export async function POST(request: NextRequest) {
  let body: { action?: string; email?: string; password?: string; name?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
  const email = String(body.email ?? "");
  const password = String(body.password ?? "");

  try {
    const convex = client();
    const { token } =
      body.action === "signup"
        ? await convex.action(api.founderAuth.signUp, {
            email,
            password,
            name: body.name ? String(body.name) : undefined,
          })
        : await convex.action(api.founderAuth.login, { email, password });

    const res = NextResponse.json({ ok: true });
    res.cookies.set(FOUNDER_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: MAX_AGE,
    });
    return res;
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: cleanError((e as Error).message || "") },
      { status: 400 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const token = request.cookies.get(FOUNDER_COOKIE)?.value;
  if (token) {
    try {
      await client().mutation(api.founderAuth.logout, { token });
    } catch {
      /* ignore */
    }
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(FOUNDER_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
