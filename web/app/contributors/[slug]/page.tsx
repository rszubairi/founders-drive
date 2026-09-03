"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Container, Eyebrow, Card } from "@/components/ui";
import { Logo } from "@/components/media";

export default function ContributorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const c = useQuery(api.contributors.getContributorBySlug, { slug });

  if (c === undefined)
    return (
      <Container className="py-20">
        <div className="h-8 w-64 animate-pulse rounded bg-paper-2" />
      </Container>
    );
  if (c === null)
    return (
      <Container className="py-20">
        <h1 className="font-display text-4xl">Contributor not found.</h1>
        <Link href="/contributors" className="mt-4 inline-block text-ember">
          &larr; All contributors
        </Link>
      </Container>
    );

  return (
    <Container className="py-16">
      <Link href="/contributors" className="font-mono-x text-[12px] text-faint hover:text-ink">
        &larr; Industry contributors
      </Link>

      <div className="mt-5 flex items-center gap-4">
        <Logo src={c.logoUrl} name={c.shortName ?? c.name} size={64} />
        <div>
          <div className="tagline">{c.type}</div>
          <h1 className="font-display text-[clamp(32px,5vw,52px)] leading-[1]">{c.name}</h1>
        </div>
      </div>

      {c.description && <p className="mt-5 max-w-2xl text-[16px] text-muted">{c.description}</p>}

      <div className="mt-4 flex flex-wrap gap-2">
        {c.focusAreas.map((a: string) => (
          <span
            key={a}
            className="rounded-full border border-hair-2 px-3 py-1.5 text-[13px] text-muted"
          >
            {a}
          </span>
        ))}
      </div>
      {c.website && (
        <a
          href={c.website}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-block font-mono-x text-[13px] text-ember"
        >
          {c.website.replace(/^https?:\/\//, "")} &nearr;
        </a>
      )}

      <h2 className="font-display mt-12 text-3xl">Programmes</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {c.programmes.length === 0 && (
          <p className="text-muted">No programmes listed yet.</p>
        )}
        {c.programmes.map((p: any) => (
          <Link key={p._id} href={`/programmes/${p.slug}`}>
            <Card className="fd-lift h-full p-5">
              <div className="flex items-center justify-between">
                <span className="tagline">{p.kind}</span>
                {p.lifecycle && (
                  <span className="rounded-full bg-paper-2 px-2 py-0.5 text-[11px] text-muted">
                    {p.lifecycle}
                  </span>
                )}
              </div>
              <h3 className="font-display mt-2 text-[22px]">{p.name}</h3>
              {p.summary && <p className="mt-1.5 text-[14px] text-muted">{p.summary}</p>}
              <div className="mt-3 flex items-center justify-between text-[12px] text-faint">
                <span className="font-mono-x text-ink">{p.fundingAmount ?? "—"}</span>
                <span className="font-mono-x">{p.startupCount} startups</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </Container>
  );
}
