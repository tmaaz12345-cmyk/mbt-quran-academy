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

export default function AdminLibraryPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/admin/library");
    const data = await res.json();
    if (res.ok) setResources(data.resources);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/admin/library/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, fileUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTitle("");
      setCategory("");
      setFileUrl("");
      setStatus("idle");
      await load();
    } catch (err: any) {
      setError(err.message);
      setStatus("error");
    }
  }

  async function remove(id: string) {
    if (!confirm("Remove this resource?")) return;
    await fetch(`/api/admin/library?id=${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-emerald-900 mb-1">Digital Library</h1>
      <p className="text-charcoal-soft mb-8">
        Publish PDF and audio study material. Upload the file to your storage provider first
        (e.g. Supabase Storage) and paste the resulting link below.
      </p>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-emerald-800/10 bg-white p-6 card-elevated mb-10 grid sm:grid-cols-2 gap-4"
      >
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full rounded-lg border border-charcoal/15 px-3 py-2.5 text-sm focus-ring" />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal mb-1">Category</label>
          <input value={category} onChange={(e) => setCategory(e.target.value)} required placeholder="e.g. Tajweed, Qaida Audio" className="w-full rounded-lg border border-charcoal/15 px-3 py-2.5 text-sm focus-ring" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-charcoal mb-1">File URL</label>
          <input value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} required placeholder="https://..." className="w-full rounded-lg border border-charcoal/15 px-3 py-2.5 text-sm focus-ring" />
        </div>
        {error && <p className="sm:col-span-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-lg bg-emerald-800 px-5 py-2.5 text-sm font-semibold text-ivory hover:bg-emerald-700 transition-colors focus-ring disabled:opacity-60"
          >
            {status === "loading" ? "Publishing..." : "Publish resource"}
          </button>
        </div>
      </form>

      <h2 className="font-display text-xl text-emerald-900 mb-4">Published resources</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((r) => (
          <div key={r.id} className="rounded-xl border border-emerald-800/10 bg-white p-5 card-elevated">
            <span className="inline-block rounded-full bg-emerald-800/10 text-emerald-800 text-xs font-semibold px-3 py-1 mb-3">
              {r.category}
            </span>
            <p className="font-semibold text-charcoal">{r.title}</p>
            <div className="flex items-center justify-between mt-3">
              <a href={r.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-emerald-700 underline">
                View file
              </a>
              <button onClick={() => remove(r.id)} className="text-xs text-red-700 hover:underline">
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

