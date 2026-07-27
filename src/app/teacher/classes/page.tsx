"use client";

import { useEffect, useState } from "react";

interface Enrollment {
  studentId: string;
  student: { user: { fullName: string } };
  course: { id: string; title: string };
}
interface ClassItem {
  id: string;
  classTitle: string;
  meetingLink: string;
  scheduledAt: string;
  status: string;
  student: { user: { fullName: string } };
  course: { title: string };
}

export default function TeacherClassesPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [classTitle, setClassTitle] = useState("");
  const [studentCourseKey, setStudentCourseKey] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [message, setMessage] = useState("");

  async function loadAll() {
    const [studRes, classRes] = await Promise.all([
      fetch("/api/teacher/students"),
      fetch("/api/teacher/classes"),
    ]);
    const studData = await studRes.json();
    const classData = await classRes.json();
    if (studRes.ok) setEnrollments(studData.enrollments);
    if (classRes.ok) setClasses(classData.classes);
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    const [studentId, courseId] = studentCourseKey.split("::");
    try {
      const res = await fetch("/api/teacher/classes/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classTitle,
          studentId,
          courseId,
          scheduledAt: new Date(scheduledAt).toISOString(),
          meetingLink: meetingLink || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setClassTitle("");
      setStudentCourseKey("");
      setScheduledAt("");
      setMeetingLink("");
      setStatus("success");
      setMessage(`Class scheduled. Link: ${data.class.meetingLink}`);
      await loadAll();
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-emerald-900 mb-1">Live Classes</h1>
      <p className="text-charcoal-soft mb-8">
        Schedule a class for a student and a video link is generated automatically.
      </p>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-emerald-800/10 bg-white p-6 card-elevated mb-10 grid sm:grid-cols-2 gap-4"
      >
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-charcoal mb-1">Class title</label>
          <input
            value={classTitle}
            onChange={(e) => setClassTitle(e.target.value)}
            required
            placeholder="e.g. Tajweed — Makharij revision"
            className="w-full rounded-lg border border-charcoal/15 px-3 py-2.5 text-sm focus-ring"
          />
        </div>
        <div>
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
          <label className="block text-sm font-medium text-charcoal mb-1">Date &amp; time</label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            required
            className="w-full rounded-lg border border-charcoal/15 px-3 py-2.5 text-sm focus-ring"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-charcoal mb-1">
            Meeting link (optional — leave blank to auto-generate)
          </label>
          <input
            value={meetingLink}
            onChange={(e) => setMeetingLink(e.target.value)}
            placeholder="https://zoom.us/j/..."
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
            {status === "loading" ? "Scheduling..." : "Schedule class"}
          </button>
        </div>
      </form>

      <h2 className="font-display text-xl text-emerald-900 mb-4">Scheduled classes</h2>
      {classes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-emerald-800/20 bg-white/60 p-8 text-center text-sm text-charcoal-soft">
          No classes scheduled yet.
        </div>
      ) : (
        <div className="space-y-3">
          {classes.map((c) => (
            <div
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-800/10 bg-white p-4 card-elevated"
            >
              <div>
                <p className="font-semibold text-charcoal">{c.classTitle}</p>
                <p className="text-sm text-charcoal-soft">
                  {c.course.title} · {c.student.user.fullName} · {new Date(c.scheduledAt).toLocaleString()}
                </p>
              </div>
              <a
                href={c.meetingLink}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-emerald-800/20 px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-800/5 transition-colors focus-ring"
              >
                Copy / open link
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
