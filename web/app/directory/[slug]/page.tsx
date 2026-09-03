"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Container, Eyebrow, Card, Button, Field, inputCls } from "@/components/ui";
import { ScoreGauge } from "@/components/viz";

export default function StartupProfile({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const startup = useQuery(api.startups.getStartupBySlug, { slug });
  const matches = useQuery(api.investors.matchStartupToVCs, { slug });
  const requestIntro = useMutation(api.startups.requestIntro);

  const [intro, setIntro] = useState({ name: "", email: "", org: "", reason: "" });
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  if (startup === undefined)
    return (
      <Container className="py-20">
        <div className="h-8 w-64 animate-pulse rounded bg-paper-2" />
      </Container>
    );
  if (startup === null)
    return (
      <Container className="py-20">
        <h1 className="font-display text-4xl">Startup not found.</h1>
        <Link href="/directory" className="mt-4 inline-block text-ember">
          &larr; Back to the directory
        </Link>
      </Container>
    );

  async function send() {
    setBusy(true);
    try {
      await requestIntro({
        slug,
        requesterName: intro.name,
        requesterEmail: intro.email,
        requesterOrg: intro.org || undefined,
        reason: intro.reason,
      });
      setSent(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Container className="py-16">
      <Link href="/directory" className="font-mono-x text-[12px] text-faint hover:text-ink">
        &larr; Directory
      </Link>

      <div className="mt-5 grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="tagline">{startup.sector}</span>
            <span className="rounded-full bg-paper-2 px-2.5 py-1 text-[11px] text-muted">
              {startup.stage}
            </span>
            <span className="rounded-full bg-[rgba(198,65,10,0.12)] px-2.5 py-1 text-[11px] text-ember">
              {startup.fundStatus}
            </span>
          </div>
          <h1 className="font-display mt-3 text-[clamp(40px,6vw,68px)]">{startup.name}</h1>
          <p className="font-serif-x mt-3 max-w-xl text-[21px] leading-[1.5] text-muted">
            {startup.pitch}
          </p>
          {startup.description && (
            <p className="mt-4 max-w-xl text-[16px] text-muted">{startup.description}</p>
          )}
          {startup.website && (
            <a
              href={startup.website}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block font-mono-x text-[13px] text-ember"
            >
              {startup.website.replace(/^https?:\/\//, "")} &nearr;
            </a>
          )}

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Info k="City" v={startup.city} />
            <Info k="Team size" v={startup.teamSize ?? "—"} />
            <Info k="Raised to date" v={startup.fundingRaised ?? "—"} />
            <Info k="Target raise" v={startup.targetAmount ?? "—"} />
          </div>

          {startup.traction && (
            <div className="mt-6">
              <div className="tagline">Traction</div>
              <p className="mt-1.5 text-[16px]">{startup.traction}</p>
            </div>
          )}

          {startup.helpWanted.length > 0 && (
            <div className="mt-6">
              <div className="tagline">Help wanted</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {startup.helpWanted.map((h: string) => (
                  <span
                    key={h}
                    className="rounded-full border border-hair-2 px-3 py-1.5 text-[13px] text-muted"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}

          {startup.founders?.length > 0 && (
            <div className="mt-8">
              <div className="tagline">Team</div>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                {startup.founders.map((f: any) => (
                  <Card key={f.name} className="p-4">
                    <div className="font-serif-x text-lg">{f.name}</div>
                    <div className="text-[13px] text-muted">{f.role}</div>
                  </Card>
                ))}
              </div>
              <p className="mt-2 text-[12px] text-faint">
                Contact details are private. Use “Request an introduction”.
              </p>
            </div>
          )}

          {startup.report && (
            <Card className="mt-10 p-7">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <Eyebrow>Reality Check report</Eyebrow>
                  <h2 className="font-display mt-2 text-3xl">What the panel found</h2>
                </div>
                <ScoreGauge value={startup.report.score} size={110} label="/ 100" />
              </div>
              <div className="mt-5 grid gap-5 sm:grid-cols-3">
                <ReportCol title="Critical" items={startup.report.criticalIssues} accent />
                <ReportCol title="Important" items={startup.report.importantIssues} />
                <ReportCol title="Strengths" items={startup.report.strengths} />
              </div>
              <div className="mt-6">
                <div className="tagline">Top actions · WHY → WHAT → HOW → WHO</div>
                <div className="mt-2 grid gap-2">
                  {startup.report.top3Actions.map((a: any, i: number) => (
                    <div key={i} className="rounded-lg border border-hair bg-paper p-4 text-[14px]">
                      <b>Why</b> {a.why}
                      <br />
                      <b>What</b> {a.what} &nbsp; <b>How</b> {a.how}
                      <br />
                      <b className="text-ember">Who</b> {a.who}
                    </div>
                  ))}
                </div>
              </div>
              {startup.actionPlans?.length > 0 && (
                <div className="mt-6">
                  <div className="tagline">You Said / We Did</div>
                  <div className="mt-2 border-l-2 border-ember/30 pl-5">
                    {startup.actionPlans.map((p: any) => (
                      <div key={p._id} className="relative pb-4 last:pb-0">
                        <span className="absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full bg-ember" />
                        <div className="font-mono-x text-[11px] text-ember">DAY {p.milestoneDay}</div>
                        <div className="text-[14px]">{p.title}</div>
                        <div className="text-[12px] text-faint">
                          {p.status}
                          {p.evidence ? ` — ${p.evidence}` : ""}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">
          <Card className="p-6">
            <Eyebrow>Request an introduction</Eyebrow>
            {sent ? (
              <p className="mt-3 text-[15px] text-muted">
                Sent. {startup.name} can accept or decline &mdash; you&rsquo;ll hear back only if
                they accept.
              </p>
            ) : (
              <div className="mt-4 grid gap-4">
                <Field label="Your name">
                  <input
                    className={inputCls}
                    value={intro.name}
                    onChange={(e) => setIntro({ ...intro, name: e.target.value })}
                  />
                </Field>
                <Field label="Email">
                  <input
                    className={inputCls}
                    value={intro.email}
                    onChange={(e) => setIntro({ ...intro, email: e.target.value })}
                  />
                </Field>
                <Field label="Organisation" hint="Optional">
                  <input
                    className={inputCls}
                    value={intro.org}
                    onChange={(e) => setIntro({ ...intro, org: e.target.value })}
                  />
                </Field>
                <Field label="Why you'd like the intro">
                  <textarea
                    className={`${inputCls} min-h-[80px]`}
                    value={intro.reason}
                    onChange={(e) => setIntro({ ...intro, reason: e.target.value })}
                  />
                </Field>
                <Button
                  onClick={send}
                  disabled={busy || !intro.name || !intro.email || !intro.reason}
                >
                  {busy ? "Sending…" : "Send request"}
                </Button>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <Eyebrow>Capital Connect · VC matches</Eyebrow>
            <div className="mt-4 grid gap-3">
              {matches === undefined && <div className="h-20 animate-pulse rounded bg-paper-2" />}
              {matches?.slice(0, 4).map((m: any) => (
                <div key={m.investor._id} className="rounded-lg border border-hair p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-serif-x text-[16px]">{m.investor.fundName}</span>
                    <span className="font-mono-x text-[13px] text-ember">{m.score}%</span>
                  </div>
                  <p className="mt-1 text-[12.5px] text-muted">{m.reasons.join(" · ")}</p>
                </div>
              ))}
              {matches?.length === 0 && (
                <p className="text-[13px] text-faint">No strong matches yet.</p>
              )}
            </div>
            <Link href="/capital-connect" className="mt-3 inline-block font-mono-x text-[13px] text-ember">
              See the full investor directory &rarr;
            </Link>
          </Card>
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
function ReportCol({
  title,
  items,
  accent,
}: {
  title: string;
  items: string[];
  accent?: boolean;
}) {
  return (
    <div className={`border-t-2 pt-2.5 ${accent ? "border-ember" : "border-ink"}`}>
      <div className="tagline">{title}</div>
      <ul className="mt-2 space-y-1.5 text-[13px] text-muted">
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ul>
    </div>
  );
}
