import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword, requireRole, verifyPassword } from "@/lib/auth";

// GET /api/admin/profile — the logged-in admin's own account
export async function GET() {
  const session = await getSession();
  const guard = requireRole(session, "admin");
  if (!guard.ok) return NextResponse.json({ error: guard.message }, { status: guard.status });

  const user = await prisma.user.findUnique({
    where: { id: session!.userId },
    select: { fullName: true, email: true, phone: true, createdAt: true },
  });
  if (!user) return NextResponse.json({ error: "Not found." }, { status: 404 });

  return NextResponse.json({ admin: user });
}

const patchSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).optional(),
});

// PATCH /api/admin/profile — update own contact details, optionally change password
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  const guard = requireRole(session, "admin");
  if (!guard.ok) return NextResponse.json({ error: guard.message }, { status: guard.status });

  try {
    const body = patchSchema.parse(await req.json());

    const user = await prisma.user.findUnique({ where: { id: session!.userId } });
    if (!user) return NextResponse.json({ error: "Not found." }, { status: 404 });

    let passwordHash: string | undefined;
    if (body.newPassword) {
      if (!body.currentPassword) {
        return NextResponse.json({ error: "Current password is required to set a new one." }, { status: 400 });
      }
      const valid = await verifyPassword(body.currentPassword, user.passwordHash);
      if (!valid) return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
      passwordHash = await hashPassword(body.newPassword);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(body.fullName ? { fullName: body.fullName } : {}),
        ...(body.phone !== undefined ? { phone: body.phone } : {}),
        ...(passwordHash ? { passwordHash } : {}),
      },
    });

    return NextResponse.json({ message: "Profile updated." });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Update failed." }, { status: 500 });
  }
}
