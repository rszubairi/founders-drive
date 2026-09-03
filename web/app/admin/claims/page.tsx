"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Container, Eyebrow, Card } from "@/components/ui";

const FILTERS = ["verifying", "pending", "approved", "rejected"];

export default function AdminClaimsPage() {
  const [filter, setFilter] = useState<string | null>("verifying");
  const claims = useQuery(api.claims.listClaims, filter ? { status: filter } : {});
  const decide = useMutation(api.claims.decideClaim);
  const [busy, setBusy] = useState<string | null>(null);

  async function act(claimId: string, approve: boolean) {
    setBusy(claimId);
    try {
      await decide({ claimId: claimId as never, approve });
    } finally {
      setBusy(null);
    }
  }

  return (
    <Container className="py-16">
      <Eyebrow>Founders Drive · host console</Eyebrow>
      <h1 className="font-display mt-4 text-[clamp(30px,4vw,48px)]">Profile claims</h1>
      <p className="font-serif-x mt-3 max-w-xl text-[18px] text-muted">
        Claims from a company-domain email approve themselves once the address is confirmed. These
        need a human: a free-mail address, or a domain that doesn&rsquo;t match.
      </p>
      <p className="mt-4 rounded-md border border-hair-2 bg-paper-2 px-3 py-2 text-[13px] text-muted">
        v1 has no authentication — gate this route (or move it to a secret URL) before launch.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        {FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(filter === s ? null : s)}
            className={`rounded-full border px-3.5 py-2 text-[13px] transition ${
              filter === s ? "border-ember bg-[rgba(198,65,10,0.08)] text-ember" : "border-hair-2 text-muted"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-3">
        {claims === undefined &&
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-paper-2" />
          ))}

        {claims?.map((c) => (
          <Card key={c._id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <Link href={`/directory/${c.slug}`} className="font-display text-[22px] hover:text-ember">
                  {c.startup}
                </Link>
                <div className="mt-1 text-[14px]">
                  <b>{c.claimantName}</b> · {c.claimantRole}
                </div>
                <div className="font-mono-x text-[13px] text-muted">{c.claimantEmail}</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Pill on={c.emailVerified}>{c.emailVerified ? "email verified" : "email unverified"}</Pill>
                  <Pill on={c.domainMatch}>{c.domainMatch ? "domain match" : "no domain match"}</Pill>
                  {c.isFreeMail && <Pill on={false}>free-mail</Pill>}
                  <Pill on={c.status === "approved"}>{c.status}</Pill>
                  {c.claimedByEmail && <Pill on>owned: {c.claimedByEmail}</Pill>}
                </div>
                {c.note && <p className="mt-2 max-w-lg text-[13.5px] text-muted">&ldquo;{c.note}&rdquo;</p>}
                {c.evidenceUrl && (
                  <a href={c.evidenceUrl} target="_blank" rel="noreferrer" className="mt-1 inline-block font-mono-x text-[12.5px] text-ember">
                    {c.evidenceUrl}
                  </a>
                )}
              </div>

              {(c.status === "verifying" || c.status === "pending") && (
                <div className="flex gap-2">
                  <button
                    onClick={() => act(c._id, true)}
                    disabled={busy === c._id}
                    className="rounded-full bg-ember px-4 py-2 text-[13px] font-medium text-[#fff7f0] disabled:opacity-40"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => act(c._id, false)}
                    disabled={busy === c._id}
                    className="rounded-full border border-hair-2 px-4 py-2 text-[13px] font-medium hover:border-ink disabled:opacity-40"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </Card>
        ))}

        {claims?.length === 0 && (
          <p className="text-muted">Nothing {filter ? `in "${filter}"` : "here"} right now.</p>
        )}
      </div>
    </Container>
  );
}

function Pill({ on, children }: { on: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10.5px] font-mono-x uppercase tracking-[0.1em] ${
        on ? "bg-ink text-paper" : "bg-paper-2 text-faint"
      }`}
    >
      {children}
    </span>
  );
}
