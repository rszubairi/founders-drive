import Link from "next/link";
import { Container, Button } from "./ui";

const NAV = [
  { href: "/roast-my-startup", label: "Roast My Startup" },
  { href: "/directory", label: "Directory" },
  { href: "/capital-connect", label: "Capital Connect" },
  { href: "/perks", label: "Perks" },
  { href: "/poll", label: "Live Poll" },
];

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-hair bg-paper/80 backdrop-blur-md">
      <Container className="flex h-[76px] items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden>
            <circle cx="13" cy="13" r="12" stroke="var(--color-ink)" strokeWidth="1.5" />
            <path
              className="fd-spin"
              d="M13 3a10 10 0 0 1 0 20"
              stroke="var(--color-ember)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="13" cy="13" r="3.2" fill="var(--color-ember)" />
          </svg>
          <span className="font-display text-[22px]">Founders Drive</span>
        </Link>
        <nav className="hidden items-center gap-8 text-[14.5px] lg:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="text-muted transition hover:text-ink">
              {n.label}
            </Link>
          ))}
        </nav>
        <Button href="/register" className="px-5 py-2.5 text-sm">
          Register your startup
        </Button>
      </Container>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-ink text-[#cfc2b4]">
      <Container className="flex flex-col justify-between gap-10 py-14 sm:flex-row">
        <div>
          <div className="font-display text-2xl text-paper">Founders Drive</div>
          <p className="tagline mt-2.5 text-faint">
            The Malaysian startup ecosystem &middot; Kuala Lumpur
          </p>
        </div>
        <div className="flex flex-wrap gap-x-14 gap-y-8 text-[14px]">
          <FooterCol
            title="Programme"
            links={[
              ["Roast My Startup", "/roast-my-startup"],
              ["Live Poll", "/poll"],
              ["Founder Follow-up", "/roast-my-startup#journey"],
            ]}
          />
          <FooterCol
            title="Platform"
            links={[
              ["Startup Directory", "/directory"],
              ["Capital Connect", "/capital-connect"],
              ["Founder Perks", "/perks"],
            ]}
          />
          <FooterCol
            title="More"
            links={[
              ["Register", "/register"],
              ["List your fund", "/capital-connect/apply"],
              ["Apply to pitch", "/roast-my-startup#apply"],
              ["Admin", "/admin"],
            ]}
          />
        </div>
      </Container>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div className="grid gap-2.5">
      <span className="tagline text-faint">{title}</span>
      {links.map(([label, href]) => (
        <Link key={href} href={href} className="transition hover:text-paper">
          {label}
        </Link>
      ))}
    </div>
  );
}
