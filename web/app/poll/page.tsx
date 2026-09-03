"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getVoterSessionId } from "@/lib/session";
import { ScoreBar } from "@/components/viz";

const AXES = [
  ["clarityScore", "Pitch clarity", "Did you understand the problem, the product and the ask?"],
  ["investibilityScore", "Investibility", "Would you put your own money in at this stage?"],
  ["innovationScore", "Innovation", "How new or hard to copy does this feel?"],
] as const;

const TAGS = [
  "Crystal-clear ICP",
  "Pricing too low",
  "High defensibility",
  "Crowded market",
  "Strong founder-market fit",
  "Unclear wedge",
  "Great traction story",
  "Needs a sharper ask",
];

export default function PollPage() {
  const [sessionId, setSessionId] = useState<string>("");
  useEffect(() => setSessionId(getVoterSessionId()), []);

  const poll = useQuery(api.polls.getActivePoll);
  const active = poll?.active ?? null;

  const results = useQuery(
    api.polls.getLiveResults,
    active && sessionId
      ? { pollId: active._id, voterSessionId: sessionId }
      : "skip",
  );

  const submitVote = useMutation(api.polls.submitVote);

  const [picks, setPicks] = useState<Record<string, number | null>>({
    clarityScore: null,
    investibilityScore: null,
    innovationScore: null,
  });
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // reset local ballot when the active pitch changes
  useEffect(() => {
    setPicks({ clarityScore: null, investibilityScore: null, innovationScore: null });
    setTags([]);
    setError(null);
  }, [active?._id]);

  const mine = results?.mine ?? null;
  const submitted = !!mine;
  const room = results?.room;

  const ready = useMemo(
    () => AXES.every(([k]) => picks[k] != null),
    [picks],
  );

  async function cast() {
    if (!ready || !active) return;
    try {
      await submitVote({
        pollId: active._id,
        voterSessionId: sessionId,
        clarityScore: picks.clarityScore!,
        investibilityScore: picks.investibilityScore!,
        innovationScore: picks.innovationScore!,
        tags,
      });
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="relative overflow-hidden bg-ink-2 py-14 text-paper">
      <div
        aria-hidden
        className="fd-float pointer-events-none absolute right-32 top-[-140px] h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle,rgba(198,65,10,0.4),transparent_70%)] blur-[40px]"
      />
      <div
        aria-hidden
        className="fd-float-slow pointer-events-none absolute left-[-120px] bottom-16 h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle,rgba(232,168,124,0.28),transparent_70%)] blur-[40px]"
      />

      <div className="relative z-10 mx-auto w-full max-w-[920px] px-6 sm:px-10">
        <div className="flex items-baseline justify-between">
          <div className="eyebrow" style={{ color: "var(--color-gold)" }}>
            Live audience poll
          </div>
          <div className="tagline flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#5fbf6a] [animation:fd-pulse-ring_2s_ease-out_infinite]" />
            Roast My Startup · Vol. 02
          </div>
        </div>

        {poll === undefined && <Skeleton />}

        {poll && !active && (
          <div className="mt-10 rounded-2xl border border-white/12 bg-white/5 p-10 text-center">
            <h1 className="font-display text-3xl text-paper">No pitch is open for scoring right now.</h1>
            <p className="font-serif-x mt-3 text-[#cfc2b4]">
              The poll opens when the host puts a startup on the clock. Check back when the next
              pitch begins.
            </p>
            <Link href="/roast-my-startup" className="mt-5 inline-block font-mono-x text-sm text-gold">
              See the run of show &rarr;
            </Link>
          </div>
        )}

        {active && (
          <>
            <div className="mt-5 rounded-2xl border border-white/12 bg-white/5 p-7 sm:flex sm:items-start sm:justify-between sm:gap-6">
              <div>
                <div className="tagline text-gold">
                  Now roasting · pitch {active.pitchNumber} of 4
                  {active.sector ? ` · ${active.sector}` : ""}
                </div>
                <h1 className="font-display mt-2.5 text-[clamp(32px,4vw,44px)] text-paper">
                  {active.startupName}
                </h1>
                <p className="font-serif-x mt-1.5 max-w-md text-[17px] text-[#c9bcad]">
                  {active.tagline}
                </p>
              </div>
              <div className="mt-4 flex-none text-right sm:mt-0">
                <div className="font-mono-x text-[34px] leading-none text-paper">
                  {room?.count ?? "—"}
                </div>
                <div className="tagline mt-1">scorecards in</div>
              </div>
            </div>

            <h2 className="font-display mt-9 text-[clamp(24px,3vw,32px)] text-paper">
              Score the pitch. One to ten.
            </h2>
            <p className="font-serif-x mt-2 text-[16px] text-[#c9bcad]">
              You&rsquo;re not on the panel &mdash; that&rsquo;s the point. Vote on how it landed for
              you.
            </p>

            <div className="mt-6 grid gap-4">
              {AXES.map(([key, label, help]) => {
                const roomVal =
                  key === "clarityScore"
                    ? room?.clarity
                    : key === "investibilityScore"
                      ? room?.investibility
                      : room?.innovation;
                const myVal =
                  mine?.[key as keyof typeof mine] ?? (picks[key] as number | null);
                return (
                  <div
                    key={key}
                    className="rounded-2xl border border-white/12 bg-white/[0.045] p-6"
                  >
                    <div className="flex items-baseline justify-between gap-4">
                      <div>
                        <h3 className="font-serif-x text-[21px] text-paper">{label}</h3>
                        <p className="mt-0.5 text-[13.5px] text-faint">{help}</p>
                      </div>
                      {submitted && roomVal != null && (
                        <div className="flex-none text-right">
                          <span className="font-mono-x text-[26px] text-gold">
                            {roomVal.toFixed(1)}
                          </span>
                          <div className="tagline text-[10px]">room average</div>
                        </div>
                      )}
                    </div>

                    {!submitted ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
                          const on = picks[key] === n;
                          return (
                            <button
                              key={n}
                              onClick={() => setPicks((p) => ({ ...p, [key]: n }))}
                              className={`h-12 w-12 rounded-[10px] border font-mono-x text-[15px] transition ${
                                on
                                  ? "border-transparent bg-gradient-to-br from-gold to-ember text-white shadow-[0_10px_22px_-8px_rgba(198,65,10,0.7)] -translate-y-0.5"
                                  : "border-white/20 text-[#cfc2b4] hover:-translate-y-0.5 hover:border-gold hover:text-paper"
                              }`}
                            >
                              {n}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="mt-4">
                        <ScoreBar
                          value={roomVal ?? 0}
                          mine={typeof myVal === "number" ? myVal : null}
                          label="the room vs. you"
                          count={room?.count}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {!submitted && (
              <>
                <div className="mt-5">
                  <div className="tagline mb-2">Quick signal — optional</div>
                  <div className="flex flex-wrap gap-2">
                    {TAGS.map((t) => {
                      const on = tags.includes(t);
                      return (
                        <button
                          key={t}
                          onClick={() =>
                            setTags((ts) =>
                              ts.includes(t) ? ts.filter((x) => x !== t) : [...ts, t],
                            )
                          }
                          className={`rounded-full border px-3.5 py-2 text-[13px] transition ${
                            on
                              ? "border-ember bg-[rgba(198,65,10,0.22)] text-[#ffe1d2]"
                              : "border-white/18 bg-white/[0.03] text-[#d4c7ba] hover:border-gold hover:text-white"
                          }`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-4">
                  <button
                    onClick={cast}
                    disabled={!ready}
                    className={`rounded-full px-8 py-4 text-[15px] font-medium transition ${
                      ready
                        ? "bg-gradient-to-br from-gold to-ember text-white shadow-[0_12px_28px_-10px_rgba(198,65,10,0.7)] hover:-translate-y-0.5"
                        : "cursor-not-allowed border border-white/18 bg-white/5 text-faint"
                    }`}
                  >
                    Submit scorecard
                  </button>
                  <span className="tagline">
                    {ready ? "All three scored — send it in." : "Score all three to submit."}
                  </span>
                </div>
                {error && <p className="mt-3 text-[13px] text-[#ff9d7a]">{error}</p>}
              </>
            )}

            {submitted && room && (
              <div className="mt-6 border-t border-white/12 pt-6 sm:flex sm:items-center sm:justify-between sm:gap-6">
                <div>
                  <div className="tagline text-gold">Room verdict so far</div>
                  <div className="mt-2 flex items-baseline gap-3">
                    <span className="font-display text-[clamp(40px,6vw,56px)] text-paper">
                      {room.composite.toFixed(1)}
                    </span>
                    <span className="font-serif-x text-[20px] text-[#c9bcad]">
                      / 10 ·{" "}
                      {room.composite >= 7.5
                        ? "strong read from the room"
                        : room.composite >= 5.5
                          ? "mixed read"
                          : "tough room"}
                    </span>
                  </div>
                  <p className="font-serif-x mt-1.5 max-w-md text-[15px] text-faint">
                    Goes into {active.startupName}&rsquo;s Reality Check report alongside the
                    panel&rsquo;s findings.
                  </p>
                  {room.topTags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {room.topTags.map((t: any) => (
                        <span
                          key={t.tag}
                          className="rounded-full border border-white/15 px-3 py-1 text-[12px] text-[#d4c7ba]"
                        >
                          {t.tag} · {t.votes}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <p className="tagline mt-4 flex-none sm:mt-0">
                  Your scorecard is in. Results update live as the room votes.
                </p>
              </div>
            )}

            {/* lineup */}
            <div className="mt-10 flex flex-wrap gap-2">
              {poll?.lineup.map((p: any) => (
                <span
                  key={p._id}
                  className={`rounded-full border px-3 py-1.5 text-[12px] ${
                    p.status === "Active"
                      ? "border-ember bg-[rgba(198,65,10,0.2)] text-[#ffe1d2]"
                      : "border-white/12 text-faint"
                  }`}
                >
                  {p.pitchNumber}. {p.startupName}
                  {p.status === "Active" ? " · live" : p.status === "Closed" ? " · done" : ""}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="mt-8 animate-pulse space-y-4">
      <div className="h-28 rounded-2xl bg-white/5" />
      <div className="h-40 rounded-2xl bg-white/5" />
      <div className="h-40 rounded-2xl bg-white/5" />
    </div>
  );
}
