"use client";

import { useState } from "react";

const COURSES = [
  "Noorani Qaida",
  "Tajweed Mastery",
  "Nazra Quran",
  "Hifz-ul-Quran",
  "Masnoon Duaen",
  "Namaz (Salah) Training",
  "6 Kalmas",
];

export function RegistrationForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = new FormData(e.currentTarget);
    const body = {
      fullName: form.get("fullName"),
      email: form.get("email"),
      phone: form.get("phone"),
      password: form.get("password"),
      guardianName: form.get("guardianName"),
      age: form.get("age") ? Number(form.get("age")) : undefined,
      country: form.get("country"),
      interestedCourse: form.get("interestedCourse"),
    };

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      setStatus("success");
      setMessage(
        `Registration received. Your application is pending admin approval. You'll receive a Student ID (e.g. MBT-1001) once approved.`
      );
      (e.target as HTMLFormElement).reset();
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
      <Field label="Student full name" name="fullName" required />
      <Field label="Guardian name" name="guardianName" />
      <Field label="Email" name="email" type="email" required />
      <Field label="Phone / WhatsApp" name="phone" />
      <Field label="Age" name="age" type="number" min={4} max={80} />
      <Field label="Country" name="country" />
      <div className="sm:col-span-1">
        <label className="block text-sm font-medium text-charcoal mb-1">Course of interest</label>
        <select
          name="interestedCourse"
          className="w-full rounded-lg border border-charcoal/15 bg-white px-3 py-2.5 text-sm focus-ring"
          required
        >
          {COURSES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
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
          {status === "loading" ? "Submitting..." : "Register interest"}
        </button>
        <p className="mt-2 text-xs text-charcoal-soft">
          An administrator reviews every application and issues your official Student ID.
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
