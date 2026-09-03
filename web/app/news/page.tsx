"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Container, Eyebrow, Card } from "@/components/ui";

export default function NewsPage() {
  const [tab, setTab] = useState<"news" | "events">("news");
  const news = useQuery(api.news.listNews, {});
  const events = useQuery(api.news.listEvents, {});

  return (
    <Container className="py-16">
      <Eyebrow>The ecosystem</Eyebrow>
      <h1 className="font-display mt-4 text-[clamp(34px,5vw,56px)]">
        Malaysian startup news &amp; what&rsquo;s on.
      </h1>
      <p className="font-serif-x mt-3.5 max-w-2xl text-[19px] text-muted">
        Posted by the funds and agencies on Founders Drive.
      </p>

      <div className="mt-8 flex gap-1 rounded-full border border-hair-2 p-1 text-[14px] max-w-[320px]">
        {(
          [
            ["news", "Startup news"],
            ["events", "Upcoming events"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`flex-1 rounded-full px-4 py-2 font-medium transition ${
              tab === k ? "bg-ember text-[#fff7f0]" : "text-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "news" ? (
        <div className="mt-8 grid gap-4">
          {news === undefined &&
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-paper-2" />
            ))}
          {news?.map((n: any) => (
            <Card key={n._id} className="p-6">
              <div className="tagline text-faint">
                {[n.source, n.publishedAt].filter(Boolean).join(" · ") || "Ecosystem"} · via {n.authorName}
              </div>
              {n.url ? (
                <a
                  href={n.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 block font-display text-[24px] leading-snug hover:text-ember"
                >
                  {n.title}
                </a>
              ) : (
                <h3 className="mt-1 font-display text-[24px] leading-snug">{n.title}</h3>
              )}
              {(n.summary || n.body) && (
                <p className="mt-2 text-[15px] text-muted">{n.summary || n.body}</p>
              )}
              {n.tags?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {n.tags.map((t: string) => (
                    <span key={t} className="rounded-full bg-paper-2 px-2.5 py-0.5 text-[11px] text-muted">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </Card>
          ))}
          {news?.length === 0 && <p className="text-muted">No news posted yet.</p>}
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {events === undefined &&
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-paper-2" />
            ))}
          {events?.map((e: any) => (
            <Card key={e._id} className="flex h-full flex-col p-6">
              <div className="flex items-center justify-between">
                <span className="font-mono-x text-[13px] text-ember">{e.date}</span>
                {e.isSponsored && <span className="tagline">Sponsored</span>}
              </div>
              {e.url ? (
                <a href={e.url} target="_blank" rel="noreferrer" className="mt-2 font-display text-[22px] leading-snug hover:text-ember">
                  {e.title}
                </a>
              ) : (
                <h3 className="mt-2 font-display text-[22px] leading-snug">{e.title}</h3>
              )}
              {e.location && <div className="mt-1 text-[13px] text-faint">{e.location}</div>}
              {e.description && <p className="mt-2 flex-1 text-[14px] text-muted">{e.description}</p>}
              <div className="mt-3 border-t border-hair pt-2 text-[12px] text-faint">via {e.authorName}</div>
            </Card>
          ))}
          {events?.length === 0 && <p className="text-muted">No events posted yet.</p>}
        </div>
      )}

      <p className="mt-10 text-[13px] text-faint">
        Run a fund or agency and want to post here? Sign in to the{" "}
        <a href="/vc/login" className="text-ember">
          investor dashboard
        </a>
        .
      </p>
    </Container>
  );
}
