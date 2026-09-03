import Link from "next/link";
import Image from "next/image";
import { Container, Eyebrow, Reveal, Button, Card, Glow, Marquee } from "@/components/ui";
import { ScoreGauge } from "@/components/viz";

const FRAMEWORK = [
  ["Business", "Is the problem real? Will customers pay? Is pricing viable? Is the model sustainable?"],
  ["Product", "Right problem? Too complex? Are customers actually using it?"],
  ["Market", "Is the target market realistic? Is the ICP too broad? Is the market ready?"],
  ["Go-to-market", "Is acquisition repeatable? Sales cycles too long? Is CAC sustainable? Who's the economic buyer?"],
  ["Fundraising", "Genuinely fundable at this stage? Is the ask supported by traction?"],
  ["Execution", "What's slowing the company down? What to stop, start or accelerate?"],
];

const JOURNEY = [
  ["Event day", "Pitch, Reality Check and verdict — live, in front of the room."],
  ["Day 7", "Final Action Plan — measurable, time-bound, agreed with the founder."],
  ["Day 30", "Progress update against every issue raised."],
  ["Day 60", "Results and experiments update — what worked, what didn't."],
  ["Day 90", "Reality Check 2, a progress score, and a published case study."],
];

const ECOSYSTEM = [
  ["01", "Roast My Startup", "Reality check", "/roast-my-startup"],
  ["02", "Startup Directory", "Discovery", "/directory"],
  ["03", "Capital Connect", "Funding & VC matching", "/capital-connect"],
  ["04", "Founder Perks", "Resources", "/perks"],
  ["05", "Opportunities", "Competitions & programmes", "/perks"],
  ["06", "Founders Drive Podcast", "Knowledge", "/"],
  ["07", "Mentor Network", "Expertise", "/capital-connect"],
  ["08", "Founder Follow-up", "Accountability", "/roast-my-startup#journey"],
];

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <Glow className="right-32 top-[-120px] h-[520px] w-[520px] bg-[radial-gradient(circle_at_40%_40%,rgba(240,177,127,0.55),rgba(198,65,10,0.28)_45%,transparent_70%)]" />
        <Glow slow className="left-[-140px] top-44 h-[420px] w-[420px] bg-[radial-gradient(circle,rgba(198,65,10,0.22),transparent_70%)]" />
        <div className="fd-grain" />
        <Container className="relative z-10 grid items-center gap-14 py-20 lg:grid-cols-[1.15fr_1fr] lg:py-28">
          <div>
            <Reveal delay={0.05}>
              <Eyebrow>The Malaysian startup ecosystem</Eyebrow>
            </Reveal>
            <Reveal delay={0.15} as="h1" className="font-display mt-6 text-[clamp(44px,6vw,92px)]">
              Open your startup to{" "}
              <span className="relative inline-block text-ember">
                honest scrutiny
                <svg
                  className="absolute left-0 bottom-[-0.12em] w-full"
                  viewBox="0 0 520 26"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M4 16 C 120 4, 300 4, 516 12"
                    stroke="var(--color-gold)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="520"
                    strokeDashoffset="520"
                    style={{ animation: "fd-draw 1.4s ease 0.5s forwards" }}
                  />
                </svg>
              </span>
              .
            </Reveal>
            <Reveal delay={0.28} as="p" className="font-serif-x mt-8 max-w-lg text-[21px] leading-[1.5] text-muted">
              Four Malaysian startups pitch every month, then take ten minutes of real challenge
              from VCs, operators and founders who&rsquo;ve done it. Not a comedy roast &mdash; a
              reality check with follow-through.
            </Reveal>
            <Reveal delay={0.4} className="mt-9 flex flex-wrap gap-3.5">
              <Button href="/roast-my-startup#apply">Apply to pitch</Button>
              <Button href="/directory" variant="ghost">
                Explore the directory
              </Button>
            </Reveal>
            <Reveal delay={0.52} className="mt-10 flex flex-wrap items-center gap-7">
              <Metric big="4" small="per month" />
              <Divider />
              <Metric big="48/yr" small="reality checks" />
              <Divider />
              <Metric big="Vol.02" small="Jun 2026 · KL" />
            </Reveal>
          </div>

          <Reveal delay={0.3} className="flex justify-center">
            <div className="relative">
              <svg
                width="360"
                height="360"
                viewBox="0 0 360 360"
                fill="none"
                className="max-w-full"
                aria-hidden
              >
                <circle className="fd-scan" cx="180" cy="180" r="130" stroke="var(--color-ember)" strokeWidth="1.5" />
                <circle
                  className="fd-scan"
                  cx="180"
                  cy="180"
                  r="130"
                  stroke="var(--color-ember)"
                  strokeWidth="1.5"
                  style={{ animationDelay: "1.2s" }}
                />
                <g className="fd-spin">
                  <circle cx="180" cy="55" r="5" fill="var(--color-ember)" />
                  <circle cx="180" cy="305" r="3.5" fill="var(--color-gold)" />
                </g>
                <g className="fd-spin-rev">
                  <circle cx="55" cy="180" r="3.5" fill="var(--color-gold)" />
                  <circle cx="305" cy="180" r="4.5" fill="var(--color-ember)" />
                </g>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <ScoreGauge value={72} size={230} label="/ 100" />
              </div>
              <div className="tagline absolute -bottom-2 w-full text-center text-[10px]">
                Reality Check score · sample
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      <Marquee
        items={[
          "48 reality checks a year",
          "4 founders every month",
          "30–90 days to prove it",
          "Kuala Lumpur",
        ]}
      />

      {/* STAGE IMAGE BAND */}
      <section className="relative">
        <div className="relative h-[440px] w-full overflow-hidden bg-ink-2 sm:h-[560px]">
          <Image
            src="/assets/roast_stage.jpg"
            alt="A founder pitching on stage at Roast My Startup, with the Kuala Lumpur skyline behind"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-2 via-ink-2/30 to-transparent" />
          <Container className="absolute inset-x-0 bottom-0 z-10 pb-10">
            <div className="tagline text-gold">Roast My Startup · Vol. 01 · Kuala Lumpur</div>
            <div className="font-display mt-2 max-w-2xl text-[clamp(24px,3.5vw,40px)] text-paper">
              Five minutes on stage. Then the room, and the panel, tell you the truth.
            </div>
          </Container>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="relative overflow-hidden bg-ink-2 text-paper">
        <Glow className="bottom-[-160px] left-[30%] h-[400px] w-[600px] bg-[radial-gradient(circle,rgba(198,65,10,0.35),transparent_70%)]" />
        <Container className="relative z-10 py-24">
          <Reveal>
            <div className="eyebrow" style={{ color: "var(--color-gold)" }}>
              Why we do it this way
            </div>
          </Reveal>
          <Reveal delay={0.1} as="h2" className="font-display mt-6 max-w-4xl text-[clamp(30px,4vw,56px)] text-paper">
            We don&rsquo;t roast founders to bring them down. We challenge them to move faster.
          </Reveal>
          <div className="mt-11 grid max-w-4xl gap-14 md:grid-cols-2">
            <Reveal delay={0.2} as="p" className="text-[17px] text-[#cfc2b4]">
              The signature of Founders Drive isn&rsquo;t that a startup got roasted. It&rsquo;s that
              a founder opened the business to scrutiny, took honest feedback, acted on it, and came
              back to show what changed.
            </Reveal>
            <Reveal delay={0.3} as="p" className="text-[17px] text-[#cfc2b4]">
              Roasters move past generic criticism to name <em>why</em> a company is slow,{" "}
              <em>where</em> the approach is weak, and <em>what</em> the founder must change or
              accelerate.
            </Reveal>
          </div>
          <Reveal delay={0.35} className="mt-12">
            <div className="font-mono-x flex flex-wrap gap-x-3 gap-y-2 text-[13px] text-[#cfc2b4]">
              {["Pitch", "Reality Check", "Action Plan", "Help", "Follow-up", "Progress"].map(
                (s, i, a) => (
                  <span key={s} className={i === a.length - 1 ? "text-gold" : ""}>
                    {s}
                    {i < a.length - 1 && <span className="px-1 text-ember">&rarr;</span>}
                  </span>
                ),
              )}
            </div>
          </Reveal>
        </Container>
      </section>

      {/* STATS */}
      <Container className="py-20">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["4", "startups roasted / month"],
            ["48", "reality checks / year"],
            ["250+", "registered startups · yr one"],
            ["50+", "verified investors"],
          ].map(([n, l], i) => (
            <Reveal key={l} delay={0.08 * i}>
              <Card className="fd-lift p-7">
                <div className="font-mono-x text-[38px] text-ink">{n}</div>
                <div className="tagline mt-2">{l}</div>
              </Card>
            </Reveal>
          ))}
        </div>
      </Container>

      {/* THE NIGHT */}
      <Container className="py-16">
        <Reveal>
          <Eyebrow>The night</Eyebrow>
        </Reveal>
        <Reveal delay={0.1} as="h2" className="font-display mt-6 max-w-2xl text-[clamp(28px,4vw,52px)]">
          Fifteen minutes per founder. No slides to hide behind.
        </Reveal>
        <div className="mt-11 grid gap-5 md:grid-cols-3">
          {[
            ["5'", "Founder pitch", "Problem, solution, market, traction, business model, team and the ask.", false],
            ["10'", "Reality Check", "Rotating panel challenges assumptions, GTM, product, fundraising and execution.", true],
            ["3'", "Transition & verdict", "Critical findings summarised; immediate priorities named on the spot.", false],
          ].map(([t, h, p, dark], i) => (
            <Reveal key={h as string} delay={0.08 * i}>
              <Card dark={dark as boolean} className={`fd-lift p-8 ${dark ? "" : ""}`}>
                <div
                  className={`font-mono-x text-sm ${dark ? "text-gold" : "text-ember"}`}
                >
                  {t}
                </div>
                <h3 className={`font-serif-x mt-4 text-2xl ${dark ? "text-paper" : ""}`}>{h}</h3>
                <p className={`mt-2.5 text-[15px] ${dark ? "text-[#cfc2b4]" : "text-muted"}`}>{p}</p>
              </Card>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.25} className="tagline mt-5">
          Panel rotates monthly · VCs · industry seniors · experienced founders · mentors ·
          ecosystem personalities
        </Reveal>
      </Container>

      {/* FRAMEWORK */}
      <section className="mt-6 bg-paper-2">
        <Container className="py-24">
          <Reveal>
            <Eyebrow>The Reality Check framework</Eyebrow>
          </Reveal>
          <Reveal delay={0.1} as="h2" className="font-display mt-6 text-[clamp(28px,4vw,52px)]">
            Six angles. Every one uncomfortable.
          </Reveal>
          <div className="mt-11 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {FRAMEWORK.map(([h, p], i) => (
              <Reveal key={h} delay={0.06 * i}>
                <Card className="fd-lift h-full p-7">
                  <div className="font-mono-x text-xs text-ember">{String(i + 1).padStart(2, "0")}</div>
                  <h3 className="font-serif-x mt-3 text-[22px]">{h}</h3>
                  <p className="mt-2 text-[14.5px] text-muted">{p}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* WHY WHAT HOW WHO */}
      <Container className="py-24">
        <div className="grid gap-16 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <Reveal>
              <Eyebrow>From criticism to action</Eyebrow>
            </Reveal>
            <Reveal delay={0.1} as="h2" className="font-display mt-6 text-[clamp(26px,3.5vw,46px)]">
              Every point resolves to a next step.
            </Reveal>
            <Reveal delay={0.2} as="p" className="mt-4 text-[16px] text-muted">
              No finding leaves the room as an opinion. Each is pushed through the same structure
              until it names a person and a date.
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <Card className="overflow-hidden">
              {[
                ["WHY", "Target market is too broad and the sales cycle runs 9–12 months.", false],
                ["WHAT", "Narrow the ICP.", false],
                ["HOW", "Run a 90-day pilot with 20 target customers.", false],
                ["WHO", "Two operators, one potential customer, one relevant mentor — introduced by Founders Drive.", true],
              ].map(([k, v, accent], i) => (
                <div key={k as string} className="grid grid-cols-[96px_1fr]">
                  <div
                    className={`font-mono-x p-5 text-xs tracking-[0.12em] text-paper ${
                      accent ? "bg-ember" : "bg-ink"
                    } ${i > 0 ? "border-t border-white/10" : ""}`}
                  >
                    {k}
                  </div>
                  <div className={`p-5 text-[15px] ${i > 0 ? "border-t border-hair" : ""}`}>{v}</div>
                </div>
              ))}
            </Card>
          </Reveal>
        </div>
      </Container>

      {/* JOURNEY */}
      <section id="journey" className="bg-paper-2">
        <Container className="py-24">
          <Reveal>
            <Eyebrow>The 30 / 60 / 90-day founder journey</Eyebrow>
          </Reveal>
          <Reveal delay={0.1} as="h2" className="font-display mt-6 text-[clamp(28px,4vw,52px)]">
            The roast is day one. The point is day ninety.
          </Reveal>
          <div className="mt-12 border-l-2 border-ember/30 pl-8">
            {JOURNEY.map(([d, p], i) => (
              <Reveal key={d} delay={0.08 * i} className="relative pb-10 last:pb-0">
                <span className="absolute -left-[41px] top-1.5 h-3 w-3 rounded-full bg-ember" />
                <div className="font-mono-x text-xs uppercase tracking-[0.12em] text-ember">{d}</div>
                <div className="font-serif-x mt-1.5 text-xl">{p}</div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* YOU SAID / WE DID */}
      <section className="relative overflow-hidden bg-ink-2 text-paper">
        <Glow slow className="right-[10%] top-[-100px] h-[460px] w-[460px] bg-[radial-gradient(circle,rgba(232,168,124,0.28),transparent_70%)]" />
        <Container className="relative z-10 grid items-center gap-16 py-24 lg:grid-cols-2">
          <div>
            <Reveal>
              <div className="eyebrow" style={{ color: "var(--color-gold)" }}>
                The signature format
              </div>
            </Reveal>
            <Reveal delay={0.1} as="h2" className="font-display mt-5 text-[clamp(40px,6vw,64px)] text-paper">
              You Said / We Did
            </Reveal>
            <Reveal delay={0.2} as="p" className="mt-5 max-w-md text-[17px] text-[#cfc2b4]">
              What the panel challenged. What the founder changed. What happened. Every founder
              tracks each issue as Implemented, Partially, Testing or Rejected &mdash; with evidence.
            </Reveal>
            <Reveal delay={0.3} className="mt-8 max-w-md">
              <div className="relative h-[240px] overflow-hidden rounded-2xl border border-white/12">
                <Image
                  src="/assets/reality_check.jpg"
                  alt="Founders in a Reality Check advisory session at Common Ground, Kuala Lumpur"
                  fill
                  sizes="(max-width: 1024px) 100vw, 460px"
                  className="object-cover"
                />
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.2} className="grid gap-3.5">
            {[
              ["You said", "“Your CAC only works if the 9-month sales cycle comes down.”"],
              ["We did", "Cut the ICP to mid-market fintech, ran a 20-account pilot, closed 6 in 47 days."],
            ].map(([k, v]) => (
              <div key={k} className="rounded-2xl border border-white/12 bg-white/5 p-6">
                <div className="tagline text-gold">{k}</div>
                <p className="mt-2 text-[15.5px] text-paper">{v}</p>
              </div>
            ))}
            <div className="rounded-2xl border border-gold/35 bg-gradient-to-r from-ember/25 to-white/5 p-6">
              <div className="tagline text-gold">Status · Day 90</div>
              <p className="mt-2 text-[15.5px] text-paper">
                <span className="font-mono-x rounded bg-ember px-2 py-0.5">IMPLEMENTED</span> &nbsp;sales
                cycle now 41 days average.
              </p>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ECOSYSTEM */}
      <Container className="py-24">
        <Reveal>
          <Eyebrow>Founders Drive — the wider platform</Eyebrow>
        </Reveal>
        <Reveal delay={0.1} as="h2" className="font-display mt-6 max-w-3xl text-[clamp(28px,4vw,52px)]">
          Roast My Startup is the front door. The house keeps going.
        </Reveal>
        <div className="mt-11 grid gap-4.5 sm:grid-cols-2 lg:grid-cols-4">
          {ECOSYSTEM.map(([n, h, p, href], i) => (
            <Reveal key={h} delay={0.05 * i}>
              <Link href={href}>
                <Card dark={i === 0} className="fd-lift h-full p-6">
                  <div className={`font-mono-x text-xs ${i === 0 ? "text-gold" : "text-faint"}`}>{n}</div>
                  <h3 className={`font-serif-x mt-2.5 text-xl ${i === 0 ? "text-paper" : ""}`}>{h}</h3>
                  <p className={`mt-1.5 text-[13.5px] ${i === 0 ? "text-[#cfc2b4]" : "text-muted"}`}>{p}</p>
                </Card>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>

      {/* POLL TEASER */}
      <section className="bg-paper-2">
        <Container className="grid items-center gap-16 py-24 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <Reveal>
              <Eyebrow>Live audience poll</Eyebrow>
            </Reveal>
            <Reveal delay={0.1} as="h2" className="font-display mt-5 text-[clamp(26px,3.5vw,48px)]">
              Every seat is a scorecard.
            </Reveal>
            <Reveal delay={0.2} as="p" className="mt-4 max-w-md text-[16.5px] text-muted">
              While the panel challenges, the room scores each pitch on pitch clarity, investibility
              and innovation &mdash; ordinary listeners, one to ten, live. Founders see the read
              before they leave.
            </Reveal>
            <Reveal delay={0.3} className="mt-6">
              <Link href="/poll" className="font-mono-x text-sm text-ember hover:text-ember-deep">
                Open the live poll &rarr;
              </Link>
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <Card className="p-8">
              <div className="tagline">Pitch 3 of 4 · the room says</div>
              <div className="mt-5 grid gap-4.5">
                {[
                  ["Pitch clarity", 74, "7.4"],
                  ["Investibility", 58, "5.8"],
                  ["Innovation", 81, "8.1"],
                ].map(([l, w, v], i) => (
                  <div key={l as string}>
                    <div className="flex justify-between text-[13px]">
                      <span>{l}</span>
                      <span className="font-mono-x">{v}</span>
                    </div>
                    <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-paper-2">
                      <div
                        className="fd-bar h-2.5 rounded-full"
                        style={{
                          width: `${w}%`,
                          animationDelay: `${0.4 + i * 0.15}s`,
                          background:
                            "linear-gradient(90deg,var(--color-gold),var(--color-ember))",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="tagline mt-4">142 scorecards in</p>
            </Card>
          </Reveal>
        </Container>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <Glow className="bottom-[-200px] left-[35%] h-[520px] w-[640px] bg-[radial-gradient(circle,rgba(240,177,127,0.5),rgba(198,65,10,0.2)_50%,transparent_72%)]" />
        <div className="fd-grain" />
        <Container className="relative z-10 py-28 text-center">
          <Reveal>
            <Eyebrow>Four seats each month</Eyebrow>
          </Reveal>
          <Reveal delay={0.1} as="h2" className="font-display mx-auto mt-6 max-w-3xl text-[clamp(38px,6vw,76px)]">
            Put your startup in one of them.
          </Reveal>
          <Reveal delay={0.2} as="p" className="font-serif-x mx-auto mt-5 max-w-lg text-[21px] text-muted">
            Register your profile, apply for the next Roast My Startup, and come ready to open the
            business to scrutiny.
          </Reveal>
          <Reveal delay={0.3} className="mt-9 flex justify-center gap-3.5">
            <Button href="/register">Register your startup</Button>
            <Button href="/roast-my-startup" variant="ghost">
              Read the format in full
            </Button>
          </Reveal>
        </Container>
      </section>
    </>
  );
}

function Metric({ big, small }: { big: string; small: string }) {
  return (
    <div>
      <div className="font-mono-x text-[22px] text-ink">{big}</div>
      <div className="tagline">{small}</div>
    </div>
  );
}
function Divider() {
  return <div className="h-8 w-px bg-hair-2" />;
}
