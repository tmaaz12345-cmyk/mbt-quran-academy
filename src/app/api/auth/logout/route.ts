import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { clearSessionCookie } from "@/lib/auth";

export async function POST() {
  const res = NextResponse.json({ message: "Logged out" });
  return clearSessionCookie(res);
}
