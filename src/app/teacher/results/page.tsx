"use client";

import { useEffect, useState } from "react";
export const dynamic = "force-dynamic";
 "force-dynamic";

interface Enrollment {
  studentId: string;
  student: { user: { fullName: string } };
  course: { id: string; title: string };
}

export default function TeacherResultsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [testTitle, setTestTitle] = useState("");
  const [studentCourseKey, setStudentCourseKey] = useState("");
  const [marksObtained, setMarksObtained] = useState("");
  const [totalMarks, setTotalMarks] = useState("");
  const [feedback, setFeedback] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/teacher/students")
      .then((res) => res.json())
      .then((data) => setEnrollments(data.enrollments ?? []));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    const [studentId, courseId] = studentCourseKey.split("::");
    try {
      const res = await fetch("/api/teacher/results/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testTitle,
          studentId,
          courseId,
          marksObtained: Number(marksObtained),
          totalMarks: Number(totalMarks),
          feedback: feedback || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTestTitle("");
      setStudentCourseKey("");
      setMarksObtained("");
      setTotalMarks("");
      setFeedback("");
      setStatus("success");
      setMessage(`Result recorded for roll number ${data.result.rollNumber}.`);
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-emerald-900 mb-1">Test Results</h1>
      <p className="text-charcoal-soft mb-8">
        Marks are automatically linked to the student&apos;s official roll number.
      </p>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-emerald-800/10 bg-white p-6 card-elevated grid sm:grid-cols-2 gap-4 max-w-2xl"
      >
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-charcoal mb-1">Test title</label>
          <input
            value={testTitle}
            onChange={(e) => setTestTitle(e.target.value)}
            required
            placeholder="e.g. Monthly Tajweed Assessment — July"
            className="w-full rounded-lg border border-charcoal/15 px-3 py-2.5 text-sm focus-ring"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-charcoal mb-1">Student &amp; course</label>
          <select
            value={studentCourseKey}
            onChange={(e) => setStudentCourseKey(e.target.value)}
            required
            className="w-full rounded-lg border border-charcoal/15 bg-white px-3 py-2.5 text-sm focus-ring"
          >
            <option value="">Select student...</option>
            {enrollments.map((e) => (
              <option key={`${e.studentId}::${e.course.id}`} value={`${e.studentId}::${e.course.id}`}>
                {e.student.user.fullName} ({e.studentId}) — {e.course.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">Marks obtained</label>
          <input
            type="number"
            min={0}
            value={marksObtained}
            onChange={(e) => setMarksObtained(e.target.value)}
            required
            className="w-full rounded-lg border border-charcoal/15 px-3 py-2.5 text-sm focus-ring"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">Total marks</label>
          <input
            type="number"
            min={1}
            value={totalMarks}
            onChange={(e) => setTotalMarks(e.target.value)}
            required
            className="w-full rounded-lg border border-charcoal/15 px-3 py-2.5 text-sm focus-ring"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-charcoal mb-1">Feedback (optional)</label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-charcoal/15 px-3 py-2.5 text-sm focus-ring"
          />
        </div>

        {message && (
          <p
            className={`sm:col-span-2 text-sm rounded-lg px-3 py-2 border ${
              status === "error"
                ? "text-red-700 bg-red-50 border-red-200"
                : "text-emerald-800 bg-emerald-950/5 border-emerald-800/10"
            }`}
          >
            {message}
          </p>
        )}

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-lg bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-ivory hover:bg-emerald-700 transition-colors focus-ring disabled:opacity-60"
          >
            {status === "loading" ? "Saving..." : "Save result"}
          </button>
        </div>
      </form>
    </div>
  );
}

