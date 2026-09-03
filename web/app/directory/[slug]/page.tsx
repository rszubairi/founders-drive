"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Container, Eyebrow, Card, Button, Field, inputCls } from "@/components/ui";
import { ScoreGauge } from "@/components/viz";
import { Logo, Avatar } from "@/components/media";

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
            {startup.claimed && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ink px-2.5 py-1 text-[11px] text-paper">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Claimed by the team
              </span>
            )}
          </div>
          <div className="mt-3 flex items-center gap-4">
            <Logo src={startup.logoUrl} name={startup.name} size={64} />
            <h1 className="font-display text-[clamp(36px,6vw,64px)] leading-[1]">{startup.name}</h1>
          </div>
          <p className="font-serif-x mt-4 max-w-xl text-[21px] leading-[1.5] text-muted">
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

          {startup.tags?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {startup.tags.map((t: string) => (
                <span
                  key={t}
                  className="rounded-full bg-paper-2 px-3 py-1 text-[12px] font-medium text-muted"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {(startup.deckUrl || startup.founderVideoUrl) && (
            <div className="mt-5 flex flex-wrap gap-3">
              {startup.deckUrl && (
                <a
                  href={startup.deckUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-hair-2 px-4 py-2 text-[13px] font-medium transition hover:border-ink"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h12l4 4v12H4z" /><path d="M16 4v4h4M8 13h8M8 17h8" /></svg>
                  Pitch deck
                </a>
              )}
              {startup.founderVideoUrl && (
                <a
                  href={startup.founderVideoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-hair-2 px-4 py-2 text-[13px] font-medium transition hover:border-ink"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m22 8-6 4 6 4V8z" /><rect x="2" y="6" width="14" height="12" rx="2" /></svg>
                  Founder intro
                </a>
              )}
            </div>
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
                  <Card key={f.name} className="flex items-center gap-3 p-4">
                    <Avatar src={f.photoUrl} name={f.name} size={44} />
                    <div>
                      <div className="font-serif-x text-lg leading-tight">{f.name}</div>
                      <div className="text-[13px] text-muted">{f.role}</div>
                    </div>
                  </Card>
                ))}
              </div>
              <p className="mt-2 text-[12px] text-faint">
                Contact details are private. Use “Request an introduction”.
              </p>
            </div>
          )}

          <ProgrammesSection
            slug={slug}
            claimed={!!startup.claimed}
            programmes={startup.programmes ?? []}
          />

          <NewsSection
            slug={slug}
            companyName={startup.name}
            claimed={!!startup.claimed}
            news={startup.news ?? []}
          />

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

          <ClaimCard slug={slug} companyName={startup.name} claimed={!!startup.claimed} />

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

function ClaimCard({
  slug,
  companyName,
  claimed,
}: {
  slug: string;
  companyName: string;
  claimed: boolean;
}) {
  const submit = useMutation(api.claims.submitClaim);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: "", email: "", role: "", note: "", evidenceUrl: "" });
  const [state, setState] = useState<"idle" | "busy" | "sent" | "yours">("idle");
  const [err, setErr] = useState<string | null>(null);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim());
  const ready = f.name.trim() && f.role.trim() && emailOk;

  async function go() {
    setState("busy");
    setErr(null);
    try {
      const res = (await submit({
        slug,
        claimantName: f.name,
        claimantEmail: f.email,
        claimantRole: f.role,
        note: f.note || undefined,
        evidenceUrl: f.evidenceUrl || undefined,
      })) as { status: string };
      setState(res.status === "already_yours" ? "yours" : "sent");
    } catch (e) {
      setErr((e as Error).message);
      setState("idle");
    }
  }

  return (
    <Card className="p-6">
      <Eyebrow>{claimed ? "This profile is claimed" : "Do you run this startup?"}</Eyebrow>

      {state === "sent" ? (
        <p className="mt-3 text-[15px] text-muted">
          Check <strong>{f.email}</strong> for a confirmation link. Once you confirm, a business
          email that matches {companyName}&rsquo;s domain is approved automatically &mdash; anything
          else goes to the Founders Drive team for review.
        </p>
      ) : state === "yours" ? (
        <p className="mt-3 text-[15px] text-muted">You already manage this profile with that email.</p>
      ) : (
        <>
          <p className="mt-2 text-[14px] text-muted">
            {claimed
              ? "Someone on the team already verified it. If that's wrong, send a claim from your company email and we'll sort it out."
              : "Claim it with your work email to receive introduction requests and keep it up to date. We'll email you a link to confirm the address."}
          </p>

          {!open ? (
            <button
              onClick={() => setOpen(true)}
              className="mt-4 rounded-full border border-hair-2 px-4 py-2 text-[13px] font-medium transition hover:border-ink"
            >
              {claimed ? "Send a claim anyway" : "Claim this profile"}
            </button>
          ) : (
            <div className="mt-4 grid gap-3">
              <Field label="Your name">
                <input className={inputCls} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
              </Field>
              <Field label="Role at the company">
                <input className={inputCls} value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })} placeholder="Co-founder & CEO" />
              </Field>
              <Field label="Business email" hint="Use a company-domain address if you have one — it verifies instantly.">
                <input className={inputCls} type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder={`you@${companyName.toLowerCase().replace(/[^a-z0-9]/g, "")}.my`} />
              </Field>
              <Field label="Anything to add?" hint="Optional">
                <textarea className={`${inputCls} min-h-[70px]`} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} />
              </Field>
              <Field label="Proof link" hint="Optional — LinkedIn, team page, press">
                <input className={inputCls} value={f.evidenceUrl} onChange={(e) => setF({ ...f, evidenceUrl: e.target.value })} placeholder="https://" />
              </Field>
              {err && <p className="text-[12.5px] text-[#a63244]">{err}</p>}
              <Button onClick={go} disabled={!ready || state === "busy"}>
                {state === "busy" ? "Sending…" : "Send claim"}
              </Button>
            </div>
          )}
        </>
      )}
    </Card>
  );
}

