import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword, requireRole, verifyPassword } from "@/lib/auth";
export const dynamic = "force-dynamic";
 "force-dynamic";

// GET /api/student/profile — the logged-in student's own full record
export async function GET() {
  const session = await getSession();
  const guard = requireRole(session, "student");
  if (!guard.ok) return NextResponse.json({ error: guard.message }, { status: guard.status });

  const student = await prisma.student.findUnique({
    where: { studentId: session!.studentId! },
    include: {
      user: { select: { fullName: true, email: true, phone: true, createdAt: true } },
      enrollments: { include: { course: true, teacher: { include: { user: true } } } },
    },
  });
  if (!student) return NextResponse.json({ error: "Not found." }, { status: 404 });

  return NextResponse.json({ student });
}

const patchSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().optional(),
  guardianName: z.string().optional(),
  age: z.number().int().min(3).max(100).optional(),
  country: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).optional(),
});

// PATCH /api/student/profile — update own contact/guardian details, optionally change password
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  const guard = requireRole(session, "student");
  if (!guard.ok) return NextResponse.json({ error: guard.message }, { status: guard.status });

  try {
    const body = patchSchema.parse(await req.json());

    const student = await prisma.student.findUnique({
      where: { studentId: session!.studentId! },
      include: { user: true },
    });
    if (!student) return NextResponse.json({ error: "Not found." }, { status: 404 });

    let passwordHash: string | undefined;
    if (body.newPassword) {
      if (!body.currentPassword) {
        return NextResponse.json({ error: "Current password is required to set a new one." }, { status: 400 });
      }
      const valid = await verifyPassword(body.currentPassword, student.user.passwordHash);
      if (!valid) return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
      passwordHash = await hashPassword(body.newPassword);
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: student.userId },
        data: {
          ...(body.fullName ? { fullName: body.fullName } : {}),
          ...(body.phone !== undefined ? { phone: body.phone } : {}),
          ...(passwordHash ? { passwordHash } : {}),
        },
      }),
      prisma.student.update({
        where: { studentId: student.studentId },
        data: {
          ...(body.guardianName !== undefined ? { guardianName: body.guardianName } : {}),
          ...(body.age !== undefined ? { age: body.age } : {}),
          ...(body.country !== undefined ? { country: body.country } : {}),
        },
      }),
    ]);

    return NextResponse.json({ message: "Profile updated." });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Update failed." }, { status: 500 });
  }
}


