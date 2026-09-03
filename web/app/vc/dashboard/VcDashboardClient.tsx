"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Container, Eyebrow, Card, Button, Field, inputCls } from "@/components/ui";
import { ImageUpload } from "@/components/media";

const csv = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

export default function VcDashboardClient({ token }: { token: string }) {
  const router = useRouter();
  const me = useQuery(api.investorAuth.me, { token });
  const threads = useQuery(api.outreach.investorThreads, { token });
  const posts = useQuery(api.news.myPosts, { token });

  async function signOut() {
    await fetch("/api/vc/session", { method: "DELETE" });
    router.replace("/vc/login");
  }

  if (me === undefined)
    return (
      <Container className="py-20">
        <div className="h-8 w-64 animate-pulse rounded bg-paper-2" />
      </Container>
    );
  if (me === null)
    return (
      <Container className="py-24">
        <Card className="mx-auto max-w-sm p-8 text-center">
          <h1 className="font-display text-3xl">Session expired</h1>
          <Button href="/vc/login" className="mt-5">
            Sign in again
          </Button>
        </Card>
      </Container>
    );

  return (
    <Container className="py-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Eyebrow>Investor dashboard</Eyebrow>
          <h1 className="font-display mt-3 text-[clamp(30px,4vw,48px)]">
            {me.name ? `Hi, ${me.name}.` : "Your fund"}
          </h1>
          <p className="mt-1 font-mono-x text-[13px] text-faint">{me.email}</p>
        </div>
        <button onClick={signOut} className="rounded-full border border-hair-2 px-4 py-2 text-[13px] font-medium hover:border-ink">
          Sign out
        </button>
      </div>

      {me.funds.length === 0 && (
        <Card className="mt-8 p-7">
          <p className="text-[15px] text-muted">
            No fund is linked to <b>{me.email}</b>.{" "}
            <Link href="/capital-connect/apply" className="text-ember">
              Apply to Capital Connect
            </Link>{" "}
            with this email.
          </p>
        </Card>
      )}

      <div className="mt-8 grid gap-8">
        {me.funds.map((fund: any) => (
          <FundPanel key={fund._id} token={token} fund={fund} />
        ))}

        {me.funds.length > 0 && (
          <>
            <PublishPanel token={token} posts={posts} />
            <InboxPanel token={token} threads={threads ?? []} />
          </>
        )}
      </div>
    </Container>
  );
}

function Msg({ state, err }: { state: string; err?: string }) {
  if (state === "busy") return <span className="text-[12px] text-faint">Saving…</span>;
  if (state === "ok") return <span className="text-[12px] text-ember">Saved</span>;
  if (state === "err") return <span className="text-[12px] text-[#a63244]">{err}</span>;
  return null;
}

