"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Container, Eyebrow, Card, Button } from "@/components/ui";
import { Avatar } from "@/components/media";

export default function MentorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const m = useQuery(api.mentors.getMentorBySlug, { slug });

  if (m === undefined)
    return (
      <Container className="py-20">
        <div className="h-8 w-64 animate-pulse rounded bg-paper-2" />
      </Container>
    );
  if (m === null)
    return (
      <Container className="py-20">
        <h1 className="font-display text-4xl">Mentor not found.</h1>
        <Link href="/mentors" className="mt-4 inline-block text-ember">
          &larr; All mentors
        </Link>
      </Container>
    );

  return (
    <Container className="py-16">
      <Link href="/mentors" className="font-mono-x text-[12px] text-faint hover:text-ink">
        &larr; Mentor Network
      </Link>

      <div className="mt-5 grid gap-12 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <div className="flex items-center gap-4">
            <Avatar src={m.photoUrl} name={m.name} size={72} />
            <div>
              <h1 className="font-display text-[clamp(32px,5vw,52px)] leading-[1]">{m.name}</h1>
              {m.title && <div className="mt-1 text-[14px] text-muted">{m.title}</div>}
            </div>
          </div>

          <p className="font-serif-x mt-6 max-w-xl text-[17px] leading-[1.6] text-muted">{m.bio}</p>

          <div className="mt-6">
            <div className="tagline">Helps with</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {m.categories.map((c: string) => (
                <span
                  key={c}
                  className="rounded-full border border-hair-2 px-3 py-1.5 text-[13px] text-muted"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          {m.linkedin && (
            <a
              href={m.linkedin}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-block font-mono-x text-[13px] text-ember"
            >
              LinkedIn &nearr;
            </a>
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <Eyebrow>Book a session</Eyebrow>
            <div className="mt-3 font-display text-[44px] leading-none">
              {m.currency} {m.startupRate}
              <span className="text-[16px] text-faint"> / hour</span>
            </div>
            <div className="mt-3 grid gap-1.5 border-t border-hair pt-3 text-[13px] text-muted">
              <div className="flex justify-between">
                <span>Mentor&rsquo;s rate</span>
                <span className="font-mono-x">
                  {m.currency} {m.mentorRate}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Founders Drive fee ({m.feePct}%)</span>
                <span className="font-mono-x">
                  {m.currency} {m.platformFee}
                </span>
              </div>
              <div className="flex justify-between font-medium text-ink">
                <span>You pay</span>
                <span className="font-mono-x">
                  {m.currency} {m.startupRate} / hr
                </span>
              </div>
            </div>
            <Button href={m.calendlyUrl} className="mt-5 w-full">
              Open {m.name.split(" ")[0]}&rsquo;s calendar
            </Button>
            <p className="mt-2 text-[12px] text-faint">
              You book and pay through Calendly. The Founders Drive fee is billed separately.
            </p>
          </Card>
        </div>
      </div>
    </Container>
  );
}
