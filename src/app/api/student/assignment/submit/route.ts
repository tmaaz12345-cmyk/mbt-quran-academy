import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession, requireRole } from "@/lib/auth";
export const dynamic = "force-dynamic";
 "force-dynamic";

const schema = z.object({
  title: z.string().min(2),
  fileUrl: z.string().url().optional(),
  submissionText: z.string().optional(),
});

// POST /api/student/assignment/submit
// Uploads homework (a link and/or text) for the logged-in student.
export async function POST(req: NextRequest) {
  const session = await getSession();
  const guard = requireRole(session, "student");
  if (!guard.ok) return NextResponse.json({ error: guard.message }, { status: guard.status });

  try {
    const body = schema.parse(await req.json());
    if (!body.fileUrl && !body.submissionText) {
      return NextResponse.json(
        { error: "Provide a file link or written submission." },
        { status: 400 }
      );
    }

    const assignment = await prisma.assignment.create({
      data: {
        studentId: session!.studentId!,
        title: body.title,
        fileUrl: body.fileUrl,
        submissionText: body.submissionText,
        status: "submitted",
      },
    });

    return NextResponse.json({ message: "Assignment submitted.", assignment }, { status: 201 });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Submission failed." }, { status: 500 });
  }
}


