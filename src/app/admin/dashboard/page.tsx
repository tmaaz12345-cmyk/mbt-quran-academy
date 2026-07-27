"use client";

import { useEffect, useState } from "react";
export const dynamic = "force-dynamic";
 "force-dynamic";

interface StudentRow {
  studentId: string;
  guardianName: string | null;
  age: number | null;
  country: string | null;
  rollNumber: string | null;
  status: "pending" | "active" | "suspended";
  user: { fullName: string; email: string; phone: string | null };
  enrollments: { course: { id: string; title: string }; teacher: { teacherId: string } | null }[];
}
interface Teacher {
  teacherId: string;
  user: { fullName: string };
}
interface Course {
  id: string;
  title: string;
}

export default function AdminDashboardPage() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "active">("all");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [assignDraft, setAssignDraft] = useState<Record<string, { courseId: string; teacherId: string }>>({});

  async function loadAll() {
    setLoading(true);
    const [studRes, teachRes, courseRes] = await Promise.all([
      fetch(`/api/admin/students${filter !== "all" ? `?status=${filter}` : ""}`),
      fetch("/api/admin/teachers"),
      fetch("/api/courses"),
    ]);
    const studData = await studRes.json();
    const teachData = await teachRes.json();
    const courseData = await courseRes.json();
    setStudents(studData.students ?? []);
    setTeachers(teachData.teachers ?? []);
    setCourses(courseData.courses ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function approve(studentId: string) {
    setBusyId(studentId);
    await fetch("/api/admin/approve-student", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pendingStudentId: studentId }),
    });
    await loadAll();
    setBusyId(null);
  }

  async function remove(studentId: string) {
    if (!confirm(`Remove student ${studentId}? This cannot be undone.`)) return;
    setBusyId(studentId);
    await fetch(`/api/admin/students?studentId=${encodeURIComponent(studentId)}`, { method: "DELETE" });
    await loadAll();
    setBusyId(null);
  }

  async function assignTeacher(studentId: string) {
    const draft = assignDraft[studentId];
    if (!draft?.courseId || !draft?.teacherId) return;
    setBusyId(studentId);
    await fetch("/api/admin/enrollments/assign-teacher", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, courseId: draft.courseId, teacherId: draft.teacherId }),
    });
    await loadAll();
    setBusyId(null);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl text-emerald-900 mb-1">Students</h1>
          <p className="text-charcoal-soft">Approve registrations, issue IDs, and assign teachers.</p>
        </div>
        <div className="flex gap-2">
          {(["all", "pending", "active"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                filter === f ? "bg-emerald-800 text-ivory" : "bg-white border border-emerald-800/15 text-charcoal-soft"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-charcoal-soft">Loading students…</p>
      ) : students.length === 0 ? (
        <div className="rounded-xl border border-dashed border-emerald-800/20 bg-white/60 p-8 text-center text-sm text-charcoal-soft">
          No students found.
        </div>
      ) : (
        <div className="space-y-4">
          {students.map((s) => (
            <div key={s.studentId} className="rounded-xl border border-emerald-800/10 bg-white p-5 card-elevated">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-charcoal">
                    {s.user.fullName}{" "}
                    <span
                      className={`ml-2 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        s.status === "pending"
                          ? "bg-gold/10 text-gold-dark"
                          : s.status === "active"
                          ? "bg-emerald-800/10 text-emerald-800"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {s.status}
                    </span>
                  </p>
                  <p className="text-sm text-charcoal-soft">
                    {s.user.email} {s.user.phone && `· ${s.user.phone}`}
                  </p>
                  <p className="text-sm text-charcoal-soft mt-1">
                    ID: <span className="font-medium text-charcoal">{s.studentId}</span>
                    {s.rollNumber && (
                      <>
                        {" "}
                        · Roll: <span className="font-medium text-charcoal">{s.rollNumber}</span>
                      </>
                    )}
                    {s.guardianName && <> · Guardian: {s.guardianName}</>}
                    {s.age && <> · Age: {s.age}</>}
                    {s.country && <> · {s.country}</>}
                  </p>
                  {s.enrollments.length > 0 && (
                    <p className="text-xs text-charcoal-soft mt-1">
                      Enrolled: {s.enrollments.map((e) => `${e.course.title}${e.teacher ? ` (${e.teacher.teacherId})` : ""}`).join(", ")}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2">
                  {s.status === "pending" && (
                    <button
                      onClick={() => approve(s.studentId)}
                      disabled={busyId === s.studentId}
                      className="rounded-lg bg-emerald-800 px-4 py-2 text-xs font-semibold text-ivory hover:bg-emerald-700 transition-colors focus-ring disabled:opacity-60"
                    >
                      {busyId === s.studentId ? "Approving..." : "Approve & issue ID"}
                    </button>
                  )}
                  <button
                    onClick={() => remove(s.studentId)}
                    disabled={busyId === s.studentId}
                    className="rounded-lg border border-red-200 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 transition-colors focus-ring disabled:opacity-60"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {s.status === "active" && (
                <div className="mt-4 pt-4 border-t border-emerald-800/10 flex flex-wrap items-center gap-2">
                  <select
                    className="rounded-lg border border-charcoal/15 px-2.5 py-1.5 text-xs focus-ring"
                    value={assignDraft[s.studentId]?.courseId ?? ""}
                    onChange={(e) =>
                      setAssignDraft({
                        ...assignDraft,
                        [s.studentId]: { ...assignDraft[s.studentId], courseId: e.target.value, teacherId: assignDraft[s.studentId]?.teacherId ?? "" },
                      })
                    }
                  >
                    <option value="">Select course...</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                  <select
                    className="rounded-lg border border-charcoal/15 px-2.5 py-1.5 text-xs focus-ring"
                    value={assignDraft[s.studentId]?.teacherId ?? ""}
                    onChange={(e) =>
                      setAssignDraft({
                        ...assignDraft,
                        [s.studentId]: { ...assignDraft[s.studentId], teacherId: e.target.value, courseId: assignDraft[s.studentId]?.courseId ?? "" },
                      })
                    }
                  >
                    <option value="">Select teacher...</option>
                    {teachers.map((t) => (
                      <option key={t.teacherId} value={t.teacherId}>{t.user.fullName} ({t.teacherId})</option>
                    ))}
                  </select>
                  <button
                    onClick={() => assignTeacher(s.studentId)}
                    disabled={busyId === s.studentId}
                    className="rounded-lg bg-gold px-3 py-1.5 text-xs font-semibold text-emerald-950 hover:bg-gold-light transition-colors focus-ring disabled:opacity-60"
                  >
                    Assign
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