function FundPanel({ token, fund }: { token: string; fund: any }) {
  const update = useMutation(api.investorProfile.updateFund);
  const setLogo = useMutation(api.investorProfile.setFundLogoAuthed);
  const [f, setF] = useState({
    thesis: fund.thesis,
    website: fund.website,
    role: fund.role,
    stagePreferences: (fund.stagePreferences ?? []).join(", "),
    sectors: (fund.sectors ?? []).join(", "),
    geography: (fund.geography ?? []).join(", "),
    ticketMin: fund.ticketMin ? String(fund.ticketMin) : "",
    ticketMax: fund.ticketMax ? String(fund.ticketMax) : "",
    leadPreference: fund.leadPreference,
    portfolioHighlights: (fund.portfolioHighlights ?? []).join(", "),
  });
  const [st, setSt] = useState("idle");
  const [logoSt, setLogoSt] = useState("idle");
  const [err, setErr] = useState("");

  async function save() {
    setSt("busy");
    setErr("");
    try {
      await update({
        token,
        investorId: fund._id,
        thesis: f.thesis,
        website: f.website,
        role: f.role,
        stagePreferences: csv(f.stagePreferences),
        sectors: csv(f.sectors),
        geography: csv(f.geography),
        ticketMin: f.ticketMin ? Number(f.ticketMin) : undefined,
        ticketMax: f.ticketMax ? Number(f.ticketMax) : undefined,
        leadPreference: f.leadPreference,
        portfolioHighlights: csv(f.portfolioHighlights),
      });
      setSt("ok");
      setTimeout(() => setSt("idle"), 2000);
    } catch (e) {
      setSt("err");
      setErr((e as Error).message);
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-hair bg-paper-2 px-7 py-4">
        <h2 className="font-display text-[26px]">{fund.fundName}</h2>
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
            fund.status === "approved" ? "bg-ink text-paper" : "bg-card text-muted"
          }`}
        >
          {fund.status === "approved" ? "Verified · live" : "Pending review"}
        </span>
      </div>
      <div className="grid gap-4 p-7">
        <Field label="Investment thesis" full>
          <textarea className={`${inputCls} min-h-[70px]`} value={f.thesis} onChange={(e) => setF({ ...f, thesis: e.target.value })} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Website">
            <input className={inputCls} value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} />
          </Field>
          <Field label="Your role">
            <input className={inputCls} value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })} placeholder="Partner" />
          </Field>
          <Field label="Stage preferences" hint="Comma-separated">
            <input className={inputCls} value={f.stagePreferences} onChange={(e) => setF({ ...f, stagePreferences: e.target.value })} placeholder="Pre-Seed, Seed" />
          </Field>
          <Field label="Sectors" hint="Comma-separated">
            <input className={inputCls} value={f.sectors} onChange={(e) => setF({ ...f, sectors: e.target.value })} />
          </Field>
          <Field label="Geography" hint="Comma-separated">
            <input className={inputCls} value={f.geography} onChange={(e) => setF({ ...f, geography: e.target.value })} placeholder="Malaysia, SEA" />
          </Field>
          <Field label="Lead preference">
            <input className={inputCls} value={f.leadPreference} onChange={(e) => setF({ ...f, leadPreference: e.target.value })} placeholder="Lead / Co-invest / Either" />
          </Field>
          <Field label="Ticket min (RM)">
            <input className={inputCls} inputMode="numeric" value={f.ticketMin} onChange={(e) => setF({ ...f, ticketMin: e.target.value.replace(/[^0-9]/g, "") })} />
          </Field>
          <Field label="Ticket max (RM)">
            <input className={inputCls} inputMode="numeric" value={f.ticketMax} onChange={(e) => setF({ ...f, ticketMax: e.target.value.replace(/[^0-9]/g, "") })} />
          </Field>
          <Field label="Portfolio highlights" hint="Comma-separated" full>
            <input className={inputCls} value={f.portfolioHighlights} onChange={(e) => setF({ ...f, portfolioHighlights: e.target.value })} />
          </Field>
        </div>
        <div className="flex items-center gap-3">
          <Button disabled={st === "busy"} onClick={save}>
            Save fund profile
          </Button>
          <Msg state={st} err={err} />
        </div>

        <div className="border-t border-hair pt-5">
          <span className="mb-1.5 block text-[13px] font-medium">Fund logo</span>
          <ImageUpload
            label=""
            name={fund.fundName}
            onChange={async (id) => {
              setLogoSt("busy");
              try {
                await setLogo({ token, investorId: fund._id, storageId: (id ?? undefined) as never });
                setLogoSt("ok");
                setTimeout(() => setLogoSt("idle"), 2000);
              } catch {
                setLogoSt("err");
              }
            }}
          />
          <Msg state={logoSt} />
        </div>
      </div>
    </Card>
  );
}

function PublishPanel({ token, posts }: { token: string; posts: any }) {
  const postNews = useMutation(api.news.postNews);
  const postEvent = useMutation(api.news.postEvent);
  const del = useMutation(api.news.deleteMyPost);
  const [tab, setTab] = useState<"news" | "event">("news");
  const [n, setN] = useState({ title: "", url: "", source: "", summary: "" });
  const [ev, setEv] = useState({ title: "", date: "", location: "", url: "", description: "", isSponsored: false });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit() {
    setBusy(true);
    setErr("");
    try {
      if (tab === "news") {
        await postNews({ token, title: n.title, url: n.url || undefined, source: n.source || undefined, summary: n.summary || undefined });
        setN({ title: "", url: "", source: "", summary: "" });
      } else {
        await postEvent({
          token,
          title: ev.title,
          date: ev.date,
          location: ev.location || undefined,
          url: ev.url || undefined,
          description: ev.description || undefined,
          isSponsored: ev.isSponsored,
        });
        setEv({ title: "", date: "", location: "", url: "", description: "", isSponsored: false });
      }
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="p-7">
      <Eyebrow>Post to the ecosystem</Eyebrow>
      <p className="mt-1 text-[13px] text-faint">Appears on the public /news page under your fund&rsquo;s name.</p>
      <div className="mt-4 flex gap-1 rounded-full border border-hair-2 p-1 text-[13px] max-w-[280px]">
        {(["news", "event"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-full px-3 py-1.5 font-medium ${tab === t ? "bg-ember text-[#fff7f0]" : "text-muted"}`}
          >
            {t === "news" ? "News" : "Event"}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3">
        {tab === "news" ? (
          <>
            <Field label="Headline">
              <input className={inputCls} value={n.title} onChange={(e) => setN({ ...n, title: e.target.value })} />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Link" hint="Optional">
                <input className={inputCls} value={n.url} onChange={(e) => setN({ ...n, url: e.target.value })} placeholder="https://" />
              </Field>
              <Field label="Source" hint="Optional">
                <input className={inputCls} value={n.source} onChange={(e) => setN({ ...n, source: e.target.value })} />
              </Field>
            </div>
            <Field label="Summary" hint="Optional">
              <textarea className={`${inputCls} min-h-[70px]`} value={n.summary} onChange={(e) => setN({ ...n, summary: e.target.value })} />
            </Field>
          </>
        ) : (
          <>
            <Field label="Event title">
              <input className={inputCls} value={ev.title} onChange={(e) => setEv({ ...ev, title: e.target.value })} />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Date">
                <input className={inputCls} value={ev.date} onChange={(e) => setEv({ ...ev, date: e.target.value })} placeholder="14 Mar 2026" />
              </Field>
              <Field label="Location" hint="Optional">
                <input className={inputCls} value={ev.location} onChange={(e) => setEv({ ...ev, location: e.target.value })} />
              </Field>
            </div>
            <Field label="Registration link" hint="Optional">
              <input className={inputCls} value={ev.url} onChange={(e) => setEv({ ...ev, url: e.target.value })} placeholder="https://" />
            </Field>
            <Field label="Description" hint="Optional">
              <textarea className={`${inputCls} min-h-[70px]`} value={ev.description} onChange={(e) => setEv({ ...ev, description: e.target.value })} />
            </Field>
            <label className="flex items-center gap-2 text-[13px]">
              <input type="checkbox" checked={ev.isSponsored} onChange={(e) => setEv({ ...ev, isSponsored: e.target.checked })} />
              This is a sponsored event
            </label>
          </>
        )}
        {err && <p className="text-[12.5px] text-[#a63244]">{err}</p>}
        <Button disabled={busy} onClick={submit}>
          {busy ? "Posting…" : "Publish"}
        </Button>
      </div>

      {posts && (posts.news.length > 0 || posts.events.length > 0) && (
        <div className="mt-6 border-t border-hair pt-4">
          <div className="tagline">Your posts</div>
          <div className="mt-2 grid gap-2">
            {[
              ...posts.news.map((p: any) => ({ ...p, kind: "news" })),
              ...posts.events.map((p: any) => ({ ...p, kind: "event" })),
            ].map((p: any) => (
              <div key={p._id} className="flex items-center justify-between rounded-lg border border-hair px-3 py-2 text-[13px]">
                <span>
                  <span className="font-mono-x text-faint">{p.kind}</span> · {p.title}
                </span>
                <button
                  onClick={() => del({ token, kind: p.kind, id: p._id })}
                  className="text-faint hover:text-[#a63244]"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

function InboxPanel({ token, threads }: { token: string; threads: any[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <Card className="p-7">
      <Eyebrow>Founder outreach</Eyebrow>
      {threads.length === 0 ? (
        <p className="mt-2 text-[14px] text-muted">No outreach yet.</p>
      ) : (
        <div className="mt-3 grid gap-2">
          {threads.map((t) => (
            <div key={t._id}>
              <button
                onClick={() => setOpenId(openId === t._id ? null : t._id)}
                className="flex w-full items-center justify-between rounded-lg border border-hair px-4 py-3 text-left transition hover:border-ink"
              >
                <span>
                  <span className="font-serif-x text-[15px]">{t.startupName}</span>
                  <span className="text-[13px] text-muted"> — {t.subject}</span>
                </span>
                <span className="flex items-center gap-2">
                  {t.investorUnread > 0 && (
                    <span className="rounded-full bg-ember px-2 py-0.5 text-[10px] text-[#fff7f0]">
                      {t.investorUnread} new
                    </span>
                  )}
                  <span className="tagline">{t.status}</span>
                </span>
              </button>
              {openId === t._id && <ThreadView token={token} threadId={t._id} />}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function ThreadView({ token, threadId }: { token: string; threadId: string }) {
  const data = useQuery(api.outreach.thread, { token, threadId: threadId as never });
  const reply = useMutation(api.outreach.reply);
  const setStatus = useMutation(api.outreach.investorSetStatus);
  const markRead = useMutation(api.outreach.markRead);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    markRead({ token, threadId: threadId as never }).catch(() => {});
  }, [markRead, token, threadId]);

  if (data === undefined) return <div className="mt-2 h-24 animate-pulse rounded bg-paper-2" />;
  if (data === null) return null;

  return (
    <div className="mt-2 rounded-lg border border-hair bg-paper p-4">
      <div className="grid gap-2">
        {data.messages.map((m: any, i: number) => (
          <div
            key={i}
            className={`rounded-lg p-3 text-[14px] ${
              m.from === "founder" ? "bg-card" : "bg-[rgba(198,65,10,0.06)]"
            }`}
          >
            <div className="tagline mb-1">{m.from === "founder" ? data.startupName : "You"}</div>
            <p className="whitespace-pre-wrap">{m.body}</p>
            {m.deckUrl && (
              <a href={m.deckUrl} target="_blank" rel="noreferrer" className="mt-1 inline-block font-mono-x text-[12px] text-ember">
                Pitch deck →
              </a>
            )}
          </div>
        ))}
      </div>
      <textarea
        className={`${inputCls} mt-3 min-h-[70px]`}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Reply…"
      />
      <div className="mt-2 flex flex-wrap gap-2">
        <Button
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
        <Button variant="ghost" onClick={() => setStatus({ token, threadId: threadId as never, status: "interested" })}>
          Mark interested
        </Button>
        <Button variant="ghost" onClick={() => setStatus({ token, threadId: threadId as never, status: "declined" })}>
          Pass
        </Button>
      </div>
    </div>
  );
}
