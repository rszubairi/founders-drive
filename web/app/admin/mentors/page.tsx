"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Container, Eyebrow, Card } from "@/components/ui";
import { Avatar } from "@/components/media";

const FILTERS = ["pending", "approved", "rejected"];

export default function AdminMentorsPage() {
  const [status, setStatus] = useState<string | null>("pending");
  const mentors = useQuery(api.mentors.adminListMentors, status ? { status } : {});
  const decide = useMutation(api.mentors.decideMentor);
  const [busy, setBusy] = useState<string | null>(null);

  async function act(id: string, approve: boolean) {
    setBusy(id);
    try {
      await decide({ mentorId: id as never, approve });
    } finally {
      setBusy(null);
    }
  }

  return (
    <Container className="py-16">
      <Eyebrow>Founders Drive · host console</Eyebrow>
      <h1 className="font-display mt-4 text-[clamp(30px,4vw,48px)]">Mentor sign-ups</h1>
      <p className="font-serif-x mt-3 max-w-xl text-[18px] text-muted">
        Approve mentors before they appear in the network. Their rate shows to startups with the
        20% Founders Drive fee added on top.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        {FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(status === s ? null : s)}
            className={`rounded-full border px-3.5 py-2 text-[13px] transition ${
              status === s ? "border-ember bg-[rgba(198,65,10,0.08)] text-ember" : "border-hair-2 text-muted"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-3">
        {mentors === undefined &&
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-paper-2" />
          ))}
        {mentors?.map((m: any) => (
          <Card key={m._id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex gap-3">
                <Avatar src={m.photoUrl} name={m.name} size={48} />
                <div>
                  <div className="font-serif-x text-[18px]">
                    {m.name}
                    {m.title ? <span className="text-muted"> — {m.title}</span> : null}
                  </div>
                  <div className="font-mono-x text-[12.5px] text-muted">{m.email}</div>
                  <p className="mt-1.5 max-w-lg text-[13.5px] text-muted">{m.bio}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {m.categories.map((c: string) => (
                      <span key={c} className="rounded-full bg-paper-2 px-2 py-0.5 text-[11px] text-muted">
                        {c}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-4 text-[12.5px] text-faint">
                    <span>
                      Rate: RM {m.mentorRate} → startups pay <b className="text-ink">RM {m.startupRate}</b> (fee RM {m.platformFee})
                    </span>
                    <a href={m.calendlyUrl} target="_blank" rel="noreferrer" className="text-ember">
                      Calendly
                    </a>
                    {m.linkedin && (
                      <a href={m.linkedin} target="_blank" rel="noreferrer" className="text-ember">
                        LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="tagline">{m.status ?? "pending"}</span>
                {(m.status ?? "pending") !== "approved" && (
                  <button
                    onClick={() => act(m._id, true)}
                    disabled={busy === m._id}
                    className="rounded-full bg-ember px-4 py-2 text-[13px] font-medium text-[#fff7f0] disabled:opacity-40"
                  >
                    Approve
                  </button>
                )}
                {(m.status ?? "pending") !== "rejected" && (
                  <button
                    onClick={() => act(m._id, false)}
                    disabled={busy === m._id}
                    className="rounded-full border border-hair-2 px-4 py-2 text-[13px] font-medium hover:border-ink disabled:opacity-40"
                  >
                    Reject
                  </button>
                )}
                {(m.status ?? "pending") === "approved" && (
                  <Link href={`/mentors/${m.slug}`} className="font-mono-x text-[12px] text-ember">
                    View →
                  </Link>
                )}
              </div>
            </div>
          </Card>
        ))}
        {mentors?.length === 0 && (
          <p className="text-muted">No mentors {status ? `in "${status}"` : ""} right now.</p>
        )}
      </div>
    </Container>
  );
}
