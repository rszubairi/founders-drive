"use client";

/** Animated radial score gauge (0–100 or 0–10). */
export function ScoreGauge({
  value,
  max = 100,
  size = 200,
  label,
  dark = false,
}: {
  value: number;
  max?: number;
  size?: number;
  label?: string;
  dark?: boolean;
}) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / max));
  const offset = c * (1 - pct);
  return (
    <div className="relative inline-flex flex-col items-center" style={{ width: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} className="-rotate-90">
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={dark ? "rgba(255,255,255,0.14)" : "var(--color-hair-2)"}
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="url(#fd-gauge)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c}
          style={{
            transition: "stroke-dashoffset 1.6s cubic-bezier(0.2,0.7,0.2,1)",
            strokeDashoffset: offset,
          }}
        />
        <defs>
          <linearGradient id="fd-gauge" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f0c199" />
            <stop offset="1" stopColor="#c6410a" />
          </linearGradient>
        </defs>
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`font-display text-[34px] ${dark ? "text-paper" : "text-ink"}`}
          style={{ fontSize: size * 0.22 }}
        >
          {Number.isInteger(value) ? value : value.toFixed(1)}
        </span>
        {label && <span className="tagline text-[9px]">{label}</span>}
      </div>
    </div>
  );
}

/** Animated horizontal score bar (0–10) with an optional personal marker. */
export function ScoreBar({
  value,
  mine,
  label,
  count,
}: {
  value: number;
  mine?: number | null;
  label: string;
  count?: number;
}) {
  const pct = Math.max(0, Math.min(100, value * 10));
  return (
    <div>
      <div className="flex items-baseline justify-between text-[13px]">
        <span>{label}</span>
        <span className="font-mono-x text-muted">{value.toFixed(1)}</span>
      </div>
      <div className="relative mt-1.5 h-2.5 overflow-visible rounded-full bg-paper-2">
        <div
          className="fd-bar h-2.5 rounded-full"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg,var(--color-gold),var(--color-ember))",
          }}
        />
        {mine != null && (
          <div
            className="absolute -top-1 h-4.5 w-0.5 bg-gold"
            style={{ left: `calc(${Math.min(99, mine * 10)}% - 1px)`, height: "18px" }}
            title={`Your score: ${mine}`}
          />
        )}
      </div>
      {(mine != null || count != null) && (
        <div className="mt-1.5 flex justify-between">
          {mine != null ? (
            <span className="tagline text-[10px] text-gold">your score &middot; {mine}</span>
          ) : (
            <span />
          )}
          {count != null && <span className="tagline text-[10px]">{count} votes</span>}
        </div>
      )}
    </div>
  );
}
