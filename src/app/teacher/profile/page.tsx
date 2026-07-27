"use client";

import { useEffect, useState } from "react";
export const dynamic = "force-dynamic";
 "force-dynamic";

const SUBJECTS = ["Qaida", "Tajweed", "Nazra", "Hifz", "Masnoon Duaen", "Namaz", "6 Kalmas"];

interface TeacherProfile {
  teacherId: string;
  qualification: string | null;
  experienceYears: number | null;
  assignedSubjects: string[];
  bio: string | null;
  status: string;
  user: { fullName: string; email: string; phone: string | null; createdAt: string };
}

export default function TeacherProfilePage() {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [qualification, setQualification] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [bio, setBio] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function load() {
    const res = await fetch("/api/teacher/profile");
    const data = await res.json();
    if (res.ok) {
      setProfile(data.teacher);
      setFullName(data.teacher.user.fullName);
      setPhone(data.teacher.user.phone ?? "");
      setQualification(data.teacher.qualification ?? "");
      setExperienceYears(data.teacher.experienceYears?.toString() ?? "");
      setSubjects(data.teacher.assignedSubjects ?? []);
      setBio(data.teacher.bio ?? "");
    }
  }

  useEffect(() => {
    load();
  }, []);

  function toggleSubject(s: string) {
    setSubjects((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/teacher/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          phone,
          qualification,
          experienceYears: experienceYears ? Number(experienceYears) : undefined,
          assignedSubjects: subjects,
          bio,
          ...(newPassword ? { currentPassword, newPassword } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setStatus("success");
      setMessage("Profile updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      await load();
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message);
    }
  }

  if (!profile) return <p className="text-sm text-charcoal-soft">Loading profile…</p>;

  return (
    <div>
      <h1 className="font-display text-2xl text-emerald-900 mb-1">My Profile</h1>
      <p className="text-charcoal-soft mb-8">
        Teacher ID <span className="font-medium text-charcoal">{profile.teacherId}</span> ·{" "}
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            profile.status === "active" ? "bg-emerald-800/10 text-emerald-800" : "bg-gold/10 text-gold-dark"
          }`}
        >
          {profile.status}
        </span>
      </p>

      <form onSubmit={handleSubmit} className="rounded-xl border border-emerald-800/10 bg-white p-6 card-elevated grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">Full name</label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full rounded-lg border border-charcoal/15 px-3 py-2.5 text-sm focus-ring" />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">Email (fixed)</label>
          <input value={profile.user.email} disabled className="w-full rounded-lg border border-charcoal/15 px-3 py-2.5 text-sm bg-charcoal/5 text-charcoal-soft" />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">Phone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-lg border border-charcoal/15 px-3 py-2.5 text-sm focus-ring" />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">Years of experience</label>
          <input type="number" min={0} max={60} value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} className="w-full rounded-lg border border-charcoal/15 px-3 py-2.5 text-sm focus-ring" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-charcoal mb-1">Qualification</label>
          <input value={qualification} onChange={(e) => setQualification(e.target.value)} className="w-full rounded-lg border border-charcoal/15 px-3 py-2.5 text-sm focus-ring" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-charcoal mb-2">Subjects you teach</label>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => toggleSubject(s)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
                  subjects.includes(s) ? "bg-emerald-800 text-ivory border-emerald-800" : "bg-white text-charcoal-soft border-charcoal/15"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-charcoal mb-1">Bio</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full rounded-lg border border-charcoal/15 px-3 py-2.5 text-sm focus-ring" />
        </div>

        <div className="sm:col-span-2 border-t border-emerald-800/10 pt-4 mt-2">
          <p className="text-sm font-semibold text-charcoal mb-3">Change password (optional)</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">Current password</label>
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full rounded-lg border border-charcoal/15 px-3 py-2.5 text-sm focus-ring" />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">New password</label>
          <input type="password" minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full rounded-lg border border-charcoal/15 px-3 py-2.5 text-sm focus-ring" />
        </div>

        {message && (
          <p className={`sm:col-span-2 text-sm rounded-lg px-3 py-2 ${status === "error" ? "text-red-700 bg-red-50 border border-red-200" : "text-emerald-800 bg-emerald-800/5 border border-emerald-800/20"}`}>
            {message}
          </p>
        )}

        <div className="sm:col-span-2">
          <button type="submit" disabled={status === "loading"} className="rounded-lg bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-ivory hover:bg-emerald-700 transition-colors focus-ring disabled:opacity-60">
            {status === "loading" ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

