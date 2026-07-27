import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

const schema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8),
  guardianName: z.string().optional(),
  age: z.number().int().min(3).max(100).optional(),
  country: z.string().optional(),
  interestedCourse: z.string().optional(),
});

// POST /api/auth/register
// Public endpoint: any visitor can submit an application. The resulting
// student record is created with status = "pending" until an admin
// approves it via /api/admin/approve-student.
export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());

    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const passwordHash = await hashPassword(body.password);

    const user = await prisma.user.create({
      data: {
        fullName: body.fullName,
        email: body.email,
        phone: body.phone,
        passwordHash,
        role: "student",
        student: {
          create: {
            // Temporary placeholder ID; replaced with MBT-xxxx on admin approval.
            studentId: `PENDING-${Date.now()}`,
            guardianName: body.guardianName,
            age: body.age,
            country: body.country,
            status: "pending",
          },
        },
      },
      include: { student: true },
    });

    return NextResponse.json(
      {
        message: "Application submitted. Awaiting admin approval.",
        applicationRef: user.student?.studentId,
      },
      { status: 201 }
    );
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Registration failed." }, { status: 500 });
  }
}
