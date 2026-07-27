import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession, requireRole } from "@/lib/auth";

const schema = z.object({
  title: z.string().min(2),
  category: z.string().min(2), // e.g. "Tajweed", "Qaida Audio", "Dua Booklet"
  fileUrl: z.string().url(), // storage URL (Supabase Storage / S3 / CDN link)
});

// POST /api/admin/library/upload
// Adds new study material (PDF/audio link) to the digital library.
// File bytes should be uploaded to object storage client-side (or via a
// signed URL) first; this endpoint records the resulting URL in the DB.
export async function POST(req: NextRequest) {
  const session = await getSession();
  const guard = requireRole(session, "admin");
  if (!guard.ok) return NextResponse.json({ error: guard.message }, { status: guard.status });

  try {
    const body = schema.parse(await req.json());

    const resource = await prisma.libraryResource.create({
      data: {
        title: body.title,
        category: body.category,
        fileUrl: body.fileUrl,
        uploadedByAdmin: session!.userId,
      },
    });

    return NextResponse.json({ message: "Resource uploaded.", resource }, { status: 201 });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
