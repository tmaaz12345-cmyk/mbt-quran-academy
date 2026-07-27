"use client";

import { useEffect, useState } from "react";

interface Assignment {
  id: string;
  title: string;
  fileUrl: string | null;
  submissionText: string | null;
  status: "submitted" | "reviewed";
  teacherFeedback: string | null;
  createdAt: string;
}

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [title, setTitle] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [submissionText, setSubmissionText] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  async function loadAssignments() {
    const res = await fetch("/api/student/assignments");
    const data = await res.json();
    if (res.ok) setAssignments(data.assignments);
  }

  useEffect(() => {
    loadAssignments();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/student/assignment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, fileUrl: fileUrl || undefined, submissionText: submissionText || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTitle("");
      setFileUrl("");
      setSubmissionText("");
      await loadAssignments();
      setStatus("idle");
    } catch (err: any) {
      setError(err.message);
      setStatus("error");
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-emerald-900 mb-1">Assignments</h1>
      <p className="text-charcoal-soft mb-8">Upload your homework for your teacher to review.</p>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-emerald-800/10 bg-white p-6 card-elevated mb-10 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">Assignment title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. Surah Al-Fatiha recitation recording"
            className="w-full rounded-lg border border-charcoal/15 px-3 py-2.5 text-sm focus-ring"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">File / recording link (optional)</label>
          <input
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-lg border border-charcoal/15 px-3 py-2.5 text-sm focus-ring"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">Written response (optional)</label>
          <textarea
            value={submissionText}
            onChange={(e) => setSubmissionText(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-charcoal/15 px-3 py-2.5 text-sm focus-ring"
          />
        </div>
        {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-lg bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-ivory hover:bg-emerald-700 transition-colors focus-ring disabled:opacity-60"
        >
          {status === "loading" ? "Submitting..." : "Submit assignment"}
        </button>
      </form>

      <h2 className="font-display text-xl text-emerald-900 mb-4">Your submissions</h2>
      {assignments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-emerald-800/20 bg-white/60 p-8 text-center text-sm text-charcoal-soft">
          No assignments submitted yet.
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => (
            <div key={a.id} className="rounded-xl border border-emerald-800/10 bg-white p-4 card-elevated">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-charcoal">{a.title}</p>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    a.status === "reviewed"
                      ? "bg-emerald-800/10 text-emerald-800"
                      : "bg-gold/10 text-gold-dark"
                  }`}
                >
                  {a.status}
                </span>
              </div>
              {a.submissionText && <p className="text-sm text-charcoal-soft mt-2">{a.submissionText}</p>}
              {a.fileUrl && (
                <a href={a.fileUrl} target="_blank" rel="noreferrer" className="text-sm text-emerald-700 underline mt-1 inline-block">
                  View submitted file
                </a>
              )}
              {a.teacherFeedback && (
                <p className="text-sm mt-2 bg-emerald-950/5 rounded-lg px-3 py-2 text-charcoal-soft">
                  <span className="font-medium text-emerald-800">Teacher feedback: </span>
                  {a.teacherFeedback}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
