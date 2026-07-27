import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateTeacherId, getSession, hashPassword, requireRole } from "@/lib/auth";
export const dynamic = "force-dynamic";
 "force-dynamic";

const schema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8),
  qualification: z.string().optional(),
  assignedSubjects: z.array(z.string()).default([]),
});

// GET /api/admin/teachers?status=pending|active — list teachers, optionally filtered
export async function GET(req: NextRequest) {
  const session = await getSession();
  const guard = requireRole(session, "admin");
  if (!guard.ok) return NextResponse.json({ error: guard.message }, { status: guard.status });

  const status = req.nextUrl.searchParams.get("status");

  const teachers = await prisma.teacher.findMany({
    where: status ? { status: status as any } : undefined,
    include: { user: { select: { fullName: true, email: true, phone: true, createdAt: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ teachers });
}

// DELETE /api/admin/teachers?teacherId=MBT-T-101 — remove/reject a teacher record
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  const guard = requireRole(session, "admin");
  if (!guard.ok) return NextResponse.json({ error: guard.message }, { status: guard.status });

  const teacherId = req.nextUrl.searchParams.get("teacherId");
  if (!teacherId) return NextResponse.json({ error: "teacherId is required." }, { status: 400 });

  await prisma.teacher.delete({ where: { teacherId } }).catch(() => null);
  return NextResponse.json({ message: "Teacher removed." });
}

// POST /api/admin/teachers — onboard a new teacher, auto-generating a Teacher ID
export async function POST(req: NextRequest) {
  const session = await getSession();
  const guard = requireRole(session, "admin");
  if (!guard.ok) return NextResponse.json({ error: guard.message }, { status: guard.status });

  try {
    const body = schema.parse(await req.json());
    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) return NextResponse.json({ error: "Email already in use." }, { status: 409 });

    const count = await prisma.teacher.count();
    const teacherId = generateTeacherId(count + 1);
    const passwordHash = await hashPassword(body.password);

    const teacher = await prisma.teacher.create({
      data: {
        teacherId,
        qualification: body.qualification,
        assignedSubjects: body.assignedSubjects,
        status: "active",
        user: {
          create: {
            fullName: body.fullName,
            email: body.email,
            phone: body.phone,
            passwordHash,
            role: "teacher",
          },
        },
      },
      include: { user: true },
    });

    return NextResponse.json({ message: "Teacher created.", teacher }, { status: 201 });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Failed to create teacher." }, { status: 500 });
  }
}


