import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateTeacherId, getSession, requireRole } from "@/lib/auth";
export const dynamic = "force-dynamic";
 "force-dynamic";

const schema = z.object({
  pendingTeacherId: z.string(), // the placeholder id e.g. "PENDING-1732500000000"
});

// POST /api/admin/approve-teacher
// Generates a unique Teacher ID (MBT-T-101, MBT-T-102, ...) and activates
// the teacher's account so they can log in and be assigned students.
export async function POST(req: NextRequest) {
  const session = await getSession();
  const guard = requireRole(session, "admin");
  if (!guard.ok) return NextResponse.json({ error: guard.message }, { status: guard.status });

  try {
    const { pendingTeacherId } = schema.parse(await req.json());

    const pending = await prisma.teacher.findUnique({ where: { teacherId: pendingTeacherId } });
    if (!pending) {
      return NextResponse.json({ error: "Application not found." }, { status: 404 });
    }
    if (pending.status !== "pending") {
      return NextResponse.json({ error: "Teacher is already approved." }, { status: 409 });
    }

    // Determine next sequence number from count of already-issued MBT-T- IDs.
    const issuedCount = await prisma.teacher.count({
      where: { teacherId: { startsWith: "MBT-T-" } },
    });
    const newTeacherId = generateTeacherId(issuedCount + 1);

    const updated = await prisma.$transaction(async (tx) => {
      // teacherId is the primary key, so re-issuing it requires delete + recreate.
      await tx.teacher.delete({ where: { teacherId: pendingTeacherId } });
      return tx.teacher.create({
        data: {
          teacherId: newTeacherId,
          userId: pending.userId,
          qualification: pending.qualification,
          experienceYears: pending.experienceYears,
          assignedSubjects: pending.assignedSubjects,
          bio: pending.bio,
          status: "active",
        },
      });
    });

    return NextResponse.json({
      message: "Teacher approved.",
      teacherId: updated.teacherId,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Approval failed." }, { status: 500 });
  }
}


