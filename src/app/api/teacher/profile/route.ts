import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword, requireRole, verifyPassword } from "@/lib/auth";
export const dynamic = "force-dynamic";
 "force-dynamic";

// GET /api/teacher/profile — the logged-in teacher's own full record
export async function GET() {
  const session = await getSession();
  const guard = requireRole(session, "teacher");
  if (!guard.ok) return NextResponse.json({ error: guard.message }, { status: guard.status });

  const teacher = await prisma.teacher.findUnique({
    where: { teacherId: session!.teacherId! },
    include: { user: { select: { fullName: true, email: true, phone: true, createdAt: true } } },
  });
  if (!teacher) return NextResponse.json({ error: "Not found." }, { status: 404 });

  return NextResponse.json({ teacher });
}

const patchSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().optional(),
  qualification: z.string().optional(),
  experienceYears: z.number().int().min(0).max(60).optional(),
  assignedSubjects: z.array(z.string()).optional(),
  bio: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).optional(),
});

// PATCH /api/teacher/profile — update own contact/teaching details, optionally change password
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  const guard = requireRole(session, "teacher");
  if (!guard.ok) return NextResponse.json({ error: guard.message }, { status: guard.status });

  try {
    const body = patchSchema.parse(await req.json());

    const teacher = await prisma.teacher.findUnique({
      where: { teacherId: session!.teacherId! },
      include: { user: true },
    });
    if (!teacher) return NextResponse.json({ error: "Not found." }, { status: 404 });

    let passwordHash: string | undefined;
    if (body.newPassword) {
      if (!body.currentPassword) {
        return NextResponse.json({ error: "Current password is required to set a new one." }, { status: 400 });
      }
      const valid = await verifyPassword(body.currentPassword, teacher.user.passwordHash);
      if (!valid) return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
      passwordHash = await hashPassword(body.newPassword);
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: teacher.userId },
        data: {
          ...(body.fullName ? { fullName: body.fullName } : {}),
          ...(body.phone !== undefined ? { phone: body.phone } : {}),
          ...(passwordHash ? { passwordHash } : {}),
        },
      }),
      prisma.teacher.update({
        where: { teacherId: teacher.teacherId },
        data: {
          ...(body.qualification !== undefined ? { qualification: body.qualification } : {}),
          ...(body.experienceYears !== undefined ? { experienceYears: body.experienceYears } : {}),
          ...(body.assignedSubjects !== undefined ? { assignedSubjects: body.assignedSubjects } : {}),
          ...(body.bio !== undefined ? { bio: body.bio } : {}),
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



