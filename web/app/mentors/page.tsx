"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Container, Eyebrow, Card, Chip, Button } from "@/components/ui";
import { Avatar } from "@/components/media";

const CATEGORIES = [
  "Fundraising",
  "Go-to-market",
  "Product",
  "Growth & marketing",
  "Sales",
  "Hiring & team",
  "Technical / engineering",
  "Operations & finance",
  "Legal & compliance",
  "International expansion",
];

export default function MentorsPage() {
  const [category, setCategory] = useState<string | null>(null);
  const mentors = useQuery(api.mentors.listMentors, { category: category || undefined });

  return (
    <Container className="py-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Eyebrow>Mentor Network</Eyebrow>
          <h1 className="font-display mt-4 text-[clamp(34px,5vw,56px)]">
            Book an operator by the hour.
          </h1>
          <p className="font-serif-x mt-3.5 max-w-2xl text-[19px] text-muted">
            Vetted founders, operators and functional specialists. Rates below include the Founders
            Drive fee; you book directly through the mentor&rsquo;s calendar.
          </p>
        </div>
        <Button href="/mentors/apply" variant="ghost">
          Become a mentor
        </Button>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <Chip key={c} active={category === c} onClick={() => setCategory(category === c ? null : c)}>
            {c}
          </Chip>
        ))}
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {mentors === undefined &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-2xl bg-paper-2" />
          ))}
        {mentors?.map((m: any) => (
          <Link key={m._id} href={`/mentors/${m.slug}`}>
            <Card className="fd-lift flex h-full flex-col p-6">
              <div className="flex items-center gap-3">
                <Avatar src={m.photoUrl} name={m.name} size={48} />
                <div className="min-w-0">
                  <h3 className="font-display text-[22px] leading-tight">{m.name}</h3>
                  {m.title && <div className="text-[12.5px] text-muted">{m.title}</div>}
                </div>
              </div>
              <p className="font-serif-x mt-3 line-clamp-3 flex-1 text-[14px] text-muted">{m.bio}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {m.categories.slice(0, 3).map((c: string) => (
                  <span key={c} className="rounded-full bg-paper-2 px-2.5 py-0.5 text-[11px] text-muted">
                    {c}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-hair pt-3">
                <span className="font-mono-x text-[15px] text-ink">
                  {m.currency} {m.startupRate}
                  <span className="text-[12px] text-faint"> / hr</span>
                </span>
                <span className="font-mono-x text-[12px] text-ember">Book →</span>
              </div>
            </Card>
          </Link>
        ))}
        {mentors?.length === 0 && (
          <p className="text-muted">No mentors in that category yet.</p>
        )}
      </div>
    </Container>
  );
}
