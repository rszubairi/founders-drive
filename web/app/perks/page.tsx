"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Container, Eyebrow, Card } from "@/components/ui";

export default function PerksPage() {
  const perks = useQuery(api.perks.listPerks);

  return (
    <Container className="py-16">
      <Eyebrow>Founder Perks &amp; Opportunities</Eyebrow>
      <h1 className="font-display mt-4 text-[clamp(34px,5vw,56px)]">
        The boring-but-expensive stuff, discounted.
      </h1>
      <p className="font-serif-x mt-3.5 max-w-xl text-[19px] text-muted">
        Cloud, legal, accounting, recruitment, banking and marketing benefits for registered
        Founders Drive startups &mdash; plus grants, accelerators and competitions worth applying to.
      </p>

      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {perks === undefined &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl bg-paper-2" />
          ))}
        {perks?.map((p: any) => (
          <Card key={p._id} className="fd-lift flex h-full flex-col p-6">
            <div className="flex items-center justify-between">
              <span className="tagline">{p.category}</span>
              {p.valueAmount && (
                <span className="font-mono-x text-[13px] text-ember">{p.valueAmount}</span>
              )}
            </div>
            <h3 className="font-serif-x mt-3 text-[20px]">{p.title}</h3>
            <p className="mt-2 flex-1 text-[14px] text-muted">{p.description}</p>
            <div className="mt-4 border-t border-hair pt-3 text-[12px] text-faint">{p.partner}</div>
          </Card>
        ))}
      </div>
    </Container>
  );
}
