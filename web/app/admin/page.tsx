"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Container, Eyebrow, Card } from "@/components/ui";

const SECTIONS = [
  {
    href: "/admin/startups",
    title: "Startup sign-ups",
    desc: "Approve or reject new directory profiles before they go public.",
  },
  {
    href: "/admin/investors",
    title: "VC sign-ups",
    desc: "Approve or reject new fund profiles before they show up on Capital Connect.",
  },
  {
    href: "/admin/roast",
    title: "Roast My Startup lineup",
    desc: "Pick the four startups that pitch from everyone who applied.",
  },
  {
    href: "/admin/claims",
    title: "Profile claims",
    desc: "Manual review for profile-ownership claims that couldn't auto-approve.",
  },
  {
    href: "/admin/emails",
    title: "Email log",
    desc: "Every transactional email — sent, skipped or errored — plus a test send.",
  },
  {
    href: "/admin/news",
    title: "News & events",
    desc: "Post curated news / events and moderate what funds publish on /news.",
  },
  {
    href: "/admin/mentors",
    title: "Mentor sign-ups",
    desc: "Approve mentors before they appear in the network.",
  },
  {
    href: "/poll/admin",
    title: "Live poll",
    desc: "Run the audience scorecard during the event.",
  },
];

export default function AdminHubPage() {
  const router = useRouter();
  async function signOut() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.replace("/admin/login");
  }
  return (
    <Container className="py-16">
      <Eyebrow>Founders Drive · host console</Eyebrow>
      <h1 className="font-display mt-4 text-[clamp(30px,4vw,48px)]">Admin</h1>
      <p className="font-serif-x mt-3 max-w-xl text-[18px] text-muted">
        Everything a host needs to keep the directory, Capital Connect and the event lineup clean.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <p className="rounded-md border border-hair-2 bg-paper-2 px-3 py-2 text-[13px] text-muted">
          The <strong>UI</strong> is gated by the admin login. Convex admin functions are still
          open — add real auth before launch.
        </p>
        <button
          onClick={signOut}
          className="rounded-full border border-hair-2 px-3.5 py-2 text-[13px] font-medium hover:border-ink"
        >
          Sign out
        </button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {SECTIONS.map((s) => (
          <Link key={s.href} href={s.href}>
            <Card className="fd-lift h-full p-6">
              <h3 className="font-serif-x text-[20px]">{s.title}</h3>
              <p className="mt-2 text-[14px] text-muted">{s.desc}</p>
            </Card>
          </Link>
        ))}
      </div>
    </Container>
  );
}
