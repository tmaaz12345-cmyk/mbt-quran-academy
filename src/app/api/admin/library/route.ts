import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, requireRole } from "@/lib/auth";
export const dynamic = "force-dynamic";
 "force-dynamic";

export const revalidate = 0;
export const fetchCache = "force-no-store";

// GET /api/admin/library — full list for admin management
export async function GET() {
  try {
    const session = await getSession();
    const guard = requireRole(session, "admin");
    if (!guard.ok) return NextResponse.json({ error: guard.message }, { status: guard.status });

    const resources = await prisma.libraryResource.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ resources });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/admin/library?id=...
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    const guard = requireRole(session, "admin");
    if (!guard.ok) return NextResponse.json({ error: guard.message }, { status: guard.status });

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required." }, { status: 400 });

    await prisma.libraryResource.delete({ where: { id } }).catch(() => null);
    return NextResponse.json({ message: "Resource removed." });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}