function ProgrammesSection({
  slug,
  claimed,
  programmes,
}: {
  slug: string;
  claimed: boolean;
  programmes: any[];
}) {
  const all = useQuery(api.programmes.listProgrammes, claimed ? {} : "skip");
  const tag = useMutation(api.programmes.tagStartupProgramme);
  const untag = useMutation(api.programmes.untagStartupProgramme);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({
    ownerEmail: "",
    programmeId: "",
    cohortLabel: "",
    year: "",
    outcome: "",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const ready =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.ownerEmail.trim()) && f.programmeId;

  async function add() {
    setBusy(true);
    setErr(null);
    try {
      await tag({
        startupSlug: slug,
        ownerEmail: f.ownerEmail,
        programmeId: f.programmeId as never,
        cohortLabel: f.cohortLabel || undefined,
        year: f.year ? Number(f.year) : undefined,
        outcome: f.outcome || undefined,
      });
      setF({ ...f, programmeId: "", cohortLabel: "", year: "", outcome: "" });
      setOpen(false);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (programmes.length === 0 && !claimed) return null;

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between">
        <div className="tagline">Programmes &amp; grants</div>
        {claimed && !open && (
          <button
            onClick={() => setOpen(true)}
            className="font-mono-x text-[12px] text-ember hover:text-ember-deep"
          >
            + Add a programme
          </button>
        )}
      </div>

      {programmes.length > 0 && (
        <div className="mt-3 grid gap-2.5">
          {programmes.map((p: any) => (
            <div
              key={p.linkId}
              className="flex items-start justify-between gap-3 rounded-lg border border-hair bg-card p-4"
            >
              <div>
                <Link
                  href={`/programmes/${p.slug}`}
                  className="font-serif-x text-[16px] text-ink hover:text-ember"
                >
                  {p.name}
                </Link>
                <div className="text-[12px] text-faint">
                  {[p.contributor, p.cohortLabel, p.year].filter(Boolean).join(" · ")}
                  {p.verified ? " · verified" : ""}
                </div>
                {p.outcome && <div className="mt-0.5 text-[12.5px] text-muted">{p.outcome}</div>}
              </div>
              <span className="flex items-center gap-2">
                <span className="tagline">{p.kind}</span>
                {claimed && (
                  <button
                    onClick={() =>
                      untag({ startupSlug: slug, ownerEmail: f.ownerEmail, linkId: p.linkId }).catch(
                        (e) => setErr((e as Error).message),
                      )
                    }
                    title="Remove — needs the owner email entered below"
                    className="text-faint hover:text-[#a63244]"
                  >
                    ×
                  </button>
                )}
              </span>
            </div>
          ))}
        </div>
      )}

      {open && (
        <Card className="mt-3 p-5">
          <div className="grid gap-3">
            <Field label="Owner email" hint="The email the profile was claimed with.">
              <input className={inputCls} value={f.ownerEmail} onChange={(e) => setF({ ...f, ownerEmail: e.target.value })} />
            </Field>
            <Field label="Programme">
              <select className={inputCls} value={f.programmeId} onChange={(e) => setF({ ...f, programmeId: e.target.value })}>
                <option value="">Select a programme</option>
                {(all ?? []).map((p: any) => (
                  <option key={p._id} value={p._id}>
                    {p.contributor?.shortName ? `${p.contributor.shortName} — ` : ""}
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Cohort / batch" hint="Optional">
                <input className={inputCls} value={f.cohortLabel} onChange={(e) => setF({ ...f, cohortLabel: e.target.value })} placeholder="Batch 7" />
              </Field>
              <Field label="Year" hint="Optional">
                <input className={inputCls} inputMode="numeric" value={f.year} onChange={(e) => setF({ ...f, year: e.target.value.replace(/[^0-9]/g, "") })} placeholder="2025" />
              </Field>
            </div>
            <Field label="Outcome" hint="Optional">
              <input className={inputCls} value={f.outcome} onChange={(e) => setF({ ...f, outcome: e.target.value })} placeholder="Graduated · awarded RM 150k" />
            </Field>
            {err && <p className="text-[12.5px] text-[#a63244]">{err}</p>}
            <div className="flex gap-2">
              <Button onClick={add} disabled={!ready || busy}>
                {busy ? "Adding…" : "Add"}
              </Button>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

function NewsSection({
  slug,
  companyName,
  claimed,
  news,
}: {
  slug: string;
  companyName: string;
  claimed: boolean;
  news: any[];
}) {
  const add = useMutation(api.media.addStartupNews);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({
    ownerEmail: "",
    title: "",
    url: "",
    source: "",
    publishedAt: "",
    summary: "",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState(false);

  const ready =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.ownerEmail.trim()) &&
    f.title.trim() &&
    /^https?:\/\//i.test(f.url.trim());

  async function go() {
    setBusy(true);
    setErr(null);
    try {
      await add({
        slug,
        ownerEmail: f.ownerEmail,
        title: f.title,
        url: f.url,
        source: f.source || undefined,
        publishedAt: f.publishedAt || undefined,
        summary: f.summary || undefined,
      });
      setOkMsg(true);
      setF({ ...f, title: "", url: "", source: "", publishedAt: "", summary: "" });
      setOpen(false);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (news.length === 0 && !claimed) return null;

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between">
        <div className="tagline">In the news</div>
        {claimed && !open && (
          <button
            onClick={() => setOpen(true)}
            className="font-mono-x text-[12px] text-ember hover:text-ember-deep"
          >
            + Add coverage
          </button>
        )}
      </div>

      {okMsg && news.length === 0 && (
        <p className="mt-2 text-[13px] text-muted">Added — it&rsquo;ll show on the next load.</p>
      )}

      {news.length > 0 && (
        <div className="mt-3 grid gap-3">
          {news.map((n) => (
            <a
              key={n._id}
              href={n.url}
              target="_blank"
              rel="noreferrer"
              className="group flex gap-4 rounded-lg border border-hair bg-card p-4 transition hover:border-ink"
            >
              {n.imageUrl && (
                <span className="relative hidden h-16 w-24 flex-none overflow-hidden rounded bg-paper-2 sm:block">
                  {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary publisher host */}
                  <img src={n.imageUrl} alt="" className="h-full w-full object-cover" />
                </span>
              )}
              <span className="min-w-0">
                <span className="tagline text-faint">
                  {[n.source, n.publishedAt].filter(Boolean).join(" · ") || "Press"}
                </span>
                <span className="mt-0.5 block font-serif-x text-[16px] leading-snug text-ink group-hover:text-ember">
                  {n.title}
                </span>
                {n.summary && (
                  <span className="mt-1 block text-[13px] text-muted">{n.summary}</span>
                )}
              </span>
            </a>
          ))}
        </div>
      )}

      {open && (
        <Card className="mt-3 p-5">
          <div className="grid gap-3">
            <Field label={`Owner email for ${companyName}`} hint="The email the profile was claimed with.">
              <input className={inputCls} value={f.ownerEmail} onChange={(e) => setF({ ...f, ownerEmail: e.target.value })} />
            </Field>
            <Field label="Headline">
              <input className={inputCls} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
            </Field>
            <Field label="Article URL">
              <input className={inputCls} value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} placeholder="https://" />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Publication" hint="Optional">
                <input className={inputCls} value={f.source} onChange={(e) => setF({ ...f, source: e.target.value })} placeholder="The Edge, Tech in Asia…" />
              </Field>
              <Field label="Date" hint="Optional">
                <input className={inputCls} value={f.publishedAt} onChange={(e) => setF({ ...f, publishedAt: e.target.value })} placeholder="Mar 2026" />
              </Field>
            </div>
            <Field label="One-line summary" hint="Optional">
              <input className={inputCls} value={f.summary} onChange={(e) => setF({ ...f, summary: e.target.value })} />
            </Field>
            {err && <p className="text-[12.5px] text-[#a63244]">{err}</p>}
            <div className="flex gap-2">
              <Button onClick={go} disabled={!ready || busy}>
                {busy ? "Adding…" : "Add"}
              </Button>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
