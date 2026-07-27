import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/courses — public course catalog for the homepage
export async function GET() {
  const courses = await prisma.course.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json({ courses });
}
