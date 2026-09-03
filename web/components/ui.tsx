import Link from "next/link";
import { ComponentProps, ReactNode } from "react";

export function Container({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={`mx-auto w-full max-w-[1200px] px-6 sm:px-10 lg:px-[60px] ${className}`}
    >
      {children}
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <div className="eyebrow">{children}</div>;
}

export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: any;
}) {
  return (
    <Tag className={`fd-rise ${className}`} style={{ animationDelay: `${delay}s` }}>
      {children}
    </Tag>
  );
}

type BtnProps = {
  href?: string;
  variant?: "solid" | "ghost";
  children: ReactNode;
} & Omit<ComponentProps<"button">, "ref">;

export function Button({ href, variant = "solid", children, className = "", ...rest }: BtnProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 text-[15px] font-medium transition-transform duration-150 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:translate-y-0";
  const styles =
    variant === "solid"
      ? "bg-ember text-[#fff7f0] shadow-[0_10px_26px_-10px_rgba(198,65,10,0.6)] hover:shadow-[0_16px_34px_-10px_rgba(198,65,10,0.7)]"
      : "border border-hair-2 text-ink hover:border-ink";
  const cls = `${base} ${styles} ${className}`;
  if (href)
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}

export function Card({
  children,
  className = "",
  dark = false,
  id,
}: {
  children: ReactNode;
  className?: string;
  dark?: boolean;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={`rounded-2xl ${
        dark
          ? "bg-ink text-paper"
          : "border border-hair bg-card shadow-[0_1px_2px_rgba(138,45,10,0.04),0_18px_48px_-24px_rgba(138,45,10,0.25)]"
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function Glow({
  className = "",
  slow = false,
}: {
  className?: string;
  slow?: boolean;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute rounded-full blur-[34px] ${
        slow ? "fd-float-slow" : "fd-float"
      } ${className}`}
    />
  );
}

export function Field({
  label,
  hint,
  error,
  children,
  full = false,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  full?: boolean;
}) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1.5 block text-[13px] font-medium text-ink">{label}</span>
      {children}
      {hint && !error && (
        <span className="font-serif-x mt-1.5 block text-[12.5px] text-faint">{hint}</span>
      )}
      {error && <span className="mt-1.5 block text-[12.5px] text-[#a63244]">{error}</span>}
    </label>
  );
}

export const inputCls =
  "w-full rounded-md border border-hair-2 bg-paper px-3.5 py-3 text-[15px] text-ink outline-none transition focus:border-ember focus:shadow-[0_0_0_3px_rgba(198,65,10,0.12)]";

export function Chip({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] transition ${
        active
          ? "border-ember bg-[rgba(198,65,10,0.08)] text-ember"
          : "border-hair-2 text-muted hover:border-ink"
      }`}
    >
      {children}
    </button>
  );
}

export function Marquee({ items }: { items: string[] }) {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden border-y border-hair bg-ink py-4 text-paper">
      <div className="fd-marquee items-center">
        {doubled.map((t, i) => (
          <span key={i} className="flex items-center">
            <span className="font-display px-7 text-[26px] text-paper">{t}</span>
            <span className="px-1 text-ember">&mdash;</span>
          </span>
        ))}
      </div>
    </div>
  );
}
