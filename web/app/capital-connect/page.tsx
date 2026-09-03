"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Container, Eyebrow, Card, Chip, Button } from "@/components/ui";
import { Logo } from "@/components/media";

const SECTORS = ["Fintech", "SaaS / B2B software", "Healthtech / AI", "Marketplace / Logistics"];
const STAGES = ["Pre-Seed", "Seed", "Series A"];

export default function CapitalConnectPage() {
  const [sector, setSector] = useState<string | null>(null);
  const [stage, setStage] = useState<string | null>(null);
  const investors = useQuery(api.investors.listInvestors, {
    sector: sector || undefined,
    stage: stage || undefined,
  });

  return (
    <Container className="py-16">
      <Eyebrow>Capital Connect</Eyebrow>
      <h1 className="font-display mt-4 text-[clamp(34px,5vw,56px)]">
        Investors who actually write cheques in Malaysia.
      </h1>
      <p className="font-serif-x mt-3.5 max-w-xl text-[19px] text-muted">
        Verified fund profiles with stage, ticket size, sectors and thesis. Every startup profile
        carries a match score against this list, and explains why.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Button href="/capital-connect/apply" variant="ghost" className="px-5 py-2.5 text-sm">
          List your fund
        </Button>
        <span className="text-[13px] text-faint">
          New fund profiles are reviewed before they appear here.
        </span>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {SECTORS.map((s) => (
          <Chip key={s} active={sector === s} onClick={() => setSector(sector === s ? null : s)}>
            {s}
          </Chip>
        ))}
        <span className="mx-1 w-px bg-hair-2" />
        {STAGES.map((s) => (
          <Chip key={s} active={stage === s} onClick={() => setStage(stage === s ? null : s)}>
            {s}
          </Chip>
        ))}
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {investors === undefined &&
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-52 animate-pulse rounded-2xl bg-paper-2" />
          ))}
        {investors?.map((inv: any) => (
          <Card key={inv._id} className="fd-lift p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Logo src={inv.logoUrl} name={inv.fundName} size={40} />
                <div>
                  <h3 className="font-display text-[26px] leading-none">{inv.fundName}</h3>
                  <div className="mt-1 text-[13px] text-muted">
                    {inv.name}
                    {inv.role ? ` · ${inv.role}` : ""}
                  </div>
                </div>
              </div>
              {inv.isVerified && (
                <span className="rounded-full bg-[rgba(198,65,10,0.12)] px-2.5 py-1 text-[11px] text-ember">
                  Verified
                </span>
              )}
            </div>
            {inv.thesis && <p className="mt-3 text-[14.5px] text-muted">{inv.thesis}</p>}
            {inv.website && (
              <a
                href={inv.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-[12.5px] text-ember underline underline-offset-2"
              >
                {inv.website.replace(/^https?:\/\//, "")}
              </a>
            )}
            <div className="mt-4 grid grid-cols-2 gap-3 text-[12.5px]">
              <Meta k="Stage" v={inv.stagePreferences.join(", ")} />
              <Meta
                k="Ticket"
                v={
                  inv.ticketMin
                    ? `RM ${fmt(inv.ticketMin)} – ${fmt(inv.ticketMax)}`
                    : "—"
                }
              />
              <Meta k="Sectors" v={inv.sectors.join(", ")} />
              <Meta k="Geography" v={inv.geography.join(", ")} />
            </div>
            {inv.portfolioHighlights?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {inv.portfolioHighlights.map((p: string) => (
                  <span
                    key={p}
                    className="rounded border border-hair px-2 py-0.5 text-[11px] text-faint"
                  >
                    {p}
                  </span>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </Container>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="tagline">{k}</div>
      <div className="mt-0.5 text-ink">{v}</div>
    </div>
  );
}
function fmt(n?: number) {
  if (!n) return "—";
  return n >= 1_000_000 ? `${n / 1_000_000}M` : `${n / 1000}k`;
}
