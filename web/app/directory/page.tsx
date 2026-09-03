"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Container, Eyebrow, Card, Chip } from "@/components/ui";
import { Logo } from "@/components/media";

const SECTORS = [
  "Fintech",
  "SaaS / B2B software",
  "Agritech / Deep Tech",
  "Healthtech / AI",
  "Marketplace / Logistics",
  "Climate / Energy",
];
const STAGES = ["Pre-Seed", "Seed", "Series A"];
const FUND = ["Raising now", "Open to intros", "Not raising"];

export default function DirectoryPage() {
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState<string | null>(null);
  const [stage, setStage] = useState<string | null>(null);
  const [fundStatus, setFundStatus] = useState<string | null>(null);

  const startups = useQuery(api.startups.listStartups, {
    search: search || undefined,
    sector: sector || undefined,
    stage: stage || undefined,
    fundStatus: fundStatus || undefined,
  });

  return (
    <Container className="py-16">
      <Eyebrow>The Malaysian startup directory</Eyebrow>
      <h1 className="font-display mt-4 text-[clamp(34px,5vw,56px)]">
        Every startup that opened the books.
      </h1>
      <p className="font-serif-x mt-3.5 max-w-xl text-[19px] text-muted">
        Searchable profiles with sector, stage, traction and fundraising status. Founder contact
        details stay private &mdash; use <b>Request an introduction</b> and the founder decides.
      </p>

      <div className="mt-8 rounded-2xl border border-hair bg-card p-5">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, sector or what they do…"
          className="w-full rounded-md border border-hair-2 bg-paper px-4 py-3 text-[15px] outline-none focus:border-ember"
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {SECTORS.map((s) => (
            <Chip key={s} active={sector === s} onClick={() => setSector(sector === s ? null : s)}>
              {s}
            </Chip>
          ))}
        </div>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {STAGES.map((s) => (
            <Chip key={s} active={stage === s} onClick={() => setStage(stage === s ? null : s)}>
              {s}
            </Chip>
          ))}
          <span className="mx-1 w-px bg-hair-2" />
          {FUND.map((s) => (
            <Chip
              key={s}
              active={fundStatus === s}
              onClick={() => setFundStatus(fundStatus === s ? null : s)}
            >
              {s}
            </Chip>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {startups === undefined &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-2xl bg-paper-2" />
          ))}
        {startups?.map((s: any) => (
          <Link key={s._id} href={`/directory/${s.slug}`}>
            <Card className="fd-lift flex h-full flex-col p-6">
              <div className="flex items-center justify-between">
                <span className="tagline">{s.sector}</span>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                    s.fundStatus === "Raising now"
                      ? "bg-[rgba(198,65,10,0.12)] text-ember"
                      : "bg-paper-2 text-muted"
                  }`}
                >
                  {s.fundStatus}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <Logo src={s.logoUrl} name={s.name} size={40} />
                <h3 className="font-display text-[26px] leading-none">{s.name}</h3>
              </div>
              <p className="font-serif-x mt-2 flex-1 text-[15px] text-muted">{s.pitch}</p>
              <div className="mt-4 flex items-center justify-between border-t border-hair pt-3 text-[12px] text-faint">
                <span className="font-mono-x">
                  {s.stage} · {s.city}
                </span>
                {s.momentumScore != null && (
                  <span className="font-mono-x text-ember">momentum {s.momentumScore}</span>
                )}
              </div>
            </Card>
          </Link>
        ))}
        {startups?.length === 0 && (
          <p className="text-muted">No startups match those filters yet.</p>
        )}
      </div>
    </Container>
  );
}
