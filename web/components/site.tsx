import Link from "next/link";
import Image from "next/image";
import { Container, Button } from "./ui";

const NAV = [
  { href: "/roast-my-startup", label: "Roast My Startup" },
  { href: "/directory", label: "Directory" },
  { href: "/capital-connect", label: "Capital Connect" },
  { href: "/mentors", label: "Mentors" },
  { href: "/programmes", label: "Programmes" },
  { href: "/news", label: "News" },
];

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-hair bg-paper/80 backdrop-blur-md">
      <Container className="flex h-[92px] items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src="/assets/logo.png"
            alt="Founders Drive"
            width={80}
            height={80}
            priority
            className="h-20 w-20 rounded-full"
          />
        </Link>
        <nav className="hidden items-center gap-8 text-[14.5px] lg:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="text-muted transition hover:text-ink">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <Button href="/register" className="px-5 py-2.5 text-sm">
            Register your startup
          </Button>
        </div>
      </Container>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-ink text-[#cfc2b4]">
      <Container className="flex flex-col justify-between gap-10 py-14 sm:flex-row">
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/assets/logo.png"
              alt="Founders Drive"
              width={44}
              height={44}
              className="h-11 w-11 rounded-full"
            />
            <div className="font-display text-2xl text-paper">Founders Drive</div>
          </div>
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
              ["Mentor Network", "/mentors"],
              ["Programmes", "/programmes"],
              ["Industry contributors", "/contributors"],
              ["Founder Perks", "/perks"],
            ]}
          />
          <FooterCol
            title="More"
            links={[
              ["Register", "/register"],
              ["Founder login", "/founder/login"],
              ["Investor login", "/vc/login"],
              ["List your fund", "/capital-connect/apply"],
              ["News", "/news"],
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
