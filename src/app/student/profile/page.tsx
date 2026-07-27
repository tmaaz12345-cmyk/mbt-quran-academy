"use client";

import { useEffect, useState } from "react";
export const dynamic = "force-dynamic";
 "force-dynamic";

interface StudentProfile {
  studentId: string;
  rollNumber: string | null;
  guardianName: string | null;
  age: number | null;
  country: string | null;
  status: string;
  user: { fullName: string; email: string; phone: string | null; createdAt: string };
  enrollments: { course: { title: string }; teacher: { user: { fullName: string } } | null }[];
}

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [age, setAge] = useState("");
  const [country, setCountry] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function load() {
    const res = await fetch("/api/student/profile");
    const data = await res.json();
    if (res.ok) {
      setProfile(data.student);
      setFullName(data.student.user.fullName);
      setPhone(data.student.user.phone ?? "");
      setGuardianName(data.student.guardianName ?? "");
      setAge(data.student.age?.toString() ?? "");
      setCountry(data.student.country ?? "");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/student/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          phone,
          guardianName,
          age: age ? Number(age) : undefined,
          country,
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
        Student ID <span className="font-medium text-charcoal">{profile.studentId}</span>
        {profile.rollNumber && <> · Roll: <span className="font-medium text-charcoal">{profile.rollNumber}</span></>}
      </p>

      {profile.enrollments.length > 0 && (
        <div className="rounded-xl border border-emerald-800/10 bg-white p-5 card-elevated mb-6">
          <p className="text-sm font-semibold text-charcoal mb-2">My enrollments</p>
          <ul className="text-sm text-charcoal-soft space-y-1">
            {profile.enrollments.map((e, i) => (
              <li key={i}>
                {e.course.title} {e.teacher && <>— taught by {e.teacher.user.fullName}</>}
              </li>
            ))}
          </ul>
        </div>
      )}

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
          <label className="block text-sm font-medium text-charcoal mb-1">Guardian name</label>
          <input value={guardianName} onChange={(e) => setGuardianName(e.target.value)} className="w-full rounded-lg border border-charcoal/15 px-3 py-2.5 text-sm focus-ring" />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">Age</label>
          <input type="number" min={3} max={100} value={age} onChange={(e) => setAge(e.target.value)} className="w-full rounded-lg border border-charcoal/15 px-3 py-2.5 text-sm focus-ring" />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">Country</label>
          <input value={country} onChange={(e) => setCountry(e.target.value)} className="w-full rounded-lg border border-charcoal/15 px-3 py-2.5 text-sm focus-ring" />
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

