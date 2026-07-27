import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession, requireRole } from "@/lib/auth";
export const dynamic = "force-dynamic";
 "force-dynamic";

const schema = z.object({
  assignmentId: z.string(),
  teacherFeedback: z.string().min(1),
});

// POST /api/teacher/assignments/review
// Marks a homework submission as reviewed and attaches feedback.
export async function POST(req: NextRequest) {
  const session = await getSession();
  const guard = requireRole(session, "teacher");
  if (!guard.ok) return NextResponse.json({ error: guard.message }, { status: guard.status });

  try {
    const { assignmentId, teacherFeedback } = schema.parse(await req.json());

    const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
    if (!assignment) return NextResponse.json({ error: "Assignment not found." }, { status: 404 });

    const enrollment = await prisma.enrollment.findFirst({
      where: { studentId: assignment.studentId, teacherId: session!.teacherId },
    });
    if (!enrollment) {
      return NextResponse.json({ error: "This student is not assigned to you." }, { status: 403 });
    }

    const updated = await prisma.assignment.update({
      where: { id: assignmentId },
      data: { status: "reviewed", teacherFeedback },
    });

    return NextResponse.json({ message: "Assignment reviewed.", assignment: updated });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Review failed." }, { status: 500 });
  }
}



