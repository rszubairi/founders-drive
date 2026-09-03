"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Container, Eyebrow, Card, Button } from "@/components/ui";

type Result =
  | { ok: true; status: "approved" | "verifying"; slug?: string }
  | { ok: false; reason: "not_found" | "rejected"; slug?: string }
  | null;

function VerifyInner() {
  const token = useSearchParams().get("token") ?? "";
  const verify = useMutation(api.claims.verifyClaim);
  const [result, setResult] = useState<Result>(null);
  const [pending, setPending] = useState(true);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current || !token) return;
    ran.current = true;
    verify({ token })
      .then((r) => setResult(r as Result))
      .catch(() => setResult({ ok: false, reason: "not_found" }))
      .finally(() => setPending(false)); // async — resolves after the effect
  }, [token, verify]);

  return (
    <Container className="py-24">
      <Card className="mx-auto max-w-md p-8 text-center">
        <Eyebrow>Profile claim</Eyebrow>

        {!token && (
          <>
            <h1 className="font-display mt-3 text-3xl">Missing link</h1>
            <p className="mt-3 text-[15px] text-muted">
              Open the confirmation link from your email again.
            </p>
          </>
        )}

        {token && pending && (
          <p className="mt-4 text-[15px] text-muted">Confirming your email…</p>
        )}

        {!pending && result?.ok && result.status === "approved" && (
          <>
            <h1 className="font-display mt-3 text-3xl">You&rsquo;re verified.</h1>
            <p className="mt-3 text-[15px] text-muted">
              This profile is now yours to manage. Introduction requests will come to you.
            </p>
            {result.slug && (
              <Button href={`/directory/${result.slug}`} className="mt-6">
                Open the profile
              </Button>
            )}
          </>
        )}

        {!pending && result?.ok && result.status === "verifying" && (
          <>
            <h1 className="font-display mt-3 text-3xl">Email confirmed.</h1>
            <p className="mt-3 text-[15px] text-muted">
              Because this address doesn&rsquo;t match the company domain, the Founders Drive team
              will take a quick look. You&rsquo;ll get an email with the decision.
            </p>
            {result.slug && (
              <Link
                href={`/directory/${result.slug}`}
                className="mt-5 inline-block font-mono-x text-[13px] text-ember"
              >
                Back to the profile &rarr;
              </Link>
            )}
          </>
        )}

        {!pending && result && !result.ok && (
          <>
            <h1 className="font-display mt-3 text-3xl">
              {result.reason === "rejected" ? "Claim closed" : "Link not valid"}
            </h1>
            <p className="mt-3 text-[15px] text-muted">
              {result.reason === "rejected"
                ? "This claim was reviewed and not approved. Reply to the email we sent with more detail."
                : "This link has expired or was already used. Start a new claim from the profile page."}
            </p>
            <Button href="/directory" variant="ghost" className="mt-6">
              Browse the directory
            </Button>
          </>
        )}
      </Card>
    </Container>
  );
}

export default function ClaimVerifyPage() {
  return (
    <Suspense
      fallback={
        <Container className="py-24">
          <p className="text-center text-[15px] text-muted">Loading…</p>
        </Container>
      }
    >
      <VerifyInner />
    </Suspense>
  );
}
