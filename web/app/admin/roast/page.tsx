"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Container, Eyebrow, Card } from "@/components/ui";

export default function AdminRoastPage() {
  const data = useQuery(api.events.adminGetPitchApplications, {});
  const select = useMutation(api.events.selectForPitch);
  const deselect = useMutation(api.events.deselectFromPitch);
  const setStatus = useMutation(api.events.setPitchApplicationStatus);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function run(id: string, fn: () => Promise<unknown>) {
    setBusy(id);
    setErr(null);
    try {
      await fn();
    } catch (e) {
      setErr((e as Error).message || "Something went wrong.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Container className="py-16">
      <Eyebrow>Founders Drive · host console</Eyebrow>
      <h1 className="font-display mt-4 text-[clamp(30px,4vw,48px)]">Roast My Startup lineup</h1>
      <p className="font-serif-x mt-3 max-w-xl text-[18px] text-muted">
        Anyone can apply to pitch — only {data?.maxPitching ?? 4} make it on stage. Select up to{" "}
        {data?.maxPitching ?? 4}; the rest stay in the applicant pool until you decide.
      </p>
      <p className="mt-4 rounded-md border border-hair-2 bg-paper-2 px-3 py-2 text-[13px] text-muted">
        v1 has no authentication — gate this route (or move it to a secret URL) before launch.
      </p>

      {data === undefined && (
        <div className="mt-8 grid gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-paper-2" />
          ))}
        </div>
      )}

      {data === null && (
        <p className="mt-8 text-muted">
          No upcoming or live event yet. Run the seed or create one first.
        </p>
      )}

      {data && (
        <>
          <div className="mt-8 flex items-center justify-between rounded-2xl border border-hair bg-card px-6 py-4">
            <div>
              <div className="font-serif-x text-lg">{data.event.title}</div>
              <div className="text-[13px] text-muted">{data.event.date}</div>
            </div>
            <div className="font-mono-x text-sm">
              <span className={data.selectedCount >= data.maxPitching ? "text-ember" : ""}>
                {data.selectedCount} / {data.maxPitching}
              </span>{" "}
              selected
            </div>
          </div>

          {err && (
            <p className="mt-4 rounded-md border border-[#a63244]/30 bg-[#a63244]/5 px-3 py-2 text-[13px] text-[#a63244]">
              {err}
            </p>
          )}

          <div className="mt-6 grid gap-3">
            {data.applications.map((a: any) => (
              <Card key={a._id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="font-display text-[20px]">{a.companyName}</div>
                    <div className="mt-1 max-w-lg text-[14px] text-muted">{a.oneLiner}</div>
                    <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                      <Pill>{a.sector}</Pill>
                      <Pill>{a.stage}</Pill>
                      <Pill on={a.status === "Selected"}>{a.status}</Pill>
                    </div>
                    <div className="mt-2 font-mono-x text-[12.5px] text-muted">
                      {a.founderName} · {a.email}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {a.status === "Selected" ? (
                      <button
                        onClick={() => run(a._id, () => deselect({ applicationId: a._id }))}
                        disabled={busy === a._id}
                        className="rounded-full border border-hair-2 px-4 py-2 text-[13px] font-medium hover:border-ink disabled:opacity-40"
                      >
                        Remove from lineup
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => run(a._id, () => select({ applicationId: a._id }))}
                          disabled={busy === a._id || data.selectedCount >= data.maxPitching}
                          className="rounded-full bg-ember px-4 py-2 text-[13px] font-medium text-[#fff7f0] disabled:opacity-40"
                        >
                          Select to pitch
                        </button>
                        {a.status !== "Rejected" && (
                          <button
                            onClick={() =>
                              run(a._id, () =>
                                setStatus({ applicationId: a._id, status: "Rejected" }),
                              )
                            }
                            disabled={busy === a._id}
                            className="rounded-full border border-hair-2 px-4 py-2 text-[13px] font-medium hover:border-ink disabled:opacity-40"
                          >
                            Reject
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
            {data.applications.length === 0 && (
              <p className="text-muted">No applications for this event yet.</p>
            )}
          </div>
        </>
      )}
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
