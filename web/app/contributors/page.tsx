"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Container, Eyebrow, Card, Chip } from "@/components/ui";
import { Logo } from "@/components/media";

const TYPES = [
  "Government agency",
  "Ministry",
  "VC / accelerator",
  "Corporate",
  "University",
  "Foundation",
];

export default function ContributorsPage() {
  const [type, setType] = useState<string | null>(null);
  const contributors = useQuery(api.contributors.listContributors, {
    type: type || undefined,
  });

  return (
    <Container className="py-16">
      <Eyebrow>Industry contributors</Eyebrow>
      <h1 className="font-display mt-4 text-[clamp(34px,5vw,56px)]">
        The agencies, ministries and funds building the Malaysian ecosystem.
      </h1>
      <p className="font-serif-x mt-3.5 max-w-2xl text-[19px] text-muted">
        Each one runs grants or cohorts that startups on Founders Drive have been through. Open a
        contributor to see its programmes and how founders rated them.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <Chip key={t} active={type === t} onClick={() => setType(type === t ? null : t)}>
            {t}
          </Chip>
        ))}
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {contributors === undefined &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-paper-2" />
          ))}
        {contributors?.map((c: any) => (
          <Link key={c._id} href={`/contributors/${c.slug}`}>
            <Card className="fd-lift flex h-full flex-col p-6">
              <div className="flex items-center gap-3">
                <Logo src={c.logoUrl} name={c.shortName ?? c.name} size={44} />
                <div className="min-w-0">
                  <h3 className="font-display text-[22px] leading-tight">
                    {c.shortName ?? c.name}
                  </h3>
                  <div className="tagline">{c.type}</div>
                </div>
              </div>
              {c.description && (
                <p className="font-serif-x mt-3 flex-1 text-[14px] text-muted">{c.description}</p>
              )}
              <div className="mt-4 flex items-center justify-between border-t border-hair pt-3 text-[12px] text-faint">
                <span>{c.shortName ? c.name : ""}</span>
                <span className="font-mono-x text-ember">
                  {c.programmeCount} programme{c.programmeCount === 1 ? "" : "s"}
                </span>
              </div>
            </Card>
          </Link>
        ))}
        {contributors?.length === 0 && (
          <p className="text-muted">No contributors of that type yet.</p>
        )}
      </div>
    </Container>
  );
}
