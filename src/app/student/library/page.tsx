"use client";

import { useEffect, useState } from "react";
export const dynamic = "force-dynamic";
 "force-dynamic";

interface Resource {
  id: string;
  title: string;
  category: string;
  fileUrl: string;
  createdAt: string;
}

export default function StudentLibraryPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/library")
      .then((res) => res.json())
      .then((data) => setResources(data.resources ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl text-emerald-900 mb-1">Digital Library</h1>
      <p className="text-charcoal-soft mb-8">Download study material shared by the academy.</p>

      {loading && <p className="text-sm text-charcoal-soft">Loading library…</p>}

      {!loading && resources.length === 0 && (
        <div className="rounded-xl border border-dashed border-emerald-800/20 bg-white/60 p-8 text-center text-sm text-charcoal-soft">
          No resources published yet.
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((r) => (
          <a
            key={r.id}
            href={r.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-emerald-800/10 bg-white p-5 card-elevated hover:-translate-y-0.5 transition-transform"
          >
            <span className="inline-block rounded-full bg-emerald-800/10 text-emerald-800 text-xs font-semibold px-3 py-1 mb-3">
              {r.category}
            </span>
            <p className="font-semibold text-charcoal">{r.title}</p>
            <p className="text-xs text-charcoal-soft mt-2">Download →</p>
          </a>
        ))}
      </div>
    </div>
  );
}

