import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { getSession, requireRole } from "@/lib/auth";

const schema = z.object({
  classTitle: z.string().min(2),
  courseId: z.string(),
  studentId: z.string(), // target Student ID, e.g. MBT-1001
  scheduledAt: z.string(), // ISO datetime
  meetingLink: z.string().url().optional(), // optional: supply your own (Zoom/Meet) link
});

// POST /api/teacher/classes/create
// Generates a video class link (or accepts a supplied one) and records the
// scheduled session against the target Student ID.
export async function POST(req: NextRequest) {
  const session = await getSession();
  const guard = requireRole(session, "teacher");
  if (!guard.ok) return NextResponse.json({ error: guard.message }, { status: guard.status });

  try {
    const body = schema.parse(await req.json());

    // Confirm this teacher actually teaches this student for this course.
    const enrollment = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId: body.studentId, courseId: body.courseId } },
    });
    if (!enrollment || enrollment.teacherId !== session!.teacherId) {
      return NextResponse.json(
        { error: "You are not assigned to teach this student for this course." },
        { status: 403 }
      );
    }

    // Generate a unique room link if the teacher didn't supply their own.
    const meetingLink = body.meetingLink ?? `https://meet.maazbintariq.academy/room/${randomUUID()}`;

    const klass = await prisma.class.create({
      data: {
        classTitle: body.classTitle,
        courseId: body.courseId,
        teacherId: session!.teacherId!,
        studentId: body.studentId,
        meetingLink,
        scheduledAt: new Date(body.scheduledAt),
        status: "scheduled",
      },
    });

    return NextResponse.json({ message: "Class scheduled.", class: klass }, { status: 201 });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Failed to create class." }, { status: 500 });
  }
}
