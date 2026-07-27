"use client";

import { useState } from "react";
import { RegistrationForm } from "./RegistrationForm";
import { TeacherRegistrationForm } from "./TeacherRegistrationForm";

export function AdmissionsTabs() {
  const [tab, setTab] = useState<"student" | "teacher">("student");

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setTab("student")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            tab === "student" ? "bg-emerald-800 text-ivory" : "bg-emerald-950/5 text-charcoal-soft"
          }`}
        >
          Join as a Student
        </button>
        <button
          type="button"
          onClick={() => setTab("teacher")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            tab === "teacher" ? "bg-emerald-800 text-ivory" : "bg-emerald-950/5 text-charcoal-soft"
          }`}
        >
          Apply as a Teacher
        </button>
      </div>
      {tab === "student" ? <RegistrationForm /> : <TeacherRegistrationForm />}
    </div>
  );
}
