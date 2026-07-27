import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function StudentDashboard() {
  const session = await getSession();
  const studentId = session!.studentId!;

  const [classes, resultsCount, assignmentsCount, student] = await Promise.all([
    prisma.class.findMany({
      where: { studentId, status: "scheduled" },
      include: { teacher: { include: { user: true } }, course: true },
      orderBy: { scheduledAt: "asc" },
      take: 5,
    }),
    prisma.testResult.count({ where: { studentId } }),
    prisma.assignment.count({ where: { studentId } }),
    prisma.student.findUnique({ where: { studentId } }),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl text-emerald-900 mb-1">
        Assalamu Alaikum, {session!.fullName.split(" ")[0]}
      </h1>
      <p className="text-charcoal-soft mb-8">
        Roll Number: <span className="font-medium text-charcoal">{student?.rollNumber ?? "—"}</span>
      </p>

      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        <StatCard label="Upcoming classes" value={classes.length} />
        <StatCard label="Recorded results" value={resultsCount} />
        <StatCard label="Assignments submitted" value={assignmentsCount} />
      </div>

      <h2 className="font-display text-xl text-emerald-900 mb-4">Upcoming live classes</h2>
      {classes.length === 0 ? (
        <EmptyState message="No classes scheduled yet. Your teacher will add one soon." />
      ) : (
        <div className="space-y-3">
          {classes.map((c) => (
            <div
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-800/10 bg-white p-4 card-elevated"
            >
              <div>
                <p className="font-semibold text-charcoal">{c.classTitle}</p>
                <p className="text-sm text-charcoal-soft">
                  {c.course.title} · with {c.teacher.user.fullName} ·{" "}
                  {new Date(c.scheduledAt).toLocaleString()}
                </p>
              </div>
              <a
                href={c.meetingLink}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-gold-light transition-colors focus-ring"
              >
                Join class
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-emerald-800/10 bg-white p-5 card-elevated">
      <p className="text-3xl font-display text-emerald-900">{value}</p>
      <p className="text-sm text-charcoal-soft mt-1">{label}</p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-emerald-800/20 bg-white/60 p-8 text-center text-sm text-charcoal-soft">
      {message}
    </div>
  );
}