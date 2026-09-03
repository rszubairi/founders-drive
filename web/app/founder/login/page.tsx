"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Container, Eyebrow, Card, Button, Field, inputCls } from "@/components/ui";

function Inner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const [mode, setMode] = useState<"login" | "signup">(
    params.get("tab") === "signup" ? "signup" : "login",
  );
  const [f, setF] = useState({ email: "", password: "", name: "" });
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/founder/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: mode,
          email: f.email,
          password: f.password,
          name: mode === "signup" ? f.name : undefined,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.ok) {
        setErr(j.error || "Something went wrong.");
        return;
      }
      router.replace(next.startsWith("/") ? next : "/dashboard");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Container className="py-24">
      <Card className="mx-auto max-w-sm p-8">
        <Eyebrow>Founder account</Eyebrow>
        <div className="mt-4 flex gap-1 rounded-full border border-hair-2 p-1 text-[13px]">
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setErr(null);
              }}
              className={`flex-1 rounded-full px-3 py-1.5 font-medium transition ${
                mode === m ? "bg-ember text-[#fff7f0]" : "text-muted"
              }`}
            >
              {m === "login" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="mt-5 grid gap-4">
          {mode === "signup" && (
            <Field label="Your name" hint="Optional">
              <input className={inputCls} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
            </Field>
          )}
          <Field
            label="Email"
            hint={mode === "signup" ? "The email on your registered startup profile." : undefined}
          >
            <input
              className={inputCls}
              type="email"
              autoComplete="username"
              value={f.email}
              onChange={(e) => setF({ ...f, email: e.target.value })}
            />
          </Field>
          <Field label="Password" hint={mode === "signup" ? "At least 8 characters." : undefined}>
            <input
              className={inputCls}
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={f.password}
              onChange={(e) => setF({ ...f, password: e.target.value })}
            />
          </Field>
          {err && <p className="text-[13px] text-[#a63244]">{err}</p>}
          <Button type="submit" disabled={busy || !f.email || !f.password}>
            {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <p className="mt-5 text-[13px] text-faint">
          {mode === "signup"
            ? "Your startup must be registered and approved first — "
            : "New here? "}
          <Link href="/register" className="text-ember">
            register your startup
          </Link>
          .
        </p>
      </Card>
    </Container>
  );
}

export default function FounderLoginPage() {
  return (
    <Suspense
      fallback={
        <Container className="py-24">
          <p className="text-center text-muted">Loading…</p>
        </Container>
      }
    >
      <Inner />
    </Suspense>
  );
}
