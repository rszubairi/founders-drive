"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Container, Eyebrow, Reveal, Button, Card, Field, inputCls, Glow } from "@/components/ui";

const PILLARS = [
  ["Business", "Is the problem real? Will customers pay? Is pricing viable? Is the model sustainable?"],
  ["Product", "Are the founders solving the right problem? Is the product too complex? Are customers actually using it?"],
  ["Market", "Is the target market realistic? Is the ICP too broad? Is the market ready?"],
  ["Go-to-market", "Is acquisition repeatable? Are sales cycles too long? Is CAC sustainable? Who is the economic buyer?"],
  ["Fundraising", "Is the company genuinely fundable at this stage? Is the ask supported by traction?"],
  ["Execution", "What is slowing the company down? What should the founders stop, start or accelerate?"],
];

const RUN = [
  ["6:30", "Doors, registration and networking.", false],
  ["7:00", "Welcome & how the Reality Check works — audience scorecards open.", false],
  ["7:10", "Startup 1 — 5 min pitch · 10 min Reality Check · 3 min verdict.", true],
  ["7:28", "Startup 2 — pitch, Reality Check, verdict.", true],
  ["7:46", "Break — running poll results on screen.", false],
  ["7:56", "Startup 3 — pitch, Reality Check, verdict.", true],
  ["8:14", "Startup 4 — pitch, Reality Check, verdict.", true],
  ["8:32", "Poll reveal, closing notes, open networking to 9:30.", false],
];

const LEAVE = [
  ["Reality Check report", "An overall score out of 100 — critical issues, important issues, strengths, top three actions, and named people who can help."],
  ["The 30-day Action Plan", "Measurable and time-bound, yours by day 7: customer interviews, pricing validation, ICP revision, a pilot, a sales hire, a new fundraising narrative."],
  ["Help & matching", "Introductions for customer intros, fundraising, GTM, technical advice, hiring, partnerships, international expansion, investor intros."],
  ["Day 90 — Reality Check 2", "A progress score and a published You Said / We Did case study."],
];

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

