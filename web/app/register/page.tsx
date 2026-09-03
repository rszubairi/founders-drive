"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Container, Eyebrow, Button, Card, Field, inputCls } from "@/components/ui";
import { ImageUpload } from "@/components/media";

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
const TEAM = ["Just me", "2-3", "4-10", "11-25", "25+"];
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

const STEPS = ["Company", "Founders", "Help", "Review"];

type Form = {
  name: string;
  pitch: string;
  website: string;
  city: string;
  sector: string;
  stage: string;
  founderName: string;
  founderRole: string;
  founderEmail: string;
  founderLinkedin: string;
  teamSize: string;
  traction: string;
  fundingRaised: string;
  fundStatus: string;
  targetAmount: string;
  helpWanted: string[];
  logoStorageId: string | null;
  founderPhotoStorageId: string | null;
};

const EMPTY: Form = {
  name: "",
  pitch: "",
  website: "",
  city: "",
  sector: "",
  stage: "",
  founderName: "",
  founderRole: "",
  founderEmail: "",
  founderLinkedin: "",
  teamSize: "",
  traction: "",
  fundingRaised: "",
  fundStatus: "",
  targetAmount: "",
  helpWanted: [],
  logoStorageId: null,
  founderPhotoStorageId: null,
};

export default function RegisterPage() {
  const register = useMutation(api.startups.registerStartup);
  const setStartupLogo = useMutation(api.media.setStartupLogo);
  const setFounderPhoto = useMutation(api.media.setFounderPhoto);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const set = <K extends keyof Form>(k: K, v: Form[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggleHelp = (tag: string) =>
    setForm((f) => ({
      ...f,
      helpWanted: f.helpWanted.includes(tag)
        ? f.helpWanted.filter((t) => t !== tag)
        : [...f.helpWanted, tag],
    }));

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!form.name.trim()) e.name = "Please add your company name.";
      if (!form.pitch.trim()) e.pitch = "A clear one-liner helps the panel place you fast.";
      if (!form.sector) e.sector = "Pick the closest sector.";
      if (!form.stage) e.stage = "Pick your current stage.";
      if (!form.city.trim()) e.city = "Where are you based?";
    }
    if (step === 1) {
      if (!form.founderName.trim()) e.founderName = "Who's the founder on stage?";
      if (!form.founderRole.trim()) e.founderRole = "Add a role.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.founderEmail.trim()))
        e.founderEmail = "We send your welcome + confirmations here.";
      if (!form.traction.trim()) e.traction = "Even “pre-revenue, 12 interviews done” is useful.";
      if (!form.fundStatus) e.fundStatus = "This drives investor matching — pick one.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (validate()) setStep((s) => s + 1);
  }

  async function submit() {
    setSubmitting(true);
    try {
      const res = await register({
        name: form.name,
        pitch: form.pitch,
        website: form.website || undefined,
        city: form.city,
        sector: form.sector,
        stage: form.stage,
        teamSize: form.teamSize || undefined,
        traction: form.traction || undefined,
        fundingRaised: form.fundingRaised || undefined,
        fundStatus: form.fundStatus,
        targetAmount: form.targetAmount || undefined,
        helpWanted: form.helpWanted,
        founderName: form.founderName,
        founderRole: form.founderRole,
        founderEmail: form.founderEmail.trim(),
        founderLinkedin: form.founderLinkedin || undefined,
      });
      const slug = (res as { slug: string }).slug;
      const email = form.founderEmail.trim();
      if (form.logoStorageId) {
        await setStartupLogo({ slug, ownerEmail: email, storageId: form.logoStorageId as never }).catch(() => {});
      }
      if (form.founderPhotoStorageId) {
        await setFounderPhoto({
          slug,
          ownerEmail: email,
          founderEmail: email,
          storageId: form.founderPhotoStorageId as never,
        }).catch(() => {});
      }
      setDone(true);
    } catch (err) {
      setErrors({ submit: (err as Error).message || "Something went wrong." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-paper-2 py-16">
      <Container className="max-w-[960px]">
        <div className="flex items-baseline justify-between">
          <Eyebrow>Founders Drive · Startup Directory</Eyebrow>
          <span className="tagline">Convex-backed</span>
        </div>
        <h1 className="font-display mt-4 text-[clamp(34px,5vw,52px)]">Register your startup.</h1>
        <p className="font-serif-x mt-3.5 max-w-xl text-[19px] text-muted">
          Your profile joins the Malaysian startup directory and puts you in line for the next Roast
          My Startup. Contact details stay private &mdash; introductions are always controlled by
          you.
        </p>

        {!done && (
          <div className="mt-8 flex flex-wrap gap-2.5">
            {STEPS.map((label, i) => (
              <div
                key={label}
                className={`flex items-center gap-2 rounded-md border px-3.5 py-2 text-[12.5px] font-medium ${
                  i === step
                    ? "border-ember bg-ember text-[#fff7f0]"
                    : i < step
                      ? "border-hair-2 bg-card text-ink"
                      : "border-hair text-faint"
                }`}
              >
                <span className="font-mono-x text-[11px]">{String(i + 1).padStart(2, "0")}</span>
                {label}
              </div>
            ))}
          </div>
        )}

        <Card className="mt-6 p-8 sm:p-11">
          {done ? (
            <div className="py-6 text-center">
              <div className="mx-auto flex h-13 w-13 items-center justify-center rounded-full border-2 border-ember">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-ember)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <h2 className="font-display mt-5 text-[clamp(28px,4vw,38px)]">
                Registration received.
              </h2>
              <p className="font-serif-x mx-auto mt-3 max-w-md text-[18px] text-muted">
                We&rsquo;ve emailed <strong>{form.founderEmail}</strong>. The team reviews new
                profiles within a few working days — you&rsquo;ll get an email when{" "}
                <strong>{form.name}</strong> is approved, with the steps to put it forward for Roast
                My Startup.
              </p>
              <div className="mt-7 flex justify-center gap-3">
                <Button href="/directory" variant="ghost">
                  Browse the directory
                </Button>
              </div>
            </div>
          ) : (
            <>
              {step === 0 && (
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field label="Company name" error={errors.name} full>
                    <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Padi Analytics" />
                  </Field>
                  <Field label="One-line description" error={errors.pitch} full>
                    <input className={inputCls} value={form.pitch} onChange={(e) => set("pitch", e.target.value)} placeholder="What you do, in one sentence a stranger would understand" />
                  </Field>
                  <Field label="Website" hint="Optional">
                    <input className={inputCls} value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://" />
                  </Field>
                  <Field label="HQ city" error={errors.city}>
                    <input className={inputCls} value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Kuala Lumpur" />
                  </Field>
                  <Field label="Sector" error={errors.sector}>
                    <select className={inputCls} value={form.sector} onChange={(e) => set("sector", e.target.value)}>
                      <option value="">Select a sector</option>
                      {SECTORS.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Stage" error={errors.stage}>
                    <select className={inputCls} value={form.stage} onChange={(e) => set("stage", e.target.value)}>
                      <option value="">Select a stage</option>
                      {STAGES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </Field>
                  <div className="sm:col-span-2">
                    <ImageUpload
                      label="Company logo — optional (PNG or SVG, square works best)"
                      name={form.name}
                      onChange={(id) => set("logoStorageId", id)}
                    />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field label="Lead founder name" error={errors.founderName}>
                    <input className={inputCls} value={form.founderName} onChange={(e) => set("founderName", e.target.value)} placeholder="Full name" />
                  </Field>
                  <Field label="Role / title" error={errors.founderRole}>
                    <input className={inputCls} value={form.founderRole} onChange={(e) => set("founderRole", e.target.value)} placeholder="CEO, CTO…" />
                  </Field>
                  <Field label="Work email" error={errors.founderEmail} hint="Private — never shown on your public profile." full>
                    <input className={inputCls} type="email" value={form.founderEmail} onChange={(e) => set("founderEmail", e.target.value)} placeholder="you@yourcompany.my" />
                  </Field>
                  <Field label="LinkedIn" hint="Optional">
                    <input className={inputCls} value={form.founderLinkedin} onChange={(e) => set("founderLinkedin", e.target.value)} placeholder="linkedin.com/in/…" />
                  </Field>
                  <div className="sm:col-span-2">
                    <ImageUpload
                      label="Your profile picture — optional"
                      shape="round"
                      name={form.founderName}
                      onChange={(id) => set("founderPhotoStorageId", id)}
                    />
                  </div>
                  <Field label="Team size">
                    <select className={inputCls} value={form.teamSize} onChange={(e) => set("teamSize", e.target.value)}>
                      <option value="">Select</option>
                      {TEAM.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Traction so far" error={errors.traction} full>
                    <textarea className={`${inputCls} min-h-[90px]`} value={form.traction} onChange={(e) => set("traction", e.target.value)} placeholder="Users, customers, revenue, growth, pilots, letters of intent — whatever is real." />
                  </Field>
                  <Field label="Total raised to date">
                    <input className={inputCls} value={form.fundingRaised} onChange={(e) => set("fundingRaised", e.target.value)} placeholder="RM 0 — or amount + round" />
                  </Field>
                  <Field label="Fundraising status" error={errors.fundStatus}>
                    <select className={inputCls} value={form.fundStatus} onChange={(e) => set("fundStatus", e.target.value)}>
                      <option value="">Select</option>
                      {FUND_STATUS.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Target raise" hint="If raising" full>
                    <input className={inputCls} value={form.targetAmount} onChange={(e) => set("targetAmount", e.target.value)} placeholder="e.g. RM 2.5M seed for 18 months runway" />
                  </Field>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="font-serif-x text-2xl">What help do you want?</h2>
                  <p className="font-serif-x mt-2 text-[14px] text-faint">
                    Founders Drive matches these needs to people in the ecosystem. Pick as many as
                    apply.
                  </p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {HELP.map((tag) => {
                      const on = form.helpWanted.includes(tag);
                      return (
                        <button
                          type="button"
                          key={tag}
                          onClick={() => toggleHelp(tag)}
                          className={`flex items-center gap-3 rounded-md border px-4 py-3 text-left text-[14.5px] transition ${
                            on
                              ? "border-ember bg-[rgba(198,65,10,0.06)]"
                              : "border-hair-2 bg-paper hover:border-ink"
                          }`}
                        >
                          <span
                            className={`flex h-[17px] w-[17px] flex-none items-center justify-center rounded-[3px] border-[1.5px] text-[11px] text-white ${
                              on ? "border-ember bg-ember" : "border-hair-2"
                            }`}
                          >
                            {on ? "✓" : ""}
                          </span>
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                  <p className="font-serif-x mt-4 rounded-md border border-hair-2 bg-paper px-4 py-3 text-[13px] text-muted">
                    This is a platform registration. Once <strong>{form.name || "your startup"}</strong>{" "}
                    is approved you can propose it for a specific <strong>Roast My Startup</strong>{" "}
                    from the event page — hit <strong>&ldquo;Roast Me&rdquo;</strong> there.
                  </p>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h2 className="font-serif-x text-2xl">Review &amp; submit</h2>
                  <dl className="mt-5 border-t border-hair">
                    {[
                      ["Company", `${form.name}${form.website ? `\n${form.website}` : ""}`],
                      ["What they do", form.pitch],
                      ["Sector / stage", `${form.sector} · ${form.stage}${form.city ? ` · ${form.city}` : ""}`],
                      ["Founder", `${form.founderName}, ${form.founderRole}\n${form.founderEmail} (private)${form.teamSize ? `\nTeam: ${form.teamSize}` : ""}`],
                      ["Traction", form.traction],
                      ["Funding", `Raised: ${form.fundingRaised || "—"}\nStatus: ${form.fundStatus}${form.targetAmount ? `\nTarget: ${form.targetAmount}` : ""}`],
                      ["Help wanted", form.helpWanted.join(", ") || "—"],
                    ].map(([k, v]) => (
                      <div key={k} className="grid grid-cols-[180px_1fr] gap-5 border-b border-hair py-3.5">
                        <dt className="tagline pt-0.5">{k}</dt>
                        <dd className="whitespace-pre-line text-[15px]">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="font-serif-x mt-4 text-[13px] text-faint">
                    By submitting you confirm the startup operates in Malaysia and the founder listed
                    consents to a public directory profile. Contact details are never published.
                  </p>
                  {errors.submit && (
                    <p className="mt-3 text-[13px] text-[#a63244]">{errors.submit}</p>
                  )}
                </div>
              )}

              <div className="mt-8 flex items-center justify-between border-t border-hair pt-6">
                <div>
                  {step > 0 && (
                    <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
                      Back
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span className="tagline">Step {step + 1} of 4</span>
                  {step < 3 ? (
                    <Button onClick={next}>Continue</Button>
                  ) : (
                    <Button onClick={submit} disabled={submitting}>
                      {submitting ? "Submitting…" : "Submit profile"}
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </Card>

        <p className="mt-6 text-center text-[13px] text-faint">
          Prefer to just come and watch?{" "}
          <Link href="/roast-my-startup#apply" className="text-ember">
            RSVP for Roast My Startup
          </Link>
          .
        </p>
      </Container>
    </div>
  );
}
