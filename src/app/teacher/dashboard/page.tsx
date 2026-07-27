import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function TeacherDashboard() {
  const session = await getSession();
  const teacherId = session!.teacherId!;

  const [enrollments, upcomingClasses, pendingAssignments] = await Promise.all([
    prisma.enrollment.findMany({
      where: { teacherId },
      include: { student: { include: { user: true } }, course: true },
    }),
    prisma.class.count({ where: { teacherId, status: "scheduled" } }),
    prisma.assignment.count({
      where: { status: "submitted", student: { enrollments: { some: { teacherId } } } },
    }),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl text-emerald-900 mb-1">
        Assalamu Alaikum, {session!.fullName.split(" ")[0]}
      </h1>
      <p className="text-charcoal-soft mb-8">Here is an overview of your students today.</p>

      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        <StatCard label="Assigned students" value={enrollments.length} />
        <StatCard label="Upcoming classes" value={upcomingClasses} />
        <StatCard label="Assignments to review" value={pendingAssignments} />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl text-emerald-900">Your students</h2>
        <Link href="/teacher/classes" className="text-sm font-medium text-emerald-700 hover:underline">
          Schedule a class →
        </Link>
      </div>

      {enrollments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-emerald-800/20 bg-white/60 p-8 text-center text-sm text-charcoal-soft">
          No students assigned yet. Ask an admin to assign students to you.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-emerald-800/10 bg-white card-elevated">
          <table className="w-full text-sm">
            <thead className="bg-emerald-950/5 text-charcoal-soft text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">Student ID</th>
                <th className="px-4 py-3 font-medium">Course</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((e) => (
                <tr key={e.id} className="border-t border-emerald-800/5">
                  <td className="px-4 py-3 font-medium text-charcoal">{e.student.user.fullName}</td>
                  <td className="px-4 py-3 text-charcoal-soft">{e.studentId}</td>
                  <td className="px-4 py-3 text-charcoal-soft">{e.course.title}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-800/10 text-emerald-800">
                      {e.status}
                    </span>
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

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-emerald-800/10 bg-white p-5 card-elevated">
      <p className="text-3xl font-display text-emerald-900">{value}</p>
      <p className="text-sm text-charcoal-soft mt-1">{label}</p>
    </div>
  );
}