export default function RoastPage() {
  const event = useQuery(api.events.getUpcomingEvent);
  const pastEvents = useQuery(api.events.getPastEvents);
  const lastEvent = pastEvents?.[0];
  const registerForEvent = useMutation(api.events.registerForEvent);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <Glow className="right-24 top-[-100px] h-[440px] w-[440px] bg-[radial-gradient(circle,rgba(240,177,127,0.5),transparent_70%)]" />
        <div className="fd-grain" />
        <Container className="relative z-10 py-16">
          <Reveal className="flex flex-wrap items-center gap-3">
            <Eyebrow>Flagship event · monthly</Eyebrow>
            <span className="rounded bg-[rgba(198,65,10,0.1)] px-2 py-0.5 font-mono-x text-[11px] tracking-[0.14em] text-ember">
              {event?.volume ?? "Vol. 02"} APPLICATIONS OPEN
            </span>
          </Reveal>
          <Reveal delay={0.1} as="h1" className="font-display mt-4 text-[clamp(56px,11vw,118px)] leading-[0.94]">
            Roast My
            <br />
            Startup
          </Reveal>
          <div className="mt-10 grid items-end gap-12 lg:grid-cols-[1.1fr_1fr]">
            <Reveal delay={0.2} as="p" className="font-serif-x max-w-lg text-[21px] leading-[1.5] text-muted">
              Five minutes to pitch. Ten minutes to get challenged by a rotating panel of VCs,
              operators and founders. Then a documented Reality Check, a 30-day Action Plan, and a
              follow-up at day 90 to see if you did it.
            </Reveal>
            <Reveal delay={0.2}>
              <Card className="p-7">
                <div className="tagline text-ember">
                  {event?.title ?? "Roast My Startup — Vol. 02"} · applications open
                </div>
                <table className="mt-3 w-full font-mono-x text-[13.5px] leading-[2.2]">
                  <tbody>
                    <Row k="DATE" v={event?.date ?? "Thu 26 Jun 2026"} />
                    <Row k="DOORS" v={event?.doorsTime ?? "6:30 PM"} />
                    <Row k="VENUE" v={event?.venue ?? "Common Ground, KL Eco City"} />
                    <Row
                      k="SEATS LEFT"
                      v={event ? `${event.seatsLeft} of ${event.totalSeats}` : "—"}
                    />
                  </tbody>
                </table>
                <Button href="#roast-me" className="mt-4 w-full">
                  Roast Me
                </Button>
              </Card>
            </Reveal>
          </div>

          {/* Bespoke photography asset */}
          <Reveal delay={0.2} className="mt-12 overflow-hidden rounded-2xl border border-hair shadow-2xl">
            <div className="relative flex h-[340px] items-end bg-ink-2 sm:h-[480px]">
              <Image
                src="/assets/roast_stage.jpg"
                alt="A founder pitching on stage at Roast My Startup, Kuala Lumpur skyline behind"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 1080px"
                className="object-cover"
              />
              <div className="relative z-10 flex w-full items-end justify-between bg-gradient-to-t from-black/90 via-black/40 to-transparent p-8 text-paper">
                <div>
                  <div className="tagline text-gold">Live Pitch Floor · Common Ground KL Eco City</div>
                  <div className="font-display mt-1 text-[clamp(20px,3vw,30px)] text-white">
                    No soft questions. Just a high-conviction reality check.
                  </div>
                </div>
                <span className="tagline text-[#cfc2b4]">Kuala Lumpur</span>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* 6 PILLARS */}
      <section className="bg-paper-2">
        <Container className="py-20">
          <Eyebrow>The 6-pillar Reality Check framework</Eyebrow>
          <h2 className="font-display mt-5 max-w-3xl text-[clamp(28px,4vw,46px)]">
            Roasters move past generic criticism to pinpoint where the company is slow, weak or
            misaligned.
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {PILLARS.map(([h, p], i) => (
              <Card key={h} className="fd-lift h-full p-6">
                <div className="font-mono-x text-xs text-ember">{String(i + 1).padStart(2, "0")}</div>
                <h3 className="font-serif-x mt-3 text-[22px]">{h}</h3>
                <p className="mt-2 text-[14.5px] text-muted">{p}</p>
              </Card>
            ))}
          </div>
          <div className="mt-8 rounded-2xl border border-hair bg-card p-6">
            <div className="tagline">From criticism to action · WHY → WHAT → HOW → WHO</div>
            <p className="mt-2 max-w-3xl text-[15px] text-muted">
              <b>Why:</b> the market is too broad and the sales cycle is 9–12 months. <b>What:</b>{" "}
              narrow the ICP. <b>How:</b> run a 90-day pilot with 20 target customers.{" "}
              <b className="text-ember">Who:</b> two operators, one potential customer and one
              relevant mentor — introduced by Founders Drive.
            </p>
          </div>
        </Container>
      </section>

      {/* RUN OF SHOW */}
      <Container className="py-20" id="run">
        <Eyebrow>Run of show</Eyebrow>
        <h2 className="font-display mt-5 text-[clamp(28px,4vw,46px)]">
          One evening. About 75 minutes of core programming.
        </h2>
        <div className="mt-10 border-t border-ink">
          {RUN.map(([t, d, hot]) => (
            <div
              key={t as string}
              className="grid grid-cols-[80px_1fr] gap-7 border-b border-hair py-5 sm:grid-cols-[120px_1fr]"
            >
              <div className={`font-mono-x text-[13px] ${hot ? "text-ember" : "text-muted"}`}>{t}</div>
              <div className="text-[15px] sm:text-[16px]">{d}</div>
            </div>
          ))}
        </div>
      </Container>

      {/* WHAT YOU LEAVE WITH */}
      <section className="bg-paper-2" id="journey">
        <Container className="py-20">
          <Eyebrow>What every selected founder leaves with</Eyebrow>
          <h2 className="font-display mt-5 text-[clamp(28px,4vw,46px)]">
            The feedback doesn&rsquo;t end when the mic goes off.
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {LEAVE.map(([h, p]) => (
              <Card key={h} className="p-7">
                <div className="font-mono-x text-xs text-ember">{h.toUpperCase()}</div>
                <p className="mt-3 text-[15px] text-muted">{p}</p>
              </Card>
            ))}
          </div>

          <div className="mt-12 grid items-center gap-10 overflow-hidden rounded-2xl border border-hair bg-card p-8 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <div className="tagline text-ember">Follow-Through &amp; Accountability</div>
              <h3 className="font-display mt-2 text-[32px]">From Stage Scrutiny to Real Execution</h3>
              <p className="font-serif-x mt-3 text-[17px] text-muted">
                The real signature of Founders Drive is what happens after the pitch. Your 30-day action plan is synced directly with Convex DB, matching you with operators, mentors, and debt/equity partners.
              </p>
              <div className="mt-6 flex gap-4">
                <Button href="#roast-me">Roast Me · Vol. 02</Button>
                <Button href="/directory" variant="ghost">Browse Roasted Alumni</Button>
              </div>
            </div>
            <div className="relative h-[280px] overflow-hidden rounded-xl border border-hair shadow-xl">
              <Image
                src="/assets/reality_check.jpg"
                alt="A founder in a Reality Check advisory session at Common Ground, Kuala Lumpur"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
          </div>
        </Container>
      </section>

      {/* PAST EVENTS — hidden until the first volume is marked Completed */}
      {pastEvents && pastEvents.length > 0 && (
        <section className="bg-paper-2" id="past-events">
          <Container className="py-20">
            <Eyebrow>Past events</Eyebrow>
            <h2 className="font-display mt-5 text-[clamp(28px,4vw,46px)]">
              Every volume, on the record.
            </h2>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {pastEvents.map((ev: any) => (
                <Card key={ev._id} className="p-6">
                  <div className="tagline text-ember">{ev.volume}</div>
                  <h3 className="font-display mt-1 text-[22px]">{ev.title}</h3>
                  <div className="mt-2 text-[13.5px] text-muted">
                    {ev.date} · {ev.venue}
                  </div>
                  <div className="mt-2 text-[13px] text-faint">
                    {ev.registeredCount} of {ev.totalSeats} seats filled · {ev.pitching.length} startups pitched
                  </div>
                </Card>
              ))}
            </div>

            {lastEvent && (
              <div className="mt-14">
                <div className="tagline">Who pitched at {lastEvent.volume}</div>
                <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                  {lastEvent.pitching.map((s: any) => (
                    <Card key={s.slug} className="fd-lift p-5">
                      <h4 className="font-serif-x text-[19px]">{s.name}</h4>
                      <div className="mt-1 text-[12px] text-faint">
                        {s.sector} · {s.stage}
                      </div>
                      <p className="mt-2.5 text-[13.5px] text-muted">{s.pitch}</p>
                      <Link
                        href={`/directory/${s.slug}`}
                        className="mt-3 inline-block font-mono-x text-[12.5px] text-ember"
                      >
                        View profile &rarr;
                      </Link>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </Container>
        </section>
      )}

      {/* WHO SHOULD APPLY + APPLY FORM */}
      <section className="relative overflow-hidden bg-ink-2 text-paper" id="apply">
        <Glow slow className="right-[10%] top-[-80px] h-[420px] w-[420px] bg-[radial-gradient(circle,rgba(232,168,124,0.26),transparent_70%)]" />
        <Container className="relative z-10 grid gap-14 py-20 lg:grid-cols-2">
          <div>
            <div className="eyebrow" style={{ color: "var(--color-gold)" }}>
              Who should apply
            </div>
            <h2 className="font-display mt-4 text-[clamp(30px,5vw,46px)] text-paper">
              Malaysian startups willing to be wrong in public.
            </h2>
            <ul className="mt-6 grid gap-3 text-[16px] text-[#c9bcad]">
              {[
                "Registered or operating in Malaysia, any sector.",
                "Idea stage through Series A — enough built to be challenged on something real.",
                "A founder on stage who can take direct feedback without flinching.",
                "Ready to commit to the 30 / 60 / 90-day follow-up, on the record.",
              ].map((t, i) => (
                <li key={i} className="flex gap-3">
                  <span className="font-mono-x text-gold">{String(i + 1).padStart(2, "0")}</span>
                  {t}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[14px] text-faint">
              Not pitching?{" "}
              <RsvpInline event={event} register={registerForEvent} />
            </p>
            <p className="mt-3 text-[13px] text-faint">
              Your startup isn&rsquo;t registered yet?{" "}
              <Link href="/register" className="text-gold underline">
                Register it first
              </Link>{" "}
              — once it&rsquo;s approved you can Roast Me here.
            </p>
          </div>

          <RoastMeForm event={event} />
        </Container>
      </section>

      {/* SCORECARD CTA */}
      <Container className="py-20">
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_0.85fr]">
          <div>
            <Eyebrow>The audience scorecard</Eyebrow>
            <h2 className="font-display mt-4 text-[clamp(26px,4vw,42px)]">The room votes too.</h2>
            <p className="mt-4 max-w-md text-[16px] text-muted">
              Every listener scores each pitch on clarity, investibility and innovation, one to ten.
              It&rsquo;s a fast read on how the pitch lands with people who aren&rsquo;t on the panel
              &mdash; and it goes into the founder&rsquo;s report.
            </p>
            <Link href="/poll" className="mt-5 inline-block font-mono-x text-sm text-ember">
              See the live poll &rarr;
            </Link>
          </div>
          <Card className="p-7">
            <div className="tagline">Scored live, per pitch</div>
            <div className="mt-4 grid gap-3 font-serif-x text-[19px]">
              {["Pitch clarity", "Investibility", "Innovation"].map((l, i) => (
                <div
                  key={l}
                  className={`flex justify-between ${i < 2 ? "border-b border-hair pb-2.5" : ""}`}
                >
                  {l} <span className="font-mono-x text-[15px] text-muted">1–10</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Container>
    </>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <tr>
      <td className="text-faint">{k}</td>
      <td className="text-right">{v}</td>
    </tr>
  );
}

function RsvpInline({ event, register }: { event: any; register: any }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ fullName: "", email: "", roleType: "Audience" });
  const [done, setDone] = useState(false);
  if (done) return <span className="text-gold">RSVP received — see you there.</span>;
  if (!open)
    return (
      <button onClick={() => setOpen(true)} className="text-gold underline">
        RSVP as audience
      </button>
    );
  return (
    <span className="mt-2 flex flex-wrap items-center gap-2">
      <input
        placeholder="Name"
        value={f.fullName}
        onChange={(e) => setF({ ...f, fullName: e.target.value })}
        className="rounded border border-white/20 bg-white/5 px-2 py-1 text-[13px] text-paper"
      />
      <input
        placeholder="Email"
        value={f.email}
        onChange={(e) => setF({ ...f, email: e.target.value })}
        className="rounded border border-white/20 bg-white/5 px-2 py-1 text-[13px] text-paper"
      />
      <button
        onClick={async () => {
          if (!event || !f.fullName || !f.email) return;
          await register({ eventId: event._id, ...f });
          setDone(true);
        }}
        className="rounded bg-ember px-3 py-1 text-[13px] text-white"
      >
        Send
      </button>
    </span>
  );
}

function RoastMeForm({ event }: { event: any }) {
  const propose = useMutation(api.events.proposeForRoast);
  const [email, setEmail] = useState("");
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const mine = useQuery(
    api.startups.myStartupsForEmail,
    emailOk ? { email: email.trim() } : "skip",
  );
  const approved = (mine ?? []).filter((s: any) => s.status === "approved");

  const [f, setF] = useState({
    startupSlug: "",
    whyScrutinyReady: "",
    pitchDeckUrl: "",
    videoUrl: "",
    helpWanted: [] as string[],
  });
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const ready = emailOk && f.startupSlug && f.whyScrutinyReady.trim();

  async function submit() {
    if (!event) return;
    setBusy(true);
    setErr(null);
    try {
      await propose({
        eventId: event._id,
        startupSlug: f.startupSlug,
        ownerEmail: email.trim(),
        whyScrutinyReady: f.whyScrutinyReady,
        pitchDeckUrl: f.pitchDeckUrl || undefined,
        videoUrl: f.videoUrl || undefined,
        helpWanted: f.helpWanted.length ? f.helpWanted : undefined,
      });
      setDone(true);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="p-7" id="roast-me">
      {done ? (
        <div className="py-6 text-center">
          <h3 className="font-display text-3xl">You&rsquo;re in the running.</h3>
          <p className="font-serif-x mt-2 text-muted">
            The team reviews every proposal and confirms the four pitching startups about two weeks
            before {event?.title ?? "the event"}. You can update this any time before then.
          </p>
        </div>
      ) : (
        <>
          <div className="tagline text-ember">Roast Me · {event?.volume ?? "Vol. 02"}</div>
          <p className="mt-2 text-[14px] text-muted">
            Put an <b>approved</b> startup profile forward for this event. We pull your pitch,
            sector and stage from the profile.
          </p>
          <div className="mt-4 grid gap-4">
            <Field label="Email on your startup profile" hint="The founder or claimed email.">
              <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@yourcompany.my" />
            </Field>

            {emailOk && mine !== undefined && approved.length === 0 && (
              <p className="rounded-md border border-hair-2 bg-paper-2 px-3 py-2 text-[13px] text-muted">
                No approved startup found for that email.{" "}
                <Link href="/register" className="text-ember">
                  Register
                </Link>{" "}
                or{" "}
                <Link href="/directory" className="text-ember">
                  claim your profile
                </Link>
                , then wait for the approval email.
              </p>
            )}

            {approved.length > 0 && (
              <Field label="Which startup?">
                <select
                  className={inputCls}
                  value={f.startupSlug}
                  onChange={(e) => setF({ ...f, startupSlug: e.target.value })}
                >
                  <option value="">Select your startup</option>
                  {approved.map((s: any) => (
                    <option key={s.slug} value={s.slug}>
                      {s.name} — {s.stage} · {s.sector}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            {f.startupSlug && (
              <>
                <Field label="Why are you ready to open the business to scrutiny?">
                  <textarea className={`${inputCls} min-h-[90px]`} value={f.whyScrutinyReady} onChange={(e) => setF({ ...f, whyScrutinyReady: e.target.value })} />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Pitch deck URL" hint="Optional">
                    <input className={inputCls} value={f.pitchDeckUrl} onChange={(e) => setF({ ...f, pitchDeckUrl: e.target.value })} placeholder="https://" />
                  </Field>
                  <Field label="2-min video URL" hint="Optional">
                    <input className={inputCls} value={f.videoUrl} onChange={(e) => setF({ ...f, videoUrl: e.target.value })} placeholder="https://" />
                  </Field>
                </div>
                <div>
                  <span className="mb-1.5 block text-[13px] font-medium">
                    Help you want <span className="text-faint">— optional</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {HELP.map((h) => {
                      const on = f.helpWanted.includes(h);
                      return (
                        <button
                          key={h}
                          type="button"
                          onClick={() =>
                            setF({
                              ...f,
                              helpWanted: on
                                ? f.helpWanted.filter((x) => x !== h)
                                : [...f.helpWanted, h],
                            })
                          }
                          className={`rounded-full border px-3 py-1.5 text-[12.5px] ${
                            on
                              ? "border-ember bg-[rgba(198,65,10,0.08)] text-ember"
                              : "border-hair-2 text-muted"
                          }`}
                        >
                          {h}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {err && <p className="text-[12.5px] text-[#a63244]">{err}</p>}
            <Button disabled={!ready || busy} onClick={submit}>
              {busy ? "Submitting…" : "Roast Me"}
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
