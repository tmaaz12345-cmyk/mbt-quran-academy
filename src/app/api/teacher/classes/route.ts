import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, requireRole } from "@/lib/auth";

// GET /api/teacher/classes — all classes scheduled by the logged-in teacher
export async function GET() {
  const session = await getSession();
  const guard = requireRole(session, "teacher");
  if (!guard.ok) return NextResponse.json({ error: guard.message }, { status: guard.status });

  const classes = await prisma.class.findMany({
    where: { teacherId: session!.teacherId },
    include: {
      student: { include: { user: { select: { fullName: true } } } },
      course: { select: { title: true } },
    },
    orderBy: { scheduledAt: "desc" },
  });

  return NextResponse.json({ classes });
}
