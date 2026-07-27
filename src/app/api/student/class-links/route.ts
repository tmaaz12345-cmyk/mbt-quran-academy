import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, requireRole } from "@/lib/auth";
export const dynamic = "force-dynamic";
 "force-dynamic";

// GET /api/student/class-links
// Returns class links assigned to the logged-in Student ID only.
export async function GET() {
  const session = await getSession();
  const guard = requireRole(session, "student");
  if (!guard.ok) return NextResponse.json({ error: guard.message }, { status: guard.status });

  const classes = await prisma.class.findMany({
    where: { studentId: session!.studentId, status: { in: ["scheduled", "completed"] } },
    include: {
      teacher: { include: { user: { select: { fullName: true } } } },
      course: { select: { title: true } },
    },
    orderBy: { scheduledAt: "asc" },
  });

  return NextResponse.json({ classes });
}


