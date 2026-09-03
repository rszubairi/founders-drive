"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Container, Eyebrow, Card, Button, Field, inputCls } from "@/components/ui";

export default function AdminNewsPage() {
  const rows = useQuery(api.news.adminListPosts, {});
  const post = useMutation(api.news.adminPost);
  const setStatus = useMutation(api.news.adminSetStatus);
  const del = useMutation(api.news.adminDelete);

  const [kind, setKind] = useState<"news" | "event">("news");
  const [f, setF] = useState({ title: "", url: "", source: "", summary: "", date: "", location: "" });
  const [busy, setBusy] = useState(false);

  async function add() {
    setBusy(true);
    try {
      await post({
        kind,
        title: f.title,
        url: f.url || undefined,
        source: f.source || undefined,
        summary: f.summary || undefined,
        date: f.date || undefined,
        location: f.location || undefined,
      });
      setF({ title: "", url: "", source: "", summary: "", date: "", location: "" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Container className="py-16">
      <Eyebrow>Founders Drive · host console</Eyebrow>
      <h1 className="font-display mt-4 text-[clamp(30px,4vw,48px)]">News &amp; events</h1>
      <p className="font-serif-x mt-3 max-w-xl text-[18px] text-muted">
        Post curated ecosystem news / events, and moderate what funds publish.
      </p>

      <Card className="mt-8 p-6">
        <div className="flex gap-1 rounded-full border border-hair-2 p-1 text-[13px] max-w-[260px]">
          {(["news", "event"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setKind(k)}
              className={`flex-1 rounded-full px-3 py-1.5 font-medium ${kind === k ? "bg-ember text-[#fff7f0]" : "text-muted"}`}
            >
              {k}
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-3">
          <Field label="Title">
            <input className={inputCls} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Link" hint="Optional">
              <input className={inputCls} value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} />
            </Field>
            {kind === "news" ? (
              <Field label="Source" hint="Optional">
                <input className={inputCls} value={f.source} onChange={(e) => setF({ ...f, source: e.target.value })} />
              </Field>
            ) : (
              <Field label="Date">
                <input className={inputCls} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} placeholder="14 Mar 2026" />
              </Field>
            )}
          </div>
          {kind === "event" && (
            <Field label="Location" hint="Optional">
              <input className={inputCls} value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} />
            </Field>
          )}
          <Field label="Summary / description" hint="Optional">
            <textarea className={`${inputCls} min-h-[60px]`} value={f.summary} onChange={(e) => setF({ ...f, summary: e.target.value })} />
          </Field>
          <Button disabled={busy || !f.title} onClick={add}>
            Publish
          </Button>
        </div>
      </Card>

      <div className="mt-8 grid gap-2">
        {rows?.map((r: any) => (
          <div key={r._id} className="flex items-center justify-between rounded-lg border border-hair bg-card px-4 py-2.5 text-[13px]">
            <span>
              <span className="font-mono-x text-faint">{r.kind}</span> · {r.title}
              <span className="text-faint"> — {r.authorName}</span>
            </span>
            <span className="flex items-center gap-3">
              <span className={`tagline ${r.status === "published" ? "text-ember" : ""}`}>{r.status}</span>
              <button
                onClick={() =>
                  setStatus({ kind: r.kind, id: r._id, status: r.status === "published" ? "hidden" : "published" })
                }
                className="rounded-full border border-hair-2 px-3 py-1 hover:border-ink"
              >
                {r.status === "published" ? "Hide" : "Publish"}
              </button>
              <button onClick={() => del({ id: r._id })} className="text-faint hover:text-[#a63244]">
                Delete
              </button>
            </span>
          </div>
        ))}
        {rows?.length === 0 && <p className="text-muted">Nothing posted yet.</p>}
      </div>
    </Container>
  );
}
