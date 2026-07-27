import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, requireRole } from "@/lib/auth";

// GET /api/teacher/students — students enrolled under this teacher
export async function GET() {
  const session = await getSession();
  const guard = requireRole(session, "teacher");
  if (!guard.ok) return NextResponse.json({ error: guard.message }, { status: guard.status });

  const enrollments = await prisma.enrollment.findMany({
    where: { teacherId: session!.teacherId },
    include: {
      student: { include: { user: { select: { fullName: true, email: true } } } },
      course: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ enrollments });
}
