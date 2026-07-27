import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LogoLockup, LogoMark } from "@/components/Logo";
import { AdmissionsTabs } from "@/components/AdmissionsTabs";
export const dynamic = "force-dynamic";
 "force-dynamic";

const FALLBACK_COURSES = [
  { title: "Noorani Qaida", category: "Qaida", description: "Foundational Arabic letter recognition and pronunciation." },
  { title: "Tajweed Mastery", category: "Tajweed", description: "Rules of correct Quranic recitation." },
  { title: "Nazra Quran", category: "Nazra", description: "Fluent Quran reading with correct pronunciation." },
  { title: "Hifz-ul-Quran", category: "Hifz", description: "Complete memorization of the Holy Quran." },
  { title: "Masnoon Duaen", category: "Masnoon_Duaen", description: "Daily prophetic supplications for everyday life." },
  { title: "Namaz (Salah) Training", category: "Namaz", description: "Step-by-step guide to performing prayer correctly." },
  { title: "6 Kalmas", category: "Six_Kalmas", description: "The six fundamental declarations of Islamic faith." },
];

async function getCourses() {
  try {
    const courses = await prisma.course.findMany({ orderBy: { createdAt: "asc" } });
    if (courses.length) return courses;
    return FALLBACK_COURSES;
  } catch {
    return FALLBACK_COURSES;
  }
}

export default async function HomePage() {
  const courses = await getCourses();

  return (
    <main className="min-h-screen bg-ivory">
      {/* ---------------- Header ---------------- */}
      <header className="bg-emerald-800 geo-pattern-bg">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-4 flex items-center justify-between">
          <LogoLockup />
          <nav className="hidden md:flex items-center gap-8 text-ivory/90 text-sm font-medium">
            <a href="#courses" className="hover:text-gold-light transition-colors">Courses</a>
            <a href="#register" className="hover:text-gold-light transition-colors">Admissions</a>
            <a href="#about" className="hover:text-gold-light transition-colors">About</a>
          </nav>
          <Link
            href="/login"
            className="rounded-md border border-gold/60 px-4 py-2 text-sm font-semibold text-gold-light hover:bg-gold hover:text-emerald-950 transition-colors focus-ring"
          >
            Portal Login
          </Link>
        </div>
      </header>

      {/* ---------------- Hero ---------------- */}
      <section className="bg-emerald-800 geo-pattern-bg text-ivory">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 pt-10 pb-20 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <div>
            <p className="text-gold-light tracking-[0.25em] text-xs uppercase mb-4">
              One-to-one online tuition · Certified tutors
            </p>
            <h1 className="font-display text-4xl sm:text-5xl leading-[1.1] mb-6">
              Learn the Qur&apos;an with sincerity, structure, and a teacher who knows your name.
            </h1>
            <p className="text-ivory/80 text-lg leading-relaxed max-w-xl mb-8">
              Maaz Bin Tariq Online Quran Academy pairs every student with a dedicated tutor for
              Qaida, Tajweed, Nazra, Hifz, Masnoon Duaen, Namaz, and the 6 Kalmas — live, from
              wherever you are.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#register"
                className="rounded-lg bg-gold px-6 py-3 font-semibold text-emerald-950 hover:bg-gold-light transition-colors focus-ring"
              >
                Start free trial class
              </a>
              <a
                href="#courses"
                className="rounded-lg border border-ivory/30 px-6 py-3 font-semibold hover:border-gold-light hover:text-gold-light transition-colors focus-ring"
              >
                View courses
              </a>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="relative">
              <LogoMark size={220} />
            </div>
          </div>
        </div>
      </section>
      <div className="geo-divider" />

      {/* ---------------- Courses ---------------- */}
      <section id="courses" className="mx-auto max-w-6xl px-5 sm:px-8 py-16">
        <h2 className="font-display text-3xl text-emerald-900 mb-2">Our Courses</h2>
        <p className="text-charcoal-soft mb-10 max-w-2xl">
          Each course is taught one-to-one over live video, with progress tracked in your
          Student Portal — results, class links, and assignments in one place.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c) => (
            <div
              key={c.title}
              className="rounded-xl border border-emerald-800/10 bg-white p-6 card-elevated hover:-translate-y-0.5 transition-transform"
            >
              <span className="inline-block rounded-full bg-emerald-800/10 text-emerald-800 text-xs font-semibold px-3 py-1 mb-4">
                {c.category.replace("_", " ")}
              </span>
              <h3 className="font-display text-xl text-charcoal mb-2">{c.title}</h3>
              <p className="text-charcoal-soft text-sm leading-relaxed">{c.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- Registration ---------------- */}
      <section id="register" className="bg-emerald-950/[0.03] border-y border-emerald-800/10">
        <div className="mx-auto max-w-4xl px-5 sm:px-8 py-16">
          <h2 className="font-display text-3xl text-emerald-900 mb-2">Join the academy</h2>
          <p className="text-charcoal-soft mb-8 max-w-2xl">
            Submit an application below — as a student or as a teacher. An administrator will
            review it and issue your official ID.
          </p>
          <div className="rounded-2xl bg-white p-6 sm:p-8 card-elevated">
            <AdmissionsTabs />
          </div>
        </div>
      </section>

      {/* ---------------- About / footer ---------------- */}
      <footer id="about" className="bg-charcoal text-ivory/70">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-12 grid sm:grid-cols-3 gap-8">
          <div>
            <LogoLockup />
            <p className="text-sm mt-4 leading-relaxed">
              A structured, teacher-led path to the Qur&apos;an — for students of every age,
              anywhere in the world.
            </p>
          </div>
          <div className="text-sm">
            <p className="text-gold-light font-semibold mb-3">Portals</p>
            <ul className="space-y-2">
              <li><Link href="/login" className="hover:text-gold-light">Student login</Link></li>
              <li><Link href="/login" className="hover:text-gold-light">Teacher login</Link></li>
              <li><Link href="/login" className="hover:text-gold-light">Admin login</Link></li>
            </ul>
          </div>
          <div className="text-sm">
            <p className="text-gold-light font-semibold mb-3">Contact</p>
            <p>admissions@maazbintariq.academy</p>
          </div>
        </div>
        <div className="border-t border-ivory/10 text-center text-xs py-5">
          © {new Date().getFullYear()} Maaz Bin Tariq Online Quran Academy. All rights reserved.
        </div>
      </footer>
    </main>
  );
}


