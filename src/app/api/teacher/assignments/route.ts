import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, requireRole } from "@/lib/auth";

// GET /api/teacher/assignments — homework submitted by this teacher's students
export async function GET() {
  const session = await getSession();
  const guard = requireRole(session, "teacher");
  if (!guard.ok) return NextResponse.json({ error: guard.message }, { status: guard.status });

  const enrollments = await prisma.enrollment.findMany({
    where: { teacherId: session!.teacherId },
    select: { studentId: true },
  });
  const studentIds = enrollments.map((e) => e.studentId);

  const assignments = await prisma.assignment.findMany({
    where: { studentId: { in: studentIds } },
    include: { student: { include: { user: { select: { fullName: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ assignments });
}
