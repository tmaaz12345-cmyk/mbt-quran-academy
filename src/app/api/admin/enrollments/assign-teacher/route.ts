import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession, requireRole } from "@/lib/auth";
export const dynamic = "force-dynamic";
 "force-dynamic";

const schema = z.object({
  studentId: z.string(),
  courseId: z.string(),
  teacherId: z.string(),
});

// POST /api/admin/enrollments/assign-teacher
// Creates (or updates) the enrollment linking a student, course, and teacher.
export async function POST(req: NextRequest) {
  const session = await getSession();
  const guard = requireRole(session, "admin");
  if (!guard.ok) return NextResponse.json({ error: guard.message }, { status: guard.status });

  try {
    const { studentId, courseId, teacherId } = schema.parse(await req.json());

    const enrollment = await prisma.enrollment.upsert({
      where: { studentId_courseId: { studentId, courseId } },
      update: { teacherId, status: "active" },
      create: { studentId, courseId, teacherId, status: "active" },
      include: { student: true, course: true, teacher: true },
    });

    return NextResponse.json({ message: "Teacher assigned.", enrollment });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Assignment failed." }, { status: 500 });
  }
}


