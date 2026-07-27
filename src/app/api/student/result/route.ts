import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { getSession, requireRole } from "@/lib/auth";

// GET /api/student/result?roll_number=MBT-ROLL-1001
// Queries results strictly matching the logged-in student's OWN roll number.
// Even if a caller passes a different roll_number, the query is always
// constrained to the session's roll number to prevent cross-student access.
export async function GET(req: NextRequest) {
  const session = await getSession();
  const guard = requireRole(session, "student");
  if (!guard.ok) return NextResponse.json({ error: guard.message }, { status: guard.status });

  const requested = req.nextUrl.searchParams.get("roll_number");

  const student = await prisma.student.findUnique({ where: { studentId: session!.studentId! } });
  if (!student?.rollNumber) {
    return NextResponse.json({ error: "No roll number on file yet." }, { status: 404 });
  }

  if (requested && requested !== student.rollNumber) {
    return NextResponse.json(
      { error: "You may only view results for your own roll number." },
      { status: 403 }
    );
  }

  const results = await prisma.testResult.findMany({
    where: { rollNumber: student.rollNumber }, // hard-scoped to own roll number
    include: { course: { select: { title: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ rollNumber: student.rollNumber, results });
}
