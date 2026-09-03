"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container, Eyebrow, Card, Button, Field, inputCls } from "@/components/ui";

function LoginInner() {
  const router = useRouter();
  const next = useSearchParams().get("next") || "/admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setErr(j.error || "Sign in failed.");
        return;
      }
      router.replace(next.startsWith("/") ? next : "/admin");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Container className="py-24">
      <Card className="mx-auto max-w-sm p-8">
        <Eyebrow>Founders Drive · host console</Eyebrow>
        <h1 className="font-display mt-3 text-3xl">Admin sign in</h1>
        <form onSubmit={submit} className="mt-6 grid gap-4">
          <Field label="Email">
            <input
              className={inputCls}
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label="Password">
            <input
              className={inputCls}
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          {err && <p className="text-[13px] text-[#a63244]">{err}</p>}
          <Button type="submit" disabled={busy || !email || !password}>
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </Card>
    </Container>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <Container className="py-24">
          <p className="text-center text-muted">Loading…</p>
        </Container>
      }
    >
      <LoginInner />
    </Suspense>
  );
}
