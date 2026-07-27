import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, requireRole } from "@/lib/auth";

// GET /api/student/assignments — this student's own submissions + feedback
export async function GET() {
  const session = await getSession();
  const guard = requireRole(session, "student");
  if (!guard.ok) return NextResponse.json({ error: guard.message }, { status: guard.status });

  const assignments = await prisma.assignment.findMany({
    where: { studentId: session!.studentId! },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ assignments });
}
