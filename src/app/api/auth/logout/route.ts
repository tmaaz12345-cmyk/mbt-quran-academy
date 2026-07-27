import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";
export const dynamic = "force-dynamic";
 "force-dynamic";

export async function POST() {
  const res = NextResponse.json({ message: "Logged out" });
  return clearSessionCookie(res);
}


