"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Container, Eyebrow, Card } from "@/components/ui";

const FILTERS = ["pending", "approved", "rejected"];

export default function AdminStartupsPage() {
  const [filter, setFilter] = useState<string | null>("pending");
  const startups = useQuery(api.startups.adminListStartups, filter ? { status: filter } : {});
  const decide = useMutation(api.startups.decideStartup);
  const [busy, setBusy] = useState<string | null>(null);

  async function act(startupId: string, approve: boolean) {
    setBusy(startupId);
    try {
      await decide({ startupId: startupId as never, approve });
    } finally {
      setBusy(null);
    }
  }

  return (
    <Container className="py-16">
      <Eyebrow>Founders Drive · host console</Eyebrow>
      <h1 className="font-display mt-4 text-[clamp(30px,4vw,48px)]">Startup sign-ups</h1>
      <p className="font-serif-x mt-3 max-w-xl text-[18px] text-muted">
        New registrations start hidden. Approve the ones ready for the public directory — reject the
        rest, or leave them pending until you&rsquo;re sure.
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
        {startups === undefined &&
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-paper-2" />
          ))}

        {startups?.map((s: any) => (
          <Card key={s._id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <Link href={`/directory/${s.slug}`} className="font-display text-[22px] hover:text-ember">
                  {s.name}
                </Link>
                <div className="mt-1 max-w-lg text-[14px] text-muted">{s.pitch}</div>
                <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                  <Pill>{s.sector}</Pill>
                  <Pill>{s.stage}</Pill>
                  <Pill>{s.city}</Pill>
                  <Pill on={s.status === "approved"}>{s.status}</Pill>
                </div>
                {(s.founderName || s.founderEmail) && (
                  <div className="mt-2 font-mono-x text-[12.5px] text-muted">
                    {s.founderName} · {s.founderEmail}
                  </div>
                )}
              </div>

              {s.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => act(s._id, true)}
                    disabled={busy === s._id}
                    className="rounded-full bg-ember px-4 py-2 text-[13px] font-medium text-[#fff7f0] disabled:opacity-40"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => act(s._id, false)}
                    disabled={busy === s._id}
                    className="rounded-full border border-hair-2 px-4 py-2 text-[13px] font-medium hover:border-ink disabled:opacity-40"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </Card>
        ))}

        {startups?.length === 0 && (
          <p className="text-muted">Nothing {filter ? `in "${filter}"` : "here"} right now.</p>
        )}
      </div>
    </Container>
  );
}

function Pill({ on, children }: { on?: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 font-mono-x uppercase tracking-[0.1em] ${
        on ? "bg-ink text-paper" : "bg-paper-2 text-faint"
      }`}
    >
      {children}
    </span>
  );
}
