"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Container, Eyebrow, Button, Card, Field, inputCls } from "@/components/ui";
import { ImageUpload } from "@/components/media";

const STAGES = ["Idea stage", "Pre-Seed", "Seed", "Series A", "Series A+"];
const SECTORS = [
  "Fintech",
  "SaaS / B2B software",
  "Agritech / Deep Tech",
  "Healthtech / AI",
  "Marketplace / Logistics",
  "Consumer / D2C",
  "Climate / Energy",
  "Deep tech / Robotics",
  "Sector agnostic",
];
const LEAD = ["Lead", "Co-invest", "Either"];

type Form = {
  fundName: string;
  name: string;
  role: string;
  contactEmail: string;
  website: string;
  stagePreferences: string[];
  sectors: string[];
  ticketMin: string;
  ticketMax: string;
  geography: string;
  thesis: string;
  leadPreference: string;
  portfolioHighlights: string;
};

const EMPTY: Form = {
  fundName: "",
  name: "",
  role: "",
  contactEmail: "",
  website: "",
  stagePreferences: [],
  sectors: [],
  ticketMin: "",
  ticketMax: "",
  geography: "",
  thesis: "",
  leadPreference: "",
  portfolioHighlights: "",
};

export default function VcApplyPage() {
  const register = useMutation(api.investors.registerInvestor);
  const setInvestorLogo = useMutation(api.media.setInvestorLogo);
  const [logoStorageId, setLogoStorageId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const toggle = (key: "stagePreferences" | "sectors", tag: string) =>
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(tag) ? f[key].filter((t) => t !== tag) : [...f[key], tag],
    }));

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.fundName.trim()) e.fundName = "Which fund is this?";
    if (!form.name.trim()) e.name = "Who should we credit as the contact?";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail.trim()))
      e.contactEmail = "We use this to verify the fund before it goes live — it stays private.";
    if (form.stagePreferences.length === 0) e.stagePreferences = "Pick at least one stage.";
    if (form.sectors.length === 0) e.sectors = "Pick at least one sector.";
    if (!form.geography.trim()) e.geography = "Where do you invest?";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await register({
        fundName: form.fundName,
        name: form.name,
        role: form.role || undefined,
        contactEmail: form.contactEmail.trim(),
        website: form.website || undefined,
        stagePreferences: form.stagePreferences,
        sectors: form.sectors,
        ticketMin: form.ticketMin ? Number(form.ticketMin) : undefined,
        ticketMax: form.ticketMax ? Number(form.ticketMax) : undefined,
        geography: form.geography.split(",").map((g) => g.trim()).filter(Boolean),
        thesis: form.thesis || undefined,
        leadPreference: form.leadPreference || undefined,
        portfolioHighlights: form.portfolioHighlights
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean),
      });
      if (logoStorageId && res && (res as { investorId?: string }).investorId) {
        await setInvestorLogo({
          investorId: (res as { investorId: string }).investorId as never,
          storageId: logoStorageId as never,
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
      <Container className="max-w-[820px]">
        <Eyebrow>Capital Connect</Eyebrow>
        <h1 className="font-display mt-4 text-[clamp(34px,5vw,52px)]">List your fund.</h1>
        <p className="font-serif-x mt-3.5 max-w-xl text-[19px] text-muted">
          Founders match against this list by stage, sector and geography. We review every new
          profile before it goes live — your contact email is never shown publicly.
        </p>

        <Card className="mt-8 p-8 sm:p-11">
          {done ? (
            <div className="py-6 text-center">
              <div className="mx-auto flex h-13 w-13 items-center justify-center rounded-full border-2 border-ember">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-ember)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <h2 className="font-display mt-5 text-[clamp(28px,4vw,38px)]">
                Thanks — {form.fundName} is in review.
              </h2>
              <p className="font-serif-x mx-auto mt-3 max-w-md text-[18px] text-muted">
                We verify new funds before they appear on Capital Connect. You&rsquo;ll show up once
                approved.
              </p>
              <div className="mt-7 flex justify-center gap-3">
                <Button href="/capital-connect">Back to Capital Connect</Button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Fund name" error={errors.fundName} full>
                  <input className={inputCls} value={form.fundName} onChange={(e) => set("fundName", e.target.value)} placeholder="e.g. Meridian East Capital" />
                </Field>
                <Field label="Contact name" error={errors.name}>
                  <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Full name" />
                </Field>
                <Field label="Role / title" hint="Optional">
                  <input className={inputCls} value={form.role} onChange={(e) => set("role", e.target.value)} placeholder="Partner, Principal…" />
                </Field>
                <Field label="Contact email" error={errors.contactEmail} hint="Private — used to verify the fund, never published.">
                  <input className={inputCls} type="email" value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} placeholder="you@fund.com" />
                </Field>
                <Field label="Website" hint="Optional">
                  <input className={inputCls} value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://" />
                </Field>

                <div className="sm:col-span-2">
                  <ImageUpload
                    label="Fund logo — optional"
                    name={form.fundName}
                    onChange={setLogoStorageId}
                  />
                </div>

                <Field label="Stage preferences" error={errors.stagePreferences} full>
                  <div className="flex flex-wrap gap-2">
                    {STAGES.map((s) => (
                      <TogglePill key={s} active={form.stagePreferences.includes(s)} onClick={() => toggle("stagePreferences", s)}>
                        {s}
                      </TogglePill>
                    ))}
                  </div>
                </Field>

                <Field label="Sectors" error={errors.sectors} full>
                  <div className="flex flex-wrap gap-2">
                    {SECTORS.map((s) => (
                      <TogglePill key={s} active={form.sectors.includes(s)} onClick={() => toggle("sectors", s)}>
                        {s}
                      </TogglePill>
                    ))}
                  </div>
                </Field>

                <Field label="Typical ticket min (RM)" hint="Optional">
                  <input className={inputCls} inputMode="numeric" value={form.ticketMin} onChange={(e) => set("ticketMin", e.target.value.replace(/[^0-9]/g, ""))} placeholder="e.g. 500000" />
                </Field>
                <Field label="Typical ticket max (RM)" hint="Optional">
                  <input className={inputCls} inputMode="numeric" value={form.ticketMax} onChange={(e) => set("ticketMax", e.target.value.replace(/[^0-9]/g, ""))} placeholder="e.g. 3000000" />
                </Field>

                <Field label="Geography" error={errors.geography} hint="Comma-separated, e.g. Malaysia, SEA" full>
                  <input className={inputCls} value={form.geography} onChange={(e) => set("geography", e.target.value)} placeholder="Malaysia, SEA" />
                </Field>

                <Field label="Lead preference" hint="Optional">
                  <select className={inputCls} value={form.leadPreference} onChange={(e) => set("leadPreference", e.target.value)}>
                    <option value="">Select</option>
                    {LEAD.map((l) => (
                      <option key={l}>{l}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Portfolio highlights" hint="Comma-separated, optional">
                  <input className={inputCls} value={form.portfolioHighlights} onChange={(e) => set("portfolioHighlights", e.target.value)} placeholder="Company A, Company B" />
                </Field>

                <Field label="Investment thesis" hint="Optional — shown on your public card" full>
                  <textarea className={`${inputCls} min-h-[90px]`} value={form.thesis} onChange={(e) => set("thesis", e.target.value)} placeholder="What kind of founders and problems do you back?" />
                </Field>
              </div>

              {errors.submit && <p className="mt-3 text-[13px] text-[#a63244]">{errors.submit}</p>}

              <div className="mt-8 flex items-center justify-end border-t border-hair pt-6">
                <Button onClick={submit} disabled={submitting}>
                  {submitting ? "Submitting…" : "Submit for review"}
                </Button>
              </div>
            </>
          )}
        </Card>
      </Container>
    </div>
  );
}

function TogglePill({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-[12.5px] transition ${
        active ? "border-ember bg-[rgba(198,65,10,0.08)] text-ember" : "border-hair-2 text-muted hover:border-ink"
      }`}
    >
      {children}
    </button>
  );
}
