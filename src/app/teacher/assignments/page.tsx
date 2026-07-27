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
  student: { user: { fullName: string } };
}

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [feedbackDrafts, setFeedbackDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/teacher/assignments");
    const data = await res.json();
    if (res.ok) setAssignments(data.assignments);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleReview(id: string) {
    const teacherFeedback = feedbackDrafts[id]?.trim();
    if (!teacherFeedback) return;
    setSavingId(id);
    try {
      const res = await fetch("/api/teacher/assignments/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId: id, teacherFeedback }),
      });
      if (res.ok) await load();
    } finally {
      setSavingId(null);
    }
  }

  const pending = assignments.filter((a) => a.status === "submitted");
  const reviewed = assignments.filter((a) => a.status === "reviewed");

  return (
    <div>
      <h1 className="font-display text-2xl text-emerald-900 mb-1">Assignments</h1>
      <p className="text-charcoal-soft mb-8">Review homework submitted by your students.</p>

      <h2 className="font-display text-xl text-emerald-900 mb-4">Pending review ({pending.length})</h2>
      {pending.length === 0 ? (
        <div className="rounded-xl border border-dashed border-emerald-800/20 bg-white/60 p-8 text-center text-sm text-charcoal-soft mb-10">
          Nothing to review — all caught up.
        </div>
      ) : (
        <div className="space-y-4 mb-10">
          {pending.map((a) => (
            <div key={a.id} className="rounded-xl border border-emerald-800/10 bg-white p-5 card-elevated">
              <p className="font-semibold text-charcoal">{a.title}</p>
              <p className="text-sm text-charcoal-soft mb-2">
                {a.student.user.fullName} · {new Date(a.createdAt).toLocaleDateString()}
              </p>
              {a.submissionText && <p className="text-sm text-charcoal-soft mb-2">{a.submissionText}</p>}
              {a.fileUrl && (
                <a href={a.fileUrl} target="_blank" rel="noreferrer" className="text-sm text-emerald-700 underline mb-3 inline-block">
                  View submitted file
                </a>
              )}
              <div className="flex gap-2 mt-2">
                <input
                  placeholder="Write feedback..."
                  value={feedbackDrafts[a.id] ?? ""}
                  onChange={(e) => setFeedbackDrafts({ ...feedbackDrafts, [a.id]: e.target.value })}
                  className="flex-1 rounded-lg border border-charcoal/15 px-3 py-2 text-sm focus-ring"
                />
                <button
                  onClick={() => handleReview(a.id)}
                  disabled={savingId === a.id}
                  className="rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-ivory hover:bg-emerald-700 transition-colors focus-ring disabled:opacity-60"
                >
                  {savingId === a.id ? "Saving..." : "Mark reviewed"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="font-display text-xl text-emerald-900 mb-4">Reviewed ({reviewed.length})</h2>
      {reviewed.length === 0 ? (
        <p className="text-sm text-charcoal-soft">No reviewed assignments yet.</p>
      ) : (
        <div className="space-y-3">
          {reviewed.map((a) => (
            <div key={a.id} className="rounded-xl border border-emerald-800/10 bg-white p-4 card-elevated">
              <p className="font-semibold text-charcoal">{a.title}</p>
              <p className="text-sm text-charcoal-soft">{a.student.user.fullName}</p>
              <p className="text-sm mt-2 bg-emerald-950/5 rounded-lg px-3 py-2 text-charcoal-soft">
                {a.teacherFeedback}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
