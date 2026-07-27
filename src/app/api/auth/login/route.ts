import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { setSessionCookie, signSession, verifyPassword } from "@/lib/auth";

const schema = z.object({
  identifier: z.string().min(3), // email OR Student ID (MBT-1001) OR Teacher ID (MBT-T-101)
  password: z.string().min(1),
});

// POST /api/auth/login
// Role-based authentication using Student ID / Teacher ID / email + password.
export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = schema.parse(await req.json());
    const idUpper = identifier.trim().toUpperCase();

    let user;

    if (identifier.includes("@")) {
      user = await prisma.user.findUnique({
        where: { email: identifier.trim().toLowerCase() },
        include: { student: true, teacher: true },
      });
    } else if (idUpper.startsWith("MBT-T-")) {
      const teacher = await prisma.teacher.findUnique({
        where: { teacherId: idUpper },
        include: { user: { include: { student: true, teacher: true } } },
      });
      user = teacher?.user;
    } else {
      const student = await prisma.student.findUnique({
        where: { studentId: idUpper },
        include: { user: { include: { student: true, teacher: true } } },
      });
      user = student?.user;
    }

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const validPassword = await verifyPassword(password, user.passwordHash);
    if (!validPassword) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    if (user.role === "student" && user.student?.status === "pending") {
      return NextResponse.json(
        { error: "Your application is still pending admin approval." },
        { status: 403 }
      );
    }

    if (user.role === "teacher" && user.teacher?.status === "pending") {
      return NextResponse.json(
        { error: "Your teacher application is still pending admin approval." },
        { status: 403 }
      );
    }

    if (
      (user.role === "student" && user.student?.status === "suspended") ||
      (user.role === "teacher" && user.teacher?.status === "suspended")
    ) {
      return NextResponse.json(
        { error: "This account has been suspended. Contact the academy administrator." },
        { status: 403 }
      );
    }

    const token = await signSession({
      userId: user.id,
      role: user.role,
      fullName: user.fullName,
      email: user.email,
      studentId: user.student?.studentId,
      teacherId: user.teacher?.teacherId,
    });

    const redirectTo =
      user.role === "admin" ? "/admin/dashboard" : user.role === "teacher" ? "/teacher/dashboard" : "/student/dashboard";

    const res = NextResponse.json({ message: "Logged in", role: user.role, redirectTo });
    return setSessionCookie(res, token);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input." }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
