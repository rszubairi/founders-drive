"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Container, Eyebrow, Card } from "@/components/ui";

/**
 * Host control for the live poll — no auth in v1. Put this behind an
 * auth check or a secret route before running a public event.
 */
export default function PollAdminPage() {
  const poll = useQuery(api.polls.getActivePoll);
  const setActive = useMutation(api.polls.setActivePitch);

  return (
    <Container className="py-16">
      <Eyebrow>Roast My Startup · host console</Eyebrow>
      <h1 className="font-display mt-4 text-[clamp(30px,4vw,48px)]">Run the audience poll.</h1>
      <p className="font-serif-x mt-3 max-w-xl text-[18px] text-muted">
        Put a pitch on the clock — that opens it for scoring at{" "}
        <code className="font-mono-x">/poll</code>. Closing one keeps its results; only the{" "}
        <b>Active</b> pitch accepts new votes.
      </p>

      <p className="mt-4 rounded-md border border-hair-2 bg-paper-2 px-3 py-2 text-[13px] text-muted">
        v1 has no authentication. Add an auth gate or move this to a secret URL before a real event.
      </p>

      <div className="mt-8 grid gap-3">
        {poll?.lineup.map((p: any) => (
          <Card key={p._id} className="flex items-center justify-between p-5">
            <div>
              <div className="font-mono-x text-xs text-faint">Pitch {p.pitchNumber}</div>
              <div className="font-serif-x text-xl">{p.startupName}</div>
            </div>
            <div className="flex items-center gap-4">
              <span
                className={`tagline ${
                  p.status === "Active" ? "text-ember" : ""
                }`}
              >
                {p.status}
              </span>
              <button
                onClick={() => setActive({ pollId: p._id })}
                disabled={p.status === "Active"}
                className="rounded-full bg-ember px-5 py-2.5 text-sm font-medium text-[#fff7f0] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:translate-y-0"
              >
                {p.status === "Active" ? "Live now" : "Make active"}
              </button>
            </div>
          </Card>
        ))}
        {poll && poll.lineup.length === 0 && (
          <p className="text-muted">
            No polls yet. Run the seed (<code className="font-mono-x">npx convex run seed:seed</code>).
          </p>
        )}
      </div>
    </Container>
  );
}
