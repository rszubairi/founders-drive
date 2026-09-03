"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Container, Eyebrow, Card, Button, Field, inputCls } from "@/components/ui";
import { ImageUpload, FileUpload } from "@/components/media";

const SECTORS = [
  "Fintech",
  "SaaS / B2B software",
  "Agritech / Deep Tech",
  "Healthtech / AI",
  "Marketplace / Logistics",
  "Consumer / D2C",
  "Climate / Energy",
  "Deep tech / Robotics",
  "Other",
];
const STAGES = ["Idea stage", "Pre-Seed", "Seed", "Series A", "Series A+"];
const FUND_STATUS = ["Not raising", "Raising now", "Open to intros", "Planning to raise in 6 months"];
const HELP = [
  "Customer introductions",
  "Fundraising advice",
  "GTM mentoring",
  "Technical advice",
  "Hiring",
  "Partnerships",
  "International expansion",
  "Investor introductions",
];

export default function DashboardClient({ token }: { token: string }) {
  const router = useRouter();
  const data = useQuery(api.founderAuth.me, { token });

  async function signOut() {
    await fetch("/api/founder/session", { method: "DELETE" });
    router.replace("/founder/login");
  }

  if (data === undefined)
    return (
      <Container className="py-20">
        <div className="h-8 w-64 animate-pulse rounded bg-paper-2" />
      </Container>
    );
  if (data === null)
    return (
      <Container className="py-24">
        <Card className="mx-auto max-w-sm p-8 text-center">
          <h1 className="font-display text-3xl">Session expired</h1>
          <Button href="/founder/login" className="mt-5">
            Sign in again
          </Button>
        </Card>
      </Container>
    );

  return (
    <Container className="py-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Eyebrow>Founder dashboard</Eyebrow>
          <h1 className="font-display mt-3 text-[clamp(30px,4vw,48px)]">
            {data.name ? `Hi, ${data.name}.` : "Your startups"}
          </h1>
          <p className="mt-1 font-mono-x text-[13px] text-faint">{data.email}</p>
        </div>
        <button
          onClick={signOut}
          className="rounded-full border border-hair-2 px-4 py-2 text-[13px] font-medium hover:border-ink"
        >
          Sign out
        </button>
      </div>

      {data.startups.length === 0 && (
        <Card className="mt-8 p-7">
          <p className="text-[15px] text-muted">
            No startup is linked to <b>{data.email}</b> yet. If you registered with a different
            email, sign in with that one — or{" "}
            <Link href="/register" className="text-ember">
              register your startup
            </Link>
            .
          </p>
        </Card>
      )}

      <div className="mt-8 grid gap-8">
        {data.startups.map((s: any) => (
          <StartupPanel key={s.slug} token={token} email={data.email} event={data.event} s={s} />
        ))}
        {data.startups.some((s: any) => s.status === "approved") && (
          <OutreachPanel
            token={token}
            startups={data.startups.filter((s: any) => s.status === "approved")}
          />
        )}
      </div>
    </Container>
  );
}

const PACK_LABELS: Record<string, string> = {
  starter: "5 intros",
  growth: "20 intros",
  scale: "50 intros",
};

