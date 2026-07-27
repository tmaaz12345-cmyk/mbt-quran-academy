import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev-only-insecure-secret-change-me"
);

const ROLE_PREFIXES: { prefix: string; role: string }[] = [
  { prefix: "/admin", role: "admin" },
  { prefix: "/teacher", role: "teacher" },
  { prefix: "/student", role: "student" },
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const match = ROLE_PREFIXES.find((r) => pathname.startsWith(r.prefix));
  if (!match) return NextResponse.next();

  const token = req.cookies.get("mbt_session")?.value;
  if (!token) {
    return NextResponse.redirect(new URL(`/login?next=${pathname}`, req.url));
  }

  try {
    const { payload } = await jwtVerify(token, SECRET);
    if (payload.role !== match.role) {
      return NextResponse.redirect(new URL("/login?error=forbidden", req.url));
    }
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL(`/login?next=${pathname}`, req.url));
  }
}

export const config = {
  matcher: ["/admin/:path*", "/teacher/:path*", "/student/:path*"],
};
