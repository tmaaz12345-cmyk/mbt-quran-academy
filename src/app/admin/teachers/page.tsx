"use client";

import { useEffect, useState } from "react";

interface Teacher {
  teacherId: string;
  qualification: string | null;
  experienceYears?: number | null;
  bio?: string | null;
  assignedSubjects: string[];
  status: "pending" | "active" | "suspended";
  user: { fullName: string; email: string; phone: string | null };
}

const SUBJECTS = ["Qaida", "Tajweed", "Nazra", "Hifz", "Masnoon Duaen", "Namaz", "6 Kalmas"];

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [qualification, setQualification] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "active">("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    const res = await fetch(`/api/admin/teachers${filter !== "all" ? `?status=${filter}` : ""}`);
    const data = await res.json();
    if (res.ok) setTeachers(data.teachers);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function approve(teacherId: string) {
    setBusyId(teacherId);
    await fetch("/api/admin/approve-teacher", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pendingTeacherId: teacherId }),
    });
    await load();
    setBusyId(null);
  }

  async function remove(teacherId: string) {
    if (!confirm(`Remove/reject teacher ${teacherId}? This cannot be undone.`)) return;
    setBusyId(teacherId);
    await fetch(`/api/admin/teachers?teacherId=${encodeURIComponent(teacherId)}`, { method: "DELETE" });
    await load();
    setBusyId(null);
  }

  function toggleSubject(s: string) {
    setSubjects((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/admin/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone, password, qualification, assignedSubjects: subjects }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setFullName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setQualification("");
      setSubjects([]);
      setStatus("idle");
      await load();
    } catch (err: any) {
      setError(err.message);
      setStatus("error");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-1">
        <h1 className="font-display text-2xl text-emerald-900">Teachers</h1>
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
      <p className="text-charcoal-soft mb-8">
        Approve teachers who applied on the public site, or onboard one directly below.
      </p>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-emerald-800/10 bg-white p-6 card-elevated mb-10 grid sm:grid-cols-2 gap-4"
      >
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">Full name</label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} required className="w-full rounded-lg border border-charcoal/15 px-3 py-2.5 text-sm focus-ring" />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full rounded-lg border border-charcoal/15 px-3 py-2.5 text-sm focus-ring" />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">Phone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-lg border border-charcoal/15 px-3 py-2.5 text-sm focus-ring" />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">Temporary password</label>
          <input type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full rounded-lg border border-charcoal/15 px-3 py-2.5 text-sm focus-ring" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-charcoal mb-1">Qualification</label>
          <input value={qualification} onChange={(e) => setQualification(e.target.value)} placeholder="e.g. Ijazah in Qira'at" className="w-full rounded-lg border border-charcoal/15 px-3 py-2.5 text-sm focus-ring" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-charcoal mb-2">Assigned subjects</label>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => toggleSubject(s)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
                  subjects.includes(s)
                    ? "bg-emerald-800 text-ivory border-emerald-800"
                    : "bg-white text-charcoal-soft border-charcoal/15"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="sm:col-span-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-lg bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-ivory hover:bg-emerald-700 transition-colors focus-ring disabled:opacity-60"
          >
            {status === "loading" ? "Creating..." : "Create teacher account"}
          </button>
        </div>
      </form>

      <h2 className="font-display text-xl text-emerald-900 mb-4">All teachers</h2>
      {teachers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-emerald-800/20 bg-white/60 p-8 text-center text-sm text-charcoal-soft">
          No teachers found.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {teachers.map((t) => (
            <div key={t.teacherId} className="rounded-xl border border-emerald-800/10 bg-white p-5 card-elevated">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-charcoal">
                    {t.user.fullName}{" "}
                    <span
                      className={`ml-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        t.status === "pending"
                          ? "bg-gold/10 text-gold-dark"
                          : t.status === "active"
                          ? "bg-emerald-800/10 text-emerald-800"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {t.status}
                    </span>
                  </p>
                  <p className="text-sm text-charcoal-soft">{t.user.email}</p>
                  <p className="text-xs text-charcoal-soft mt-1">
                    ID: {t.teacherId}
                    {t.experienceYears != null && <> · {t.experienceYears} yrs experience</>}
                  </p>
                  {t.qualification && <p className="text-xs text-charcoal-soft mt-1">{t.qualification}</p>}
                  {t.assignedSubjects.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {t.assignedSubjects.map((s) => (
                        <span key={s} className="text-xs bg-emerald-800/10 text-emerald-800 rounded-full px-2.5 py-1">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {t.status === "pending" && (
                    <button
                      onClick={() => approve(t.teacherId)}
                      disabled={busyId === t.teacherId}
                      className="rounded-lg bg-emerald-800 px-3 py-1.5 text-xs font-semibold text-ivory hover:bg-emerald-700 transition-colors focus-ring disabled:opacity-60 whitespace-nowrap"
                    >
                      {busyId === t.teacherId ? "Approving..." : "Approve & issue ID"}
                    </button>
                  )}
                  <button
                    onClick={() => remove(t.teacherId)}
                    disabled={busyId === t.teacherId}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 transition-colors focus-ring disabled:opacity-60 whitespace-nowrap"
                  >
                    {t.status === "pending" ? "Reject" : "Remove"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
