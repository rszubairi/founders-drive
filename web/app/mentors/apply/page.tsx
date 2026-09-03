"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Container, Eyebrow, Card, Button, Field, inputCls } from "@/components/ui";
import { ImageUpload } from "@/components/media";

const CATEGORIES = [
  "Fundraising",
  "Go-to-market",
  "Product",
  "Growth & marketing",
  "Sales",
  "Hiring & team",
  "Technical / engineering",
  "Operations & finance",
  "Legal & compliance",
  "International expansion",
];
const FEE_PCT = 20;

export default function MentorApplyPage() {
  const apply = useMutation(api.mentors.applyMentor);
  const [f, setF] = useState({
    name: "",
    email: "",
    title: "",
    bio: "",
    linkedin: "",
    calendlyUrl: "",
    hourlyRate: "",
    categories: [] as string[],
  });
  const [photo, setPhoto] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const rate = Number(f.hourlyRate) || 0;
  const startupRate = rate ? Math.ceil((rate * (100 + FEE_PCT)) / 100) : 0;

  const toggle = (c: string) =>
    setF((x) => ({
      ...x,
      categories: x.categories.includes(c)
        ? x.categories.filter((y) => y !== c)
        : [...x.categories, c],
    }));

  async function submit() {
    setBusy(true);
    setErr(null);
    try {
      await apply({
        name: f.name,
        email: f.email,
        title: f.title || undefined,
        bio: f.bio,
        categories: f.categories,
        linkedin: f.linkedin || undefined,
        calendlyUrl: f.calendlyUrl,
        hourlyRate: rate,
        photoStorageId: (photo ?? undefined) as never,
      });
      setDone(true);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (done)
    return (
      <Container className="py-24">
        <Card className="mx-auto max-w-md p-8 text-center">
          <h1 className="font-display text-3xl">Application received.</h1>
          <p className="font-serif-x mt-3 text-muted">
            We review new mentors before they go live. You&rsquo;ll get an email at{" "}
            <b>{f.email}</b> once you&rsquo;re approved.
          </p>
          <Button href="/mentors" variant="ghost" className="mt-5">
            Browse the network
          </Button>
        </Card>
      </Container>
    );

  return (
    <Container className="max-w-[860px] py-16">
      <Eyebrow>Mentor Network</Eyebrow>
      <h1 className="font-display mt-4 text-[clamp(34px,5vw,52px)]">Become a mentor.</h1>
      <p className="font-serif-x mt-3.5 text-[19px] text-muted">
        Set your hourly rate — startups see it with our {FEE_PCT}% platform fee added on top. You
        get approved, then founders book you through your Calendly link.
      </p>

      <Card className="mt-8 p-8 sm:p-10">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full name">
            <input className={inputCls} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          </Field>
          <Field label="Email" hint="Private — for approval + booking notifications.">
            <input className={inputCls} type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
          </Field>
          <Field label="Headline" hint="e.g. Ex-VP Growth, Grab" full>
            <input className={inputCls} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
          </Field>
          <Field label="Bio" hint="What you've done and how you help founders." full>
            <textarea className={`${inputCls} min-h-[110px]`} value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} />
          </Field>
          <Field label="LinkedIn" hint="Optional">
            <input className={inputCls} value={f.linkedin} onChange={(e) => setF({ ...f, linkedin: e.target.value })} placeholder="https://linkedin.com/in/…" />
          </Field>
          <Field label="Calendly link" hint="Your public scheduling URL">
            <input className={inputCls} value={f.calendlyUrl} onChange={(e) => setF({ ...f, calendlyUrl: e.target.value })} placeholder="https://calendly.com/you/mentoring" />
          </Field>
          <div className="sm:col-span-2">
            <span className="mb-1.5 block text-[13px] font-medium">Areas you can help with</span>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => {
                const on = f.categories.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggle(c)}
                    className={`rounded-full border px-3 py-1.5 text-[12.5px] ${
                      on ? "border-ember bg-[rgba(198,65,10,0.08)] text-ember" : "border-hair-2 text-muted"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
          <Field label="Your hourly rate (RM)">
            <input
              className={inputCls}
              inputMode="numeric"
              value={f.hourlyRate}
              onChange={(e) => setF({ ...f, hourlyRate: e.target.value.replace(/[^0-9]/g, "") })}
              placeholder="e.g. 400"
            />
          </Field>
          <div className="flex items-end">
            {rate > 0 && (
              <p className="text-[13px] text-muted">
                Startups pay <b className="text-ink">RM {startupRate} / hr</b> — you receive RM{" "}
                {rate}, Founders Drive keeps RM {startupRate - rate}.
              </p>
            )}
          </div>
          <div className="sm:col-span-2">
            <ImageUpload label="Profile photo — optional" shape="round" name={f.name} onChange={setPhoto} />
          </div>
        </div>

        {err && <p className="mt-4 text-[13px] text-[#a63244]">{err}</p>}
        <Button
          className="mt-6"
          disabled={busy || !f.name || !f.email || f.bio.length < 40 || !f.calendlyUrl || !rate || f.categories.length === 0}
          onClick={submit}
        >
          {busy ? "Submitting…" : "Apply to the Mentor Network"}
        </Button>
      </Card>

      <p className="mt-6 text-center text-[13px] text-faint">
        Looking for a mentor?{" "}
        <Link href="/mentors" className="text-ember">
          Browse the network
        </Link>
        .
      </p>
    </Container>
  );
}
