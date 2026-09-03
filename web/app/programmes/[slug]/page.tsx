"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Container, Eyebrow, Card, Button, Field, inputCls } from "@/components/ui";
import { Logo } from "@/components/media";
import { Stars } from "@/components/viz";

export default function ProgrammePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const p = useQuery(api.programmes.getProgrammeBySlug, { slug });

  if (p === undefined)
    return (
      <Container className="py-20">
        <div className="h-8 w-72 animate-pulse rounded bg-paper-2" />
      </Container>
    );
  if (p === null)
    return (
      <Container className="py-20">
        <h1 className="font-display text-4xl">Programme not found.</h1>
        <Link href="/programmes" className="mt-4 inline-block text-ember">
          &larr; All programmes
        </Link>
      </Container>
    );

  const r = p.rating;

  return (
    <Container className="py-16">
      <Link href="/programmes" className="font-mono-x text-[12px] text-faint hover:text-ink">
        &larr; Grants &amp; cohorts
      </Link>

      <div className="mt-5 grid gap-12 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="tagline">{p.kind}</span>
            {p.lifecycle && (
              <span className="rounded-full bg-paper-2 px-2.5 py-1 text-[11px] text-muted">
                {p.lifecycle}
              </span>
            )}
            {p.cadence && (
              <span className="rounded-full bg-paper-2 px-2.5 py-1 text-[11px] text-muted">
                {p.cadence}
              </span>
            )}
          </div>
          <div className="mt-3 flex items-center gap-4">
            <Logo src={p.logoUrl} name={p.contributor?.name ?? p.name} size={60} />
            <div>
              <h1 className="font-display text-[clamp(32px,5vw,52px)] leading-[1]">{p.name}</h1>
              {p.contributor && (
                <Link
                  href={`/contributors/${p.contributor.slug}`}
                  className="mt-1 inline-block font-mono-x text-[13px] text-ember"
                >
                  {p.contributor.name} · {p.contributor.type}
                </Link>
              )}
            </div>
          </div>

          {p.description ? (
            <p className="mt-5 max-w-xl text-[16px] text-muted">{p.description}</p>
          ) : (
            p.summary && <p className="mt-5 max-w-xl text-[16px] text-muted">{p.summary}</p>
          )}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Info k="Funding" v={p.fundingAmount ?? "—"} />
            <Info k="Equity" v={p.equity ?? "—"} />
            <Info k="Stage focus" v={p.stageFocus.length ? p.stageFocus.join(", ") : "Any"} />
            <Info k="Sector focus" v={p.sectorFocus.length ? p.sectorFocus.join(", ") : "Any"} />
          </div>
          {p.url && (
            <a
              href={p.url}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block font-mono-x text-[13px] text-ember"
            >
              Programme site &nearr;
            </a>
          )}

          {/* startups that went through */}
          <div className="mt-10">
            <div className="tagline">Founders Drive startups that went through this</div>
            {p.startups.length === 0 ? (
              <p className="mt-2 text-[14px] text-muted">
                None tagged yet. If you did this programme,{" "}
                <Link href="/directory" className="text-ember">
                  add it to your startup profile
                </Link>
                .
              </p>
            ) : (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {p.startups.map((s: any) => (
                  <Link key={s.slug} href={`/directory/${s.slug}`}>
                    <Card className="fd-lift flex items-center gap-3 p-4">
                      <Logo src={s.logoUrl} name={s.name} size={40} />
                      <div className="min-w-0">
                        <div className="font-serif-x text-[16px] leading-tight">{s.name}</div>
                        <div className="text-[12px] text-faint">
                          {[s.cohortLabel, s.year].filter(Boolean).join(" · ") || s.sector}
                          {s.verified ? " · verified" : ""}
                        </div>
                        {s.outcome && (
                          <div className="mt-0.5 text-[12px] text-muted">{s.outcome}</div>
                        )}
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* anonymous feedback */}
          <div className="mt-10">
            <div className="tagline">Founder feedback · anonymous</div>
            {p.feedback.length === 0 ? (
              <p className="mt-2 text-[14px] text-muted">No ratings yet.</p>
            ) : (
              <div className="mt-3 grid gap-3">
                {p.feedback.map((f: any, i: number) => (
                  <Card key={i} className="p-5">
                    <div className="flex items-center justify-between">
                      <Stars value={f.ratingOverall} />
                      <span className="tagline">
                        {f.cohortLabel ? `${f.cohortLabel} · ` : ""}
                        {f.wouldRecommend === true
                          ? "would recommend"
                          : f.wouldRecommend === false
                            ? "would not recommend"
                            : ""}
                      </span>
                    </div>
                    {f.comment && (
                      <p className="font-serif-x mt-2 text-[15px] text-ink">&ldquo;{f.comment}&rdquo;</p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-faint">
                      {f.ratingMentorship != null && <span>Mentorship {f.ratingMentorship}/5</span>}
                      {f.ratingFunding != null && <span>Funding {f.ratingFunding}/5</span>}
                      {f.ratingNetwork != null && <span>Network {f.ratingNetwork}/5</span>}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">
          <Card className="p-6">
            <Eyebrow>The room says</Eyebrow>
            {r.count > 0 ? (
              <>
                <div className="mt-3 flex items-baseline gap-3">
                  <span className="font-display text-[44px]">{r.overall}</span>
                  <Stars value={r.overall ?? 0} size={20} />
                </div>
                <div className="tagline mt-1">
                  {r.count} founder{r.count > 1 ? "s" : ""}
                  {r.recommendPct != null ? ` · ${r.recommendPct}% recommend` : ""}
                </div>
                <div className="mt-4 grid gap-2 text-[13px]">
                  {(
                    [
                      ["Mentorship", r.mentorship],
                      ["Funding", r.funding],
                      ["Network", r.network],
                    ] as const
                  ).map(([k, val]) =>
                    val ? (
                      <div key={k} className="flex items-center justify-between">
                        <span className="text-muted">{k}</span>
                        <span className="font-mono-x">{val} / 5</span>
                      </div>
                    ) : null,
                  )}
                </div>
              </>
            ) : (
              <p className="mt-3 text-[14px] text-muted">
                No ratings yet — be the first once you&rsquo;ve added this programme to your profile.
              </p>
            )}
          </Card>

          <FeedbackCard programmeId={p._id} programmeName={p.name} />
        </div>
      </div>
    </Container>
  );
}

function Info({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-lg border border-hair bg-paper p-3.5">
      <div className="tagline">{k}</div>
      <div className="mt-1 text-[15px]">{v}</div>
    </div>
  );
}

function FeedbackCard({ programmeId, programmeName }: { programmeId: string; programmeName: string }) {
  const submit = useMutation(api.programmes.submitProgrammeFeedback);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({
    startupSlug: "",
    ownerEmail: "",
    overall: 0,
    mentorship: 0,
    funding: 0,
    network: 0,
    recommend: "" as "" | "yes" | "no",
    comment: "",
    cohortLabel: "",
  });
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [err, setErr] = useState<string | null>(null);

  const ready =
    f.startupSlug.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.ownerEmail.trim()) &&
    f.overall >= 1;

  async function go() {
    setState("busy");
    setErr(null);
    try {
      await submit({
        programmeId: programmeId as never,
        startupSlug: f.startupSlug.trim(),
        ownerEmail: f.ownerEmail.trim(),
        ratingOverall: f.overall,
        ratingMentorship: f.mentorship || undefined,
        ratingFunding: f.funding || undefined,
        ratingNetwork: f.network || undefined,
        wouldRecommend: f.recommend === "" ? undefined : f.recommend === "yes",
        comment: f.comment || undefined,
        cohortLabel: f.cohortLabel || undefined,
      });
      setState("done");
    } catch (e) {
      setErr((e as Error).message);
      setState("idle");
    }
  }

  return (
    <Card className="p-6">
      <Eyebrow>Rate this programme</Eyebrow>
      {state === "done" ? (
        <p className="mt-3 text-[15px] text-muted">
          Thank you — your rating is in. Comments show anonymously; nothing links back to your
          startup.
        </p>
      ) : (
        <>
          <p className="mt-2 text-[14px] text-muted">
            For startups that went through {programmeName}. Add it to your profile first, then rate
            with the email on the profile. Your identity is never shown.
          </p>
          {!open ? (
            <button
              onClick={() => setOpen(true)}
              className="mt-4 rounded-full border border-hair-2 px-4 py-2 text-[13px] font-medium hover:border-ink"
            >
              Leave a rating
            </button>
          ) : (
            <div className="mt-4 grid gap-3">
              <Field label="Your startup slug" hint="e.g. aerocrop — from your directory URL">
                <input className={inputCls} value={f.startupSlug} onChange={(e) => setF({ ...f, startupSlug: e.target.value })} />
              </Field>
              <Field label="Owner email">
                <input className={inputCls} value={f.ownerEmail} onChange={(e) => setF({ ...f, ownerEmail: e.target.value })} />
              </Field>
              <div>
                <span className="mb-1.5 block text-[13px] font-medium">Overall</span>
                <Stars value={f.overall} onChange={(v) => setF({ ...f, overall: v })} size={26} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(["mentorship", "funding", "network"] as const).map((k) => (
                  <div key={k}>
                    <span className="mb-1 block text-[12px] capitalize text-muted">{k}</span>
                    <Stars
                      value={f[k]}
                      onChange={(v) => setF({ ...f, [k]: v })}
                      size={16}
                    />
                  </div>
                ))}
              </div>
              <Field label="Cohort / year" hint="Optional">
                <input className={inputCls} value={f.cohortLabel} onChange={(e) => setF({ ...f, cohortLabel: e.target.value })} placeholder="Batch 7, 2025…" />
              </Field>
              <Field label="Comment — shown anonymously" hint="Optional">
                <textarea className={`${inputCls} min-h-[80px]`} value={f.comment} onChange={(e) => setF({ ...f, comment: e.target.value })} />
              </Field>
              <div className="flex gap-2 text-[13px]">
                <span className="self-center text-muted">Would you recommend it?</span>
                {(["yes", "no"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setF({ ...f, recommend: f.recommend === v ? "" : v })}
                    className={`rounded-full border px-3 py-1 ${
                      f.recommend === v ? "border-ember bg-[rgba(198,65,10,0.08)] text-ember" : "border-hair-2 text-muted"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
              {err && <p className="text-[12.5px] text-[#a63244]">{err}</p>}
              <Button onClick={go} disabled={!ready || state === "busy"}>
                {state === "busy" ? "Submitting…" : "Submit rating"}
              </Button>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
