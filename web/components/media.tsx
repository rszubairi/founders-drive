"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") || "•"
  );
}

/** Square company logo — falls back to an initials monogram. */
export function Logo({
  src,
  name,
  size = 44,
  className = "",
}: {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
}) {
  const box = `overflow-hidden rounded-lg border border-hair ${className}`;
  if (src) {
    return (
      <span
        className={`relative inline-block bg-card ${box}`}
        style={{ width: size, height: size }}
      >
        <Image src={src} alt={`${name} logo`} fill sizes={`${size}px`} className="object-contain p-1" />
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center justify-center bg-paper-2 font-mono-x text-faint ${box}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.32) }}
    >
      {initials(name)}
    </span>
  );
}

/** Round headshot — falls back to an initials monogram. */
export function Avatar({
  src,
  name,
  size = 44,
}: {
  src?: string | null;
  name: string;
  size?: number;
}) {
  if (src) {
    return (
      <span
        className="relative inline-block overflow-hidden rounded-full bg-paper-2"
        style={{ width: size, height: size }}
      >
        <Image src={src} alt={name} fill sizes={`${size}px`} className="object-cover" />
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center justify-center rounded-full bg-paper-2 font-serif-x text-ink"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
    >
      {initials(name)}
    </span>
  );
}

/**
 * File picker that uploads straight to Convex storage and reports back the
 * storageId. Local object-URL preview until the page reloads.
 */
export function ImageUpload({
  label,
  shape = "square",
  name = "",
  onChange,
}: {
  label: string;
  shape?: "square" | "round";
  name?: string;
  onChange: (storageId: string | null) => void;
}) {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handle(file: File) {
    setErr(null);
    if (!file.type.startsWith("image/")) return setErr("Images only.");
    if (file.size > 3 * 1024 * 1024) return setErr("Keep it under 3 MB.");
    setBusy(true);
    try {
      const url = await generateUploadUrl();
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const json = (await res.json()) as { storageId: string };
      setPreview(URL.createObjectURL(file));
      onChange(json.storageId);
    } catch {
      setErr("Upload failed — try again.");
    } finally {
      setBusy(false);
    }
  }

  const round = shape === "round";

  return (
    <div>
      <span className="mb-1.5 block text-[13px] font-medium text-ink">{label}</span>
      <div className="flex items-center gap-3">
        {preview ? (
          <span
            className={`relative inline-block overflow-hidden border border-hair bg-card ${
              round ? "rounded-full" : "rounded-lg"
            }`}
            style={{ width: 56, height: 56 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
            <img src={preview} alt="" className={`h-full w-full ${round ? "object-cover" : "object-contain"}`} />
          </span>
        ) : (
          round ? (
            <Avatar name={name || "?"} size={56} />
          ) : (
            <Logo name={name || "?"} size={56} />
          )
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="rounded-full border border-hair-2 px-3.5 py-2 text-[13px] font-medium transition hover:border-ink disabled:opacity-50"
          >
            {busy ? "Uploading…" : preview ? "Replace" : "Upload"}
          </button>
          {preview && (
            <button
              type="button"
              onClick={() => {
                setPreview(null);
                onChange(null);
              }}
              className="rounded-full px-3 py-2 text-[13px] text-faint hover:text-ink"
            >
              Remove
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handle(f);
            e.target.value = "";
          }}
        />
      </div>
      {err && <p className="mt-1.5 text-[12.5px] text-[#a63244]">{err}</p>}
    </div>
  );
}

/** Generic file upload (used for pitch-deck PDFs). Reports the storageId. */
export function FileUpload({
  label,
  accept = "application/pdf",
  maxMb = 15,
  hasExisting = false,
  onChange,
}: {
  label: string;
  accept?: string;
  maxMb?: number;
  hasExisting?: boolean;
  onChange: (storageId: string | null) => void;
}) {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handle(file: File) {
    setErr(null);
    if (file.size > maxMb * 1024 * 1024) return setErr(`Keep it under ${maxMb} MB.`);
    setBusy(true);
    try {
      const url = await generateUploadUrl();
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      const json = (await res.json()) as { storageId: string };
      setName(file.name);
      onChange(json.storageId);
    } catch {
      setErr("Upload failed — try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {label && <span className="mb-1.5 block text-[13px] font-medium text-ink">{label}</span>}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="rounded-full border border-hair-2 px-3.5 py-2 text-[13px] font-medium transition hover:border-ink disabled:opacity-50"
        >
          {busy ? "Uploading…" : name || hasExisting ? "Replace file" : "Upload a file"}
        </button>
        {name && <span className="text-[12.5px] text-muted">{name}</span>}
        {!name && hasExisting && (
          <span className="text-[12.5px] text-faint">A file is already uploaded.</span>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handle(f);
            e.target.value = "";
          }}
        />
      </div>
      {err && <p className="mt-1.5 text-[12.5px] text-[#a63244]">{err}</p>}
    </div>
  );
}
