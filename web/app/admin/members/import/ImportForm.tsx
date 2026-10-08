"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { ImportAnalysis, ImportResult, RowAction } from "@/lib/members/import";

const card = "flex flex-col gap-4 rounded-2xl border border-border-default bg-white p-5 sm:p-6";
const ACTION_LABEL: Record<RowAction, string> = { create: "New", update: "Update", unchanged: "No change", error: "Skipped" };
const ACTION_CLASS: Record<RowAction, string> = {
  create: "bg-brand-green-tint text-brand-green",
  update: "bg-accent-amber-tint text-accent-amber-text",
  unchanged: "bg-bg-admin text-text-secondary",
  error: "bg-red-50 text-red-700",
};

export function ImportForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [analysis, setAnalysis] = useState<ImportAnalysis>();
  const [result, setResult] = useState<ImportResult>();
  const [filter, setFilter] = useState<RowAction | "all">("all");

  async function send(intent: "preview" | "apply") {
    const form = formRef.current;
    if (!form) return;
    const data = new FormData(form);
    data.set("intent", intent);
    setBusy(true);
    setError(undefined);
    try {
      const res = await fetch("/api/admin/members/import", { method: "POST", body: data });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "The request failed.");
      if (intent === "preview") {
        setAnalysis(json.analysis);
        setResult(undefined);
        setFilter("all");
      } else {
        setResult(json.result);
        setAnalysis(undefined);
        form.reset();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "The request failed.");
    } finally {
      setBusy(false);
    }
  }

  const importable = analysis ? analysis.counts.create + analysis.counts.update : 0;
  const rows = analysis?.rows.filter((r) => filter === "all" || r.action === filter) ?? [];

  return (
    <div className="flex max-w-[960px] flex-col gap-6">
      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          void send("preview");
        }}
        className={card}
      >
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          CSV file
          <input
            name="file"
            type="file"
            accept=".csv,text/csv"
            required
            onChange={() => {
              setAnalysis(undefined);
              setResult(undefined);
              setError(undefined);
            }}
            className="rounded-lg border border-border-input p-2 text-sm font-normal"
          />
          <span className="text-xs font-normal text-text-secondary">Up to 1 MB and 2,000 rows. The first row must be a header.</span>
        </label>

        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" name="updateExisting" defaultChecked className="mt-0.5 accent-brand-green" />
          <span>
            <span className="font-semibold">Update members who already exist</span> (matched by email). Only cells that have a value
            are used — a blank cell never erases what&apos;s already saved.
          </span>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-semibold sm:max-w-[320px]">
          Status for new members
          <select name="newStatus" defaultValue="active" className="h-11 rounded-lg border border-border-input bg-white px-3 font-normal">
            <option value="active">Active (visible in the directory)</option>
            <option value="pending">Pending (approve later)</option>
          </select>
        </label>

        <button
          type="submit"
          disabled={busy}
          className="h-11 self-start rounded-full bg-brand-green px-5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy && !analysis ? "Checking…" : "Preview import"}
        </button>
      </form>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      {result && (
        <div role="status" className="flex flex-col gap-1 rounded-xl bg-brand-green-tint px-4 py-3 text-sm text-brand-green">
          <p className="font-semibold">
            Import complete: {result.created} added, {result.updated} updated.
          </p>
          <p>
            {result.unchanged} already up to date, {result.skipped} skipped.{" "}
            <Link href="/admin/members" className="font-semibold underline">
              View members
            </Link>
          </p>
        </div>
      )}

      {analysis?.fatal && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {analysis.fatal}
        </p>
      )}

      {analysis && !analysis.fatal && (
        <section className={card}>
          <h2 className="font-serif text-xl font-medium">Preview</h2>

          <div className="flex flex-wrap gap-2 text-sm">
            {(["all", "create", "update", "unchanged", "error"] as const).map((k) => {
              const n = k === "all" ? analysis.rows.length : analysis.counts[k];
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setFilter(k)}
                  aria-pressed={filter === k}
                  className={`h-9 rounded-full px-3.5 font-semibold ${filter === k ? "bg-text-primary text-bg-public" : "border border-border-input bg-white"}`}
                >
                  {k === "all" ? "All" : ACTION_LABEL[k]} · {n}
                </button>
              );
            })}
          </div>

          <p className="text-xs text-text-secondary">
            Columns used: {analysis.columns.recognized.join(", ")}.
            {analysis.columns.ignored.length > 0 && <> Ignored (never imported): {analysis.columns.ignored.join(", ")}.</>}
            {analysis.columns.unknown.length > 0 && <> Not recognized: {analysis.columns.unknown.join(", ")}.</>}
          </p>

          <div className="max-h-[480px] overflow-auto rounded-xl border border-border-default">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-bg-admin text-xs text-text-secondary">
                <tr>
                  <th className="px-3 py-2">Line</th>
                  <th className="px-3 py-2">Member</th>
                  <th className="px-3 py-2">Result</th>
                  <th className="px-3 py-2">Details</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.line} className="border-t border-[#EFEAE0] align-top">
                    <td className="px-3 py-2 text-text-secondary">{r.line}</td>
                    <td className="px-3 py-2">
                      <div className="font-semibold">{r.name || "—"}</div>
                      <div className="text-xs text-text-secondary">{r.email || "—"}</div>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${ACTION_CLASS[r.action]}`}>{ACTION_LABEL[r.action]}</span>
                    </td>
                    <td className="px-3 py-2 text-text-secondary">
                      {r.error ?? (r.action === "update" ? `Will change: ${r.changes?.join(", ")}` : r.action === "unchanged" ? "Already up to date, or not updating existing members." : "")}
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-text-secondary">
                      No rows in this group.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={busy || importable === 0}
              onClick={() => void send("apply")}
              className="h-11 rounded-full bg-brand-green px-5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {busy ? "Importing…" : `Import ${analysis.counts.create} new, update ${analysis.counts.update}`}
            </button>
            {analysis.counts.error > 0 && (
              <span className="text-sm text-text-secondary">
                {analysis.counts.error} row{analysis.counts.error === 1 ? "" : "s"} with problems will be skipped. Fix them in the file and import again if needed.
              </span>
            )}
            {importable === 0 && <span className="text-sm text-text-secondary">Nothing to import.</span>}
          </div>
        </section>
      )}

      <section className={card}>
        <h2 className="font-serif text-xl font-medium">File format</h2>
        <p className="text-sm text-text-secondary">
          For someone new, <strong>Email</strong> and <strong>Roll</strong> (or Student ID) are all you need. Their discipline is read from the roll,
          they sign in with that email and confirm their own name, and they stay out of the public directory until they do. Add a <strong>Name</strong>
          column and that row is treated as already confirmed: the person is listed straight away, like the original roster.
        </p>
        <p className="text-sm text-text-secondary">
          Optional columns: Name, Phone, Discipline (department code such as CSE, or full name), Campus name, Profession, Current employer, City, Country, Blood group,
          Date of birth (YYYY-MM-DD or DD/MM/YYYY), Public profile (Yes/No), LinkedIn, Facebook, Website. Column names are not case-sensitive. A file exported with
          <em> Export CSV</em> can be edited and imported back; its Role, Status and Joined columns are ignored — access level is never set from a spreadsheet,
          and new members are always regular members.
        </p>
        <a href="data:text/csv;charset=utf-8,Email%2CRoll%0Ajane%40example.com%2C110299%0A" download="members-template.csv" className="self-start text-sm font-semibold text-brand-green">
          Download a template
        </a>
      </section>
    </div>
  );
}
