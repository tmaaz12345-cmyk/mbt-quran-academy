import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, requireRole } from "@/lib/auth";

// GET /api/admin/library — full list for admin management
export async function GET() {
  const session = await getSession();
  const guard = requireRole(session, "admin");
  if (!guard.ok) return NextResponse.json({ error: guard.message }, { status: guard.status });

  const resources = await prisma.libraryResource.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ resources });
}

// DELETE /api/admin/library?id=...
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  const guard = requireRole(session, "admin");
  if (!guard.ok) return NextResponse.json({ error: guard.message }, { status: guard.status });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required." }, { status: 400 });

  await prisma.libraryResource.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ message: "Resource removed." });
}
