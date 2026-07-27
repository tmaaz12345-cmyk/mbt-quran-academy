import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { Role } from "@prisma/client";

const SESSION_COOKIE = "mbt_session";
const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev-only-insecure-secret-change-me"
);

export interface SessionPayload {
  userId: string;
  role: Role;
  fullName: string;
  email: string;
  studentId?: string;
  teacherId?: string;
}

// --- Password hashing --------------------------------------------------
export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

// --- JWT session tokens --------------------------------------------------
export async function signSession(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// --- Cookie helpers (server components / route handlers) ----------------
export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

export function setSessionCookie(res: NextResponse, token: string) {
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return res;
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE;

// --- Role guard used inside API routes -----------------------------------
export function requireRole(session: SessionPayload | null, ...roles: Role[]) {
  if (!session) return { ok: false as const, status: 401, message: "Not authenticated" };
  if (!roles.includes(session.role)) {
    return { ok: false as const, status: 403, message: "Insufficient permissions" };
  }
  return { ok: true as const };
}

// --- ID generators --------------------------------------------------------
export function generateStudentId(sequence: number) {
  return `MBT-${1000 + sequence}`;
}

export function generateRollNumber(studentId: string) {
  return `MBT-ROLL-${studentId.split("-")[1]}`;
}

export function generateTeacherId(sequence: number) {
  return `MBT-T-${100 + sequence}`;
}
