import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { PortalShell } from "@/components/PortalShell";

const NAV = [
  { href: "/student/dashboard", label: "Dashboard" },
  { href: "/student/results", label: "My Results" },
  { href: "/student/assignments", label: "Assignments" },
  { href: "/student/library", label: "Digital Library" },
  { href: "/student/profile", label: "My Profile" },
];

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "student") redirect("/login?next=/student/dashboard");

  return (
    <PortalShell
      role="Student"
      navItems={NAV}
      userName={session.fullName}
      identifierLabel="Student ID"
      identifier={session.studentId}
    >
      {children}
    </PortalShell>
  );
}
