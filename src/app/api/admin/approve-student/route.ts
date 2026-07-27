import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateRollNumber, generateStudentId, getSession, requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

const schema = z.object({
  pendingStudentId: z.string(), // the placeholder id e.g. "PENDING-1732500000000"
});

// POST /api/admin/approve-student
// Generates a unique Student ID (MBT-1001, MBT-1002, ...) and Roll Number,
// then activates the student's account.
export async function POST(req: NextRequest) {
  const session = await getSession();
  const guard = requireRole(session, "admin");
  if (!guard.ok) return NextResponse.json({ error: guard.message }, { status: guard.status });

  try {
    const { pendingStudentId } = schema.parse(await req.json());

    const pending = await prisma.student.findUnique({ where: { studentId: pendingStudentId } });
    if (!pending) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }
    if (pending.status !== "pending") {
      return NextResponse.json({ error: "Student is already approved." }, { status: 409 });
    }

    // Determine next sequence number from count of already-issued MBT- IDs.
    const issuedCount = await prisma.student.count({
      where: { studentId: { startsWith: "MBT-" } },
    });
    const newStudentId = generateStudentId(issuedCount + 1);
    const rollNumber = generateRollNumber(newStudentId);

    const updated = await prisma.$transaction(async (tx) => {
      // Student ID is the primary key, so re-issuing it requires delete + recreate.
      await tx.student.delete({ where: { studentId: pendingStudentId } });
      return tx.student.create({
        data: {
          studentId: newStudentId,
          userId: pending.userId,
          guardianName: pending.guardianName,
          age: pending.age,
          country: pending.country,
          rollNumber,
          status: "active",
        },
      });
    });

    return NextResponse.json({
      message: "Student approved.",
      studentId: updated.studentId,
      rollNumber: updated.rollNumber,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Approval failed." }, { status: 500 });
  }
}