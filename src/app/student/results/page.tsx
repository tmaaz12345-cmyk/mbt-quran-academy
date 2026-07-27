"use client";

import { useEffect, useState } from "react";

interface Result {
  id: string;
  testTitle: string;
  marksObtained: number;
  totalMarks: number;
  feedback: string | null;
  createdAt: string;
  course: { title: string };
}

export default function StudentResultsPage() {
  const [rollNumber, setRollNumber] = useState<string>("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/student/result")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setRollNumber(data.rollNumber);
        setResults(data.results);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl text-emerald-900 mb-1">My Results</h1>
      <p className="text-charcoal-soft mb-8">
        Results are shown strictly for your own roll number
        {rollNumber && <> — <span className="font-medium text-charcoal">{rollNumber}</span></>}.
      </p>

      {loading && <p className="text-sm text-charcoal-soft">Loading results…</p>}
      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {!loading && !error && results.length === 0 && (
        <div className="rounded-xl border border-dashed border-emerald-800/20 bg-white/60 p-8 text-center text-sm text-charcoal-soft">
          No results recorded yet.
        </div>
      )}

      {results.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-emerald-800/10 bg-white card-elevated">
          <table className="w-full text-sm">
            <thead className="bg-emerald-950/5 text-charcoal-soft text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Test</th>
                <th className="px-4 py-3 font-medium">Course</th>
                <th className="px-4 py-3 font-medium">Marks</th>
                <th className="px-4 py-3 font-medium">Feedback</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.id} className="border-t border-emerald-800/5">
                  <td className="px-4 py-3 font-medium text-charcoal">{r.testTitle}</td>
                  <td className="px-4 py-3 text-charcoal-soft">{r.course.title}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-emerald-800">
                      {r.marksObtained}/{r.totalMarks}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-charcoal-soft">{r.feedback ?? "—"}</td>
                  <td className="px-4 py-3 text-charcoal-soft">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
