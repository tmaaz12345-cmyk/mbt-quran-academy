"use client";

import { useState } from "react";

const SUBJECTS = ["Qaida", "Tajweed", "Nazra", "Hifz", "Masnoon Duaen", "Namaz", "6 Kalmas"];

export function TeacherRegistrationForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);

  function toggleSubject(s: string) {
    setSubjects((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = new FormData(e.currentTarget);
    const body = {
      fullName: form.get("fullName"),
      email: form.get("email"),
      phone: form.get("phone"),
      password: form.get("password"),
      qualification: form.get("qualification"),
      experienceYears: form.get("experienceYears") ? Number(form.get("experienceYears")) : undefined,
      bio: form.get("bio"),
      assignedSubjects: subjects,
    };

    try {
      const res = await fetch("/api/auth/register-teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      setStatus("success");
      setMessage(
        `Application received. It is pending admin approval. You'll receive an official Teacher ID (e.g. MBT-T-101) once approved — you can then log in with your email.`
      );
      (e.target as HTMLFormElement).reset();
      setSubjects([]);
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message ?? "Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl border border-emerald-700/30 bg-emerald-950/5 p-6 text-center">
        <p className="text-emerald-800 font-semibold mb-1">Application submitted</p>
        <p className="text-charcoal-soft text-sm">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <Field label="Full name" name="fullName" required />
      <Field label="Email" name="email" type="email" required />
      <Field label="Phone / WhatsApp" name="phone" />
      <Field label="Years of teaching experience" name="experienceYears" type="number" min={0} max={60} />
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-charcoal mb-1">Qualification</label>
        <input
          name="qualification"
          placeholder="e.g. Ijazah in Qira'at, Aalim course, Hifz certificate"
          className="w-full rounded-lg border border-charcoal/15 bg-white px-3 py-2.5 text-sm focus-ring"
        />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-charcoal mb-2">Subjects you can teach</label>
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
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-charcoal mb-1">Short bio (optional)</label>
        <textarea
          name="bio"
          rows={3}
          placeholder="Tell us about your teaching background..."
          className="w-full rounded-lg border border-charcoal/15 bg-white px-3 py-2.5 text-sm focus-ring"
        />
      </div>
      <Field label="Choose a password" name="password" type="password" required minLength={8} />

      {status === "error" && (
        <p className="sm:col-span-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {message}
        </p>
      )}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full sm:w-auto rounded-lg bg-emerald-800 px-6 py-3 text-ivory font-semibold tracking-wide hover:bg-emerald-700 transition-colors focus-ring disabled:opacity-60"
        >
          {status === "loading" ? "Submitting..." : "Apply to teach"}
        </button>
        <p className="mt-2 text-xs text-charcoal-soft">
          An administrator reviews every teacher application and issues your official Teacher ID.
        </p>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  min,
  max,
  minLength,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-charcoal mb-1">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        min={min}
        max={max}
        minLength={minLength}
        className="w-full rounded-lg border border-charcoal/15 bg-white px-3 py-2.5 text-sm focus-ring"
      />
    </div>
  );
}
