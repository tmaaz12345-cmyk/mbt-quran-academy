import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession, requireRole } from "@/lib/auth";
export const dynamic = "force-dynamic";
 "force-dynamic";

const schema = z.object({
  testTitle: z.string().min(2),
  studentId: z.string(),
  courseId: z.string(),
  marksObtained: z.number().min(0),
  totalMarks: z.number().min(1),
  feedback: z.string().optional(),
});

// POST /api/teacher/results/add
// Inserts a test/exam score linked to the student's official roll number.
export async function POST(req: NextRequest) {
  const session = await getSession();
  const guard = requireRole(session, "teacher");
  if (!guard.ok) return NextResponse.json({ error: guard.message }, { status: guard.status });

  try {
    const body = schema.parse(await req.json());

    const student = await prisma.student.findUnique({ where: { studentId: body.studentId } });
    if (!student || !student.rollNumber) {
      return NextResponse.json({ error: "Student not found or not yet approved." }, { status: 404 });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId: body.studentId, courseId: body.courseId } },
    });
    if (!enrollment || enrollment.teacherId !== session!.teacherId) {
      return NextResponse.json(
        { error: "You are not assigned to teach this student for this course." },
        { status: 403 }
      );
    }

    if (body.marksObtained > body.totalMarks) {
      return NextResponse.json({ error: "Marks obtained cannot exceed total marks." }, { status: 400 });
    }

    const result = await prisma.testResult.create({
      data: {
        testTitle: body.testTitle,
        studentId: body.studentId,
        courseId: body.courseId,
        rollNumber: student.rollNumber,
        marksObtained: body.marksObtained,
        totalMarks: body.totalMarks,
        feedback: body.feedback,
      },
    });

    return NextResponse.json({ message: "Result recorded.", result }, { status: 201 });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Failed to record result." }, { status: 500 });
  }
}