function OutreachPanel({ token, startups }: { token: string; startups: any[] }) {
  const investors = useQuery(api.investors.listInvestors, {});
  const credits = useQuery(api.outreach.myCredits, { token });
  const threads = useQuery(api.outreach.founderThreads, { token });
  const send = useMutation(api.outreach.sendToInvestor);
  const buy = useAction(api.stripe.createCheckout);

  const [f, setF] = useState({ startupSlug: startups[0]?.slug ?? "", investorId: "", subject: "", body: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [openThread, setOpenThread] = useState<string | null>(null);

  const bal = credits?.balance ?? 0;

  async function doSend() {
    setBusy(true);
    setErr(null);
    try {
      await send({
        token,
        startupSlug: f.startupSlug,
        investorId: f.investorId as never,
        subject: f.subject,
        body: f.body,
      });
      setF({ ...f, investorId: "", subject: "", body: "" });
    } catch (e) {
      const m = (e as Error).message;
      setErr(m === "no_credits" ? "You're out of intro credits — buy a pack below." : m);
    } finally {
      setBusy(false);
    }
  }

  async function doBuy(pack: string) {
    try {
      const { url } = (await buy({ token, pack })) as { url: string };
      window.location.assign(url);
    } catch (e) {
      setErr((e as Error).message);
    }
  }

  return (
    <Card className="p-7">
      <div className="flex items-center justify-between">
        <Eyebrow>Reach out to investors</Eyebrow>
        <span className="font-mono-x text-[13px] text-ink">{bal} intro credit{bal === 1 ? "" : "s"}</span>
      </div>
      <p className="mt-1 text-[13px] text-faint">
        Send your deck + a note to a fund through Founders Drive and get their reply here. 1 credit
        per fund.
      </p>

      <div className="mt-4 grid gap-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="From startup">
            <select className={inputCls} value={f.startupSlug} onChange={(e) => setF({ ...f, startupSlug: e.target.value })}>
              {startups.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="To fund">
            <select className={inputCls} value={f.investorId} onChange={(e) => setF({ ...f, investorId: e.target.value })}>
              <option value="">Select a fund</option>
              {(investors ?? []).map((inv: any) => (
                <option key={inv._id} value={inv._id}>
                  {inv.fundName}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Subject">
          <input className={inputCls} value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} placeholder="Seed round — [your startup]" />
        </Field>
        <Field label="Your note" hint="Your pitch deck link is attached automatically.">
          <textarea className={`${inputCls} min-h-[110px]`} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} />
        </Field>
        {err && <p className="text-[12.5px] text-[#a63244]">{err}</p>}
        <div>
          <Button
            disabled={busy || !f.investorId || !f.subject || f.body.trim().length < 20 || bal < 1}
            onClick={doSend}
          >
            {busy ? "Sending…" : bal < 1 ? "No credits" : "Send (1 credit)"}
          </Button>
        </div>
      </div>

      <div className="mt-6 border-t border-hair pt-4">
        <div className="tagline">Buy intro credits</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {Object.entries(PACK_LABELS).map(([k, label]) => (
            <button
              key={k}
              onClick={() => doBuy(k)}
              className="rounded-full border border-hair-2 px-4 py-2 text-[13px] font-medium hover:border-ink"
            >
              {label}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-[12px] text-faint">Secure checkout via Stripe.</p>
      </div>

      {threads && threads.length > 0 && (
        <div className="mt-6 border-t border-hair pt-4">
          <div className="tagline">Your outreach</div>
          <div className="mt-2 grid gap-2">
            {threads.map((t: any) => (
              <div key={t._id}>
                <button
                  onClick={() => setOpenThread(openThread === t._id ? null : t._id)}
                  className="flex w-full items-center justify-between rounded-lg border border-hair px-4 py-3 text-left transition hover:border-ink"
                >
                  <span className="text-[14px]">
                    <b>{t.investorFund}</b> — {t.subject}
                  </span>
                  <span className="flex items-center gap-2">
                    {t.founderUnread > 0 && (
                      <span className="rounded-full bg-ember px-2 py-0.5 text-[10px] text-[#fff7f0]">
                        {t.founderUnread} new
                      </span>
                    )}
                    <span className="tagline">{t.status}</span>
                  </span>
                </button>
                {openThread === t._id && <FounderThreadView token={token} threadId={t._id} />}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

function FounderThreadView({ token, threadId }: { token: string; threadId: string }) {
  const data = useQuery(api.outreach.thread, { token, threadId: threadId as never });
  const reply = useMutation(api.outreach.reply);
  const markRead = useMutation(api.outreach.markRead);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    markRead({ token, threadId: threadId as never }).catch(() => {});
  }, [markRead, token, threadId]);

  if (!data) return <div className="mt-2 h-20 animate-pulse rounded bg-paper-2" />;

  return (
    <div className="mt-2 rounded-lg border border-hair bg-paper p-4">
      <div className="grid gap-2">
        {data.messages.map((m: any, i: number) => (
          <div key={i} className={`rounded-lg p-3 text-[14px] ${m.from === "founder" ? "bg-[rgba(198,65,10,0.06)]" : "bg-card"}`}>
            <div className="tagline mb-1">{m.from === "founder" ? "You" : data.investorFund}</div>
            <p className="whitespace-pre-wrap">{m.body}</p>
            {m.deckUrl && (
              <a href={m.deckUrl} target="_blank" rel="noreferrer" className="mt-1 inline-block font-mono-x text-[12px] text-ember">
                Pitch deck →
              </a>
            )}
          </div>
        ))}
      </div>
      <textarea className={`${inputCls} mt-3 min-h-[60px]`} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Reply…" />
      <Button
        className="mt-2"
        disabled={busy || body.trim().length < 2}
        onClick={async () => {
          setBusy(true);
          try {
            await reply({ token, threadId: threadId as never, body });
            setBody("");
          } finally {
            setBusy(false);
          }
        }}
      >
        Send reply
      </Button>
    </div>
  );
}

function Saved({ state }: { state: "idle" | "busy" | "ok" | "err"; }) {
  if (state === "busy") return <span className="text-[12px] text-faint">Saving…</span>;
  if (state === "ok") return <span className="text-[12px] text-ember">Saved</span>;
  return null;
}

function StartupPanel({
  token,
  email,
  event,
  s,
}: {
  token: string;
  email: string;
  event: any;
  s: any;
}) {
  const updateStartup = useMutation(api.founderProfile.updateStartup);
  const updateFounder = useMutation(api.founderProfile.updateFounderContact);
  const setLogo = useMutation(api.media.setStartupLogo);
  const setPhoto = useMutation(api.media.setFounderPhoto);
  const setDeck = useMutation(api.media.setStartupDeck);
  const propose = useMutation(api.events.proposeForRoast);

  const [co, setCo] = useState({
    pitch: s.pitch,
    description: s.description,
    website: s.website,
    city: s.city,
    sector: s.sector,
    stage: s.stage,
    teamSize: s.teamSize,
    traction: s.traction,
    fundingRaised: s.fundingRaised,
    fundStatus: s.fundStatus,
    targetAmount: s.targetAmount,
    helpWanted: s.helpWanted as string[],
  });
  const [pm, setPm] = useState({
    tag0: s.tags?.[0] ?? "",
    tag1: s.tags?.[1] ?? "",
    tag2: s.tags?.[2] ?? "",
    founderVideoUrl: s.founderVideoUrl ?? "",
    deckUrl: s.deckIsUpload ? "" : (s.deckUrl ?? ""),
  });
  const [fo, setFo] = useState({
    name: s.founder?.name ?? "",
    role: s.founder?.role ?? "",
    linkedin: s.founder?.linkedin ?? "",
    bio: s.founder?.bio ?? "",
  });
  const [why, setWhy] = useState("");

  const [st, setSt] = useState<Record<string, "idle" | "busy" | "ok" | "err">>({});
  const [msg, setMsg] = useState<Record<string, string>>({});
  const mark = (k: string, v: "idle" | "busy" | "ok" | "err", m = "") => {
    setSt((x) => ({ ...x, [k]: v }));
    setMsg((x) => ({ ...x, [k]: m }));
    if (v === "ok") setTimeout(() => setSt((x) => ({ ...x, [k]: "idle" })), 2500);
  };

  async function run(k: string, fn: () => Promise<unknown>) {
    mark(k, "busy");
    try {
      await fn();
      mark(k, "ok");
    } catch (e) {
      mark(k, "err", (e as Error).message);
    }
  }

  const approved = s.status === "approved";

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-hair bg-paper-2 px-7 py-4">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-[26px]">{s.name}</h2>
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
              approved
                ? "bg-ink text-paper"
                : s.status === "rejected"
                  ? "bg-[rgba(166,50,68,0.12)] text-[#a63244]"
                  : "bg-card text-muted"
            }`}
          >
            {approved ? "Approved · live" : s.status === "rejected" ? "Not approved" : "Pending review"}
          </span>
        </div>
        {approved && (
          <Link href={`/directory/${s.slug}`} className="font-mono-x text-[12px] text-ember">
            View public profile →
          </Link>
        )}
      </div>

      <div className="grid gap-8 p-7">
        {!approved && (
          <p className="rounded-md border border-hair-2 bg-paper-2 px-3 py-2 text-[13px] text-muted">
            You can edit everything now — it goes live in the directory once the team approves the
            profile.
          </p>
        )}

        {/* ---- Company ---- */}
        <section>
          <div className="flex items-center justify-between">
            <div className="tagline">Company</div>
            <Saved state={st.company ?? "idle"} />
          </div>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <Field label="One-liner" full>
              <input className={inputCls} value={co.pitch} onChange={(e) => setCo({ ...co, pitch: e.target.value })} />
            </Field>
            <Field label="Description" full>
              <textarea className={`${inputCls} min-h-[70px]`} value={co.description} onChange={(e) => setCo({ ...co, description: e.target.value })} />
            </Field>
            <Field label="Website">
              <input className={inputCls} value={co.website} onChange={(e) => setCo({ ...co, website: e.target.value })} placeholder="https://" />
            </Field>
            <Field label="HQ city">
              <input className={inputCls} value={co.city} onChange={(e) => setCo({ ...co, city: e.target.value })} />
            </Field>
            <Field label="Sector">
              <select className={inputCls} value={co.sector} onChange={(e) => setCo({ ...co, sector: e.target.value })}>
                {SECTORS.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
            <Field label="Stage">
              <select className={inputCls} value={co.stage} onChange={(e) => setCo({ ...co, stage: e.target.value })}>
                {STAGES.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
            <Field label="Traction" full>
              <textarea className={`${inputCls} min-h-[70px]`} value={co.traction} onChange={(e) => setCo({ ...co, traction: e.target.value })} />
            </Field>
            <Field label="Raised to date">
              <input className={inputCls} value={co.fundingRaised} onChange={(e) => setCo({ ...co, fundingRaised: e.target.value })} />
            </Field>
            <Field label="Fundraising status">
              <select className={inputCls} value={co.fundStatus} onChange={(e) => setCo({ ...co, fundStatus: e.target.value })}>
                {FUND_STATUS.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
            <Field label="Target raise" full>
              <input className={inputCls} value={co.targetAmount} onChange={(e) => setCo({ ...co, targetAmount: e.target.value })} />
            </Field>
            <div className="sm:col-span-2">
              <span className="mb-1.5 block text-[13px] font-medium">Help wanted</span>
              <div className="flex flex-wrap gap-2">
                {HELP.map((h) => {
                  const on = co.helpWanted.includes(h);
                  return (
                    <button
                      key={h}
                      type="button"
                      onClick={() =>
                        setCo({
                          ...co,
                          helpWanted: on ? co.helpWanted.filter((x) => x !== h) : [...co.helpWanted, h],
                        })
                      }
                      className={`rounded-full border px-3 py-1.5 text-[12.5px] ${
                        on ? "border-ember bg-[rgba(198,65,10,0.08)] text-ember" : "border-hair-2 text-muted"
                      }`}
                    >
                      {h}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          {msg.company && st.company === "err" && (
            <p className="mt-2 text-[12.5px] text-[#a63244]">{msg.company}</p>
          )}
          <Button
            className="mt-4"
            disabled={st.company === "busy"}
            onClick={() => run("company", () => updateStartup({ token, slug: s.slug, ...co }))}
          >
            Save company
          </Button>
        </section>

        {/* ---- Logo ---- */}
        <section className="border-t border-hair pt-7">
          <div className="tagline">Company logo</div>
          <div className="mt-3">
            <ImageUpload
              label=""
              name={s.name}
              onChange={(id) =>
                run("logo", () =>
                  setLogo({ slug: s.slug, ownerEmail: email, storageId: (id ?? undefined) as never }),
                )
              }
            />
            {s.logoUrl && <p className="mt-1.5 text-[12px] text-faint">A logo is set. Upload to replace it.</p>}
            <Saved state={st.logo ?? "idle"} />
            {msg.logo && st.logo === "err" && (
              <p className="mt-1 text-[12.5px] text-[#a63244]">{msg.logo}</p>
            )}
          </div>
        </section>

        {/* ---- Pitch materials ---- */}
        <section className="border-t border-hair pt-7">
          <div className="flex items-center justify-between">
            <div className="tagline">Pitch materials</div>
            <Saved state={st.pitchmat ?? "idle"} />
          </div>
          <p className="mt-1 text-[13px] text-faint">
            Used for your profile and for reaching out to investors through Founders Drive.
          </p>
          <div className="mt-3 grid gap-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {(["tag0", "tag1", "tag2"] as const).map((k, i) => (
                <Field key={k} label={i === 0 ? "Business tags (3)" : " "}>
                  <input
                    className={inputCls}
                    value={pm[k]}
                    onChange={(e) => setPm({ ...pm, [k]: e.target.value })}
                    placeholder={["e.g. B2B SaaS", "e.g. Payments", "e.g. SME"][i]}
                  />
                </Field>
              ))}
            </div>
            <Field label="1-minute founder intro video" hint="YouTube / Loom / Vimeo link">
              <input
                className={inputCls}
                value={pm.founderVideoUrl}
                onChange={(e) => setPm({ ...pm, founderVideoUrl: e.target.value })}
                placeholder="https://"
              />
            </Field>
            <Field label="Pitch deck link" hint="DocSend / Drive / Notion — or upload a PDF below">
              <input
                className={inputCls}
                value={pm.deckUrl}
                onChange={(e) => setPm({ ...pm, deckUrl: e.target.value })}
                placeholder="https://"
              />
            </Field>
            <FileUpload
              label="…or upload the deck (PDF, max 15 MB)"
              hasExisting={s.deckIsUpload}
              onChange={(id) =>
                run("deck", () =>
                  setDeck({ slug: s.slug, ownerEmail: email, storageId: (id ?? undefined) as never }),
                )
              }
            />
            <Saved state={st.deck ?? "idle"} />
            {msg.deck && st.deck === "err" && (
              <p className="text-[12.5px] text-[#a63244]">{msg.deck}</p>
            )}
          </div>
          {msg.pitchmat && st.pitchmat === "err" && (
            <p className="mt-2 text-[12.5px] text-[#a63244]">{msg.pitchmat}</p>
          )}
          <Button
            className="mt-4"
            disabled={st.pitchmat === "busy"}
            onClick={() =>
              run("pitchmat", () =>
                updateStartup({
                  token,
                  slug: s.slug,
                  tags: [pm.tag0, pm.tag1, pm.tag2].map((t) => t.trim()).filter(Boolean),
                  founderVideoUrl: pm.founderVideoUrl,
                  deckUrl: pm.deckUrl,
                }),
              )
            }
          >
            Save pitch materials
          </Button>
        </section>

        {/* ---- Founder ---- */}
        <section className="border-t border-hair pt-7">
          <div className="flex items-center justify-between">
            <div className="tagline">Your founder profile</div>
            <Saved state={st.founder ?? "idle"} />
          </div>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <Field label="Name">
              <input className={inputCls} value={fo.name} onChange={(e) => setFo({ ...fo, name: e.target.value })} />
            </Field>
            <Field label="Role">
              <input className={inputCls} value={fo.role} onChange={(e) => setFo({ ...fo, role: e.target.value })} />
            </Field>
            <Field label="LinkedIn" full>
              <input className={inputCls} value={fo.linkedin} onChange={(e) => setFo({ ...fo, linkedin: e.target.value })} placeholder="linkedin.com/in/…" />
            </Field>
            <Field label="Short bio" full>
              <textarea className={`${inputCls} min-h-[70px]`} value={fo.bio} onChange={(e) => setFo({ ...fo, bio: e.target.value })} />
            </Field>
          </div>
          {msg.founder && st.founder === "err" && (
            <p className="mt-2 text-[12.5px] text-[#a63244]">{msg.founder}</p>
          )}
          <Button
            className="mt-4"
            disabled={st.founder === "busy"}
            onClick={() => run("founder", () => updateFounder({ token, slug: s.slug, ...fo }))}
          >
            Save founder profile
          </Button>

          <div className="mt-5">
            <span className="mb-1.5 block text-[13px] font-medium">Profile picture</span>
            <ImageUpload
              label=""
              shape="round"
              name={fo.name}
              onChange={(id) =>
                run("photo", () =>
                  setPhoto({
                    slug: s.slug,
                    ownerEmail: email,
                    founderEmail: email,
                    storageId: (id ?? undefined) as never,
                  }),
                )
              }
            />
            <Saved state={st.photo ?? "idle"} />
            {msg.photo && st.photo === "err" && (
              <p className="mt-1 text-[12.5px] text-[#a63244]">{msg.photo}</p>
            )}
          </div>
        </section>

        {/* ---- Roast Me ---- */}
        <section className="border-t border-hair pt-7">
          <div className="tagline">Roast My Startup{event ? ` · ${event.volume}` : ""}</div>
          {!approved ? (
            <p className="mt-2 text-[14px] text-muted">
              Available once your profile is approved.
            </p>
          ) : !event ? (
            <p className="mt-2 text-[14px] text-muted">No event is open for proposals right now.</p>
          ) : s.roastProposalStatus ? (
            <p className="mt-2 text-[14px] text-muted">
              You&rsquo;ve put <b>{s.name}</b> forward for {event.title} —{" "}
              <b>{s.roastProposalStatus}</b>. The team confirms the four pitching startups ~2 weeks
              before. You can resubmit to update your answer.
            </p>
          ) : null}

          {approved && event && (
            <div className="mt-3">
              <Field label="Why are you ready to open the business to scrutiny?">
                <textarea className={`${inputCls} min-h-[80px]`} value={why} onChange={(e) => setWhy(e.target.value)} />
              </Field>
              {msg.roast && st.roast === "err" && (
                <p className="mt-1 text-[12.5px] text-[#a63244]">{msg.roast}</p>
              )}
              <Button
                className="mt-3"
                disabled={!why.trim() || st.roast === "busy"}
                onClick={() =>
                  run("roast", () =>
                    propose({
                      eventId: event._id,
                      startupSlug: s.slug,
                      ownerEmail: email,
                      whyScrutinyReady: why,
                    }),
                  )
                }
              >
                {s.roastProposalStatus ? "Update proposal" : "Roast Me"}
              </Button>
              <Saved state={st.roast ?? "idle"} />
            </div>
          )}
        </section>

        {approved && (
          <p className="border-t border-hair pt-5 text-[13px] text-faint">
            Press coverage and programme tags are managed on your{" "}
            <Link href={`/directory/${s.slug}`} className="text-ember">
              public profile
            </Link>
            .
          </p>
        )}
      </div>
    </Card>
  );
}
