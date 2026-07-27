import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, requireRole } from "@/lib/auth";
export const dynamic = "force-dynamic";
 "force-dynamic";

// GET /api/admin/students?status=pending|active
export async function GET(req: NextRequest) {
  const session = await getSession();
  const guard = requireRole(session, "admin");
  if (!guard.ok) return NextResponse.json({ error: guard.message }, { status: guard.status });

  const status = req.nextUrl.searchParams.get("status");

  const students = await prisma.student.findMany({
    where: status ? { status: status as any } : undefined,
    include: {
      user: { select: { fullName: true, email: true, phone: true, createdAt: true } },
      enrollments: { include: { course: true, teacher: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ students });
}

// DELETE /api/admin/students?studentId=MBT-1001  — remove a student record
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  const guard = requireRole(session, "admin");
  if (!guard.ok) return NextResponse.json({ error: guard.message }, { status: guard.status });

  const studentId = req.nextUrl.searchParams.get("studentId");
  if (!studentId) return NextResponse.json({ error: "studentId is required." }, { status: 400 });

  await prisma.student.delete({ where: { studentId } }).catch(() => null);
  return NextResponse.json({ message: "Student removed." });
}


