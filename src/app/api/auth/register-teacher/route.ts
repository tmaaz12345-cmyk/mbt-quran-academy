import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

const schema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8),
  qualification: z.string().optional(),
  experienceYears: z.number().int().min(0).max(60).optional(),
  assignedSubjects: z.array(z.string()).default([]),
  bio: z.string().optional(),
});

// POST /api/auth/register-teacher
// Public endpoint: any tutor can apply to teach. The resulting teacher
// record is created with status = "pending" until an admin approves it
// via /api/admin/approve-teacher, at which point a real Teacher ID
// (MBT-T-xxx) is issued.
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
        role: "teacher",
        teacher: {
          create: {
            // Temporary placeholder ID; replaced with MBT-T-xxx on admin approval.
            teacherId: `PENDING-${Date.now()}`,
            qualification: body.qualification,
            experienceYears: body.experienceYears,
            assignedSubjects: body.assignedSubjects,
            bio: body.bio,
            status: "pending",
          },
        },
      },
      include: { teacher: true },
    });

    return NextResponse.json(
      {
        message: "Application submitted. Awaiting admin approval.",
        applicationRef: user.teacher?.teacherId,
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
