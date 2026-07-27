import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, requireRole } from "@/lib/auth";
export const dynamic = "force-dynamic";
 "force-dynamic";

// GET /api/student/library — all published study material
export async function GET() {
  const session = await getSession();
  const guard = requireRole(session, "student");
  if (!guard.ok) return NextResponse.json({ error: guard.message }, { status: guard.status });

  const resources = await prisma.libraryResource.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ resources });
}


