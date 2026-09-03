"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Container, Eyebrow, Card, Chip } from "@/components/ui";
import { Logo } from "@/components/media";
import { Stars } from "@/components/viz";

const KINDS = ["Grant", "Accelerator / cohort", "Fellowship", "Competition"];
const STAGES = ["Idea stage", "Pre-Seed", "Seed", "Series A"];

export default function ProgrammesPage() {
  const [kind, setKind] = useState<string | null>(null);
  const [stage, setStage] = useState<string | null>(null);
  const programmes = useQuery(api.programmes.listProgrammes, {
    kind: kind || undefined,
    stage: stage || undefined,
  });

  return (
    <Container className="py-16">
      <Eyebrow>Grants &amp; cohorts</Eyebrow>
      <h1 className="font-display mt-4 text-[clamp(34px,5vw,56px)]">
        Every programme worth applying to, rated by founders who did it.
      </h1>
      <p className="font-serif-x mt-3.5 max-w-2xl text-[19px] text-muted">
        Grants and accelerator cohorts from Malaysian agencies, ministries, universities and VCs.
        Ratings and comments come from startups on Founders Drive who went through the programme —
        shown anonymously.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        {KINDS.map((k) => (
          <Chip key={k} active={kind === k} onClick={() => setKind(kind === k ? null : k)}>
            {k}
          </Chip>
        ))}
        <span className="mx-1 w-px bg-hair-2" />
        {STAGES.map((s) => (
          <Chip key={s} active={stage === s} onClick={() => setStage(stage === s ? null : s)}>
            {s}
          </Chip>
        ))}
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {programmes === undefined &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-2xl bg-paper-2" />
          ))}
        {programmes?.map((p: any) => (
          <Link key={p._id} href={`/programmes/${p.slug}`}>
            <Card className="fd-lift flex h-full flex-col p-6">
              <div className="flex items-center justify-between">
                <span className="tagline">{p.kind}</span>
                {p.lifecycle && (
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                      p.lifecycle === "Open"
                        ? "bg-[rgba(198,65,10,0.12)] text-ember"
                        : "bg-paper-2 text-muted"
                    }`}
                  >
                    {p.lifecycle}
                  </span>
                )}
              </div>
              <div className="mt-3 flex items-center gap-3">
                <Logo src={p.logoUrl} name={p.contributor?.name ?? p.name} size={36} />
                <div className="min-w-0">
                  <h3 className="font-display text-[22px] leading-tight">{p.name}</h3>
                  <div className="text-[12.5px] text-muted">
                    {p.contributor?.shortName ?? p.contributor?.name}
                  </div>
                </div>
              </div>
              {p.summary && (
                <p className="font-serif-x mt-2.5 flex-1 text-[14.5px] text-muted">{p.summary}</p>
              )}
              <div className="mt-4 border-t border-hair pt-3 text-[12px] text-faint">
                <div className="flex items-center justify-between">
                  <span className="font-mono-x text-ink">{p.fundingAmount ?? "—"}</span>
                  <span className="font-mono-x">{p.equity ?? ""}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  {p.rating.count > 0 ? (
                    <span className="flex items-center gap-1.5">
                      <Stars value={p.rating.overall} size={14} />
                      <span className="font-mono-x">
                        {p.rating.overall} · {p.rating.count}
                      </span>
                    </span>
                  ) : (
                    <span className="text-faint">No ratings yet</span>
                  )}
                  <span className="font-mono-x">{p.startupCount} startups</span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
        {programmes?.length === 0 && (
          <p className="text-muted">No programmes match those filters.</p>
        )}
      </div>

      <p className="mt-10 text-[13px] text-faint">
        Run a programme?{" "}
        <Link href="/contributors" className="text-ember">
          See the industry contributors
        </Link>{" "}
        — or email the team to get listed.
      </p>
    </Container>
  );
}
