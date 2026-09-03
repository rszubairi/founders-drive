"use client";

import { useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Container, Eyebrow, Card, Button, Field, inputCls } from "@/components/ui";

const STATUSES = ["sent", "skipped", "error"];

export default function AdminEmailsPage() {
  const [status, setStatus] = useState<string | null>(null);
  const logs = useQuery(api.emailLog.listEmailLog, {
    status: status || undefined,
    limit: 200,
  });
  const stats = useQuery(api.emailLog.emailLogStats);
  const config = useQuery(api.emailLog.emailConfig);
  const sendTest = useAction(api.emails.sendTest);

  const [testTo, setTestTo] = useState("");
  const [testState, setTestState] = useState<"idle" | "busy" | "done" | "err">("idle");
  const [testMsg, setTestMsg] = useState("");

  async function runTest() {
    setTestState("busy");
    setTestMsg("");
    try {
      const r = (await sendTest({ to: testTo.trim() })) as { id?: string | null; skipped?: boolean };
      setTestState("done");
      setTestMsg(r.skipped ? "Logged as skipped — no API key on this deployment." : `Sent · ${r.id}`);
    } catch (e) {
      setTestState("err");
      setTestMsg((e as Error).message);
    }
  }

  return (
    <Container className="py-16">
      <Eyebrow>Founders Drive · host console</Eyebrow>
      <h1 className="font-display mt-4 text-[clamp(30px,4vw,48px)]">Email log</h1>
      <p className="font-serif-x mt-3 max-w-xl text-[18px] text-muted">
        Every transactional email attempt — welcome, approval, claim verification and notices.
      </p>
      <p className="mt-4 rounded-md border border-hair-2 bg-paper-2 px-3 py-2 text-[13px] text-muted">
        v1 has no authentication — gate this route before launch.
      </p>

      {/* config banner */}
      {config && (
        <div
          className={`mt-6 rounded-lg border p-4 text-[13.5px] ${
            config.hasApiKey && !config.usingTestSender
              ? "border-hair bg-card"
              : "border-[#a63244]/40 bg-[rgba(166,50,68,0.06)]"
          }`}
        >
          <div className="font-mono-x">
            RESEND_API_KEY {config.hasApiKey ? "set ✓" : "NOT SET ✗"} · from{" "}
            <b>{config.from}</b>
          </div>
          {!config.hasApiKey && (
            <p className="mt-1 text-muted">
              Nothing is being sent. Run{" "}
              <code>npx convex env set RESEND_API_KEY re_… [--prod]</code>.
            </p>
          )}
          {config.hasApiKey && config.usingTestSender && (
            <p className="mt-1 text-muted">
              Using Resend&rsquo;s test sender — it only delivers to the address that owns the
              Resend account. Verify a domain at resend.com/domains, then{" "}
              <code>npx convex env set EMAILS_FROM &quot;Founders Drive &lt;hello@yourdomain&gt;&quot;</code>.
            </p>
          )}
        </div>
      )}

      {/* stats + test */}
      <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_1fr]">
        <Card className="p-5">
          <div className="tagline">Totals</div>
          {stats && (
            <div className="mt-2 flex gap-5 font-mono-x text-[15px]">
              <span>{stats.sent} sent</span>
              <span className="text-muted">{stats.skipped} skipped</span>
              <span className="text-[#a63244]">{stats.error} error</span>
            </div>
          )}
        </Card>
        <Card className="p-5">
          <Field label="Send a test email">
            <div className="flex gap-2">
              <input
                className={inputCls}
                value={testTo}
                onChange={(e) => setTestTo(e.target.value)}
                placeholder="you@example.com"
              />
              <Button onClick={runTest} disabled={!testTo.includes("@") || testState === "busy"}>
                {testState === "busy" ? "Sending…" : "Send"}
              </Button>
            </div>
          </Field>
          {testMsg && (
            <p
              className={`mt-2 text-[12.5px] ${
                testState === "err" ? "text-[#a63244]" : "text-muted"
              }`}
            >
              {testMsg}
            </p>
          )}
        </Card>
      </div>

      {/* filter */}
      <div className="mt-8 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(status === s ? null : s)}
            className={`rounded-full border px-3.5 py-2 text-[13px] transition ${
              status === s
                ? "border-ember bg-[rgba(198,65,10,0.08)] text-ember"
                : "border-hair-2 text-muted"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-hair text-left text-faint">
              <th className="py-2 pr-4 font-medium">When</th>
              <th className="py-2 pr-4 font-medium">Status</th>
              <th className="py-2 pr-4 font-medium">Kind</th>
              <th className="py-2 pr-4 font-medium">To</th>
              <th className="py-2 pr-4 font-medium">Subject / reason</th>
            </tr>
          </thead>
          <tbody>
            {logs === undefined && (
              <tr>
                <td colSpan={5} className="py-6 text-muted">
                  Loading…
                </td>
              </tr>
            )}
            {logs?.map((l) => (
              <tr key={l._id} className="border-b border-hair align-top">
                <td className="py-2.5 pr-4 font-mono-x text-faint">
                  {new Date(l.createdAt).toLocaleString()}
                </td>
                <td className="py-2.5 pr-4">
                  <span
                    className={`rounded px-1.5 py-0.5 font-mono-x text-[11px] ${
                      l.status === "sent"
                        ? "bg-ink text-paper"
                        : l.status === "skipped"
                          ? "bg-paper-2 text-muted"
                          : "bg-[rgba(166,50,68,0.12)] text-[#a63244]"
                    }`}
                  >
                    {l.status}
                  </span>
                </td>
                <td className="py-2.5 pr-4 font-mono-x text-muted">{l.kind}</td>
                <td className="py-2.5 pr-4">{l.to}</td>
                <td className="py-2.5 pr-4">
                  <div>{l.subject}</div>
                  {l.reason && (
                    <div className="mt-0.5 text-[12px] text-[#a63244]">{l.reason}</div>
                  )}
                  {l.providerId && (
                    <div className="mt-0.5 font-mono-x text-[11px] text-faint">{l.providerId}</div>
                  )}
                </td>
              </tr>
            ))}
            {logs?.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-muted">
                  No emails {status ? `with status "${status}"` : "yet"}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Container>
  );
}
