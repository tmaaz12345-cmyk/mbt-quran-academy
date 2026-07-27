import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { PortalShell } from "@/components/PortalShell";

const NAV = [
  { href: "/teacher/dashboard", label: "Dashboard" },
  { href: "/teacher/classes", label: "Live Classes" },
  { href: "/teacher/results", label: "Test Results" },
  { href: "/teacher/assignments", label: "Assignments" },
  { href: "/teacher/profile", label: "My Profile" },
];

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "teacher") redirect("/login?next=/teacher/dashboard");

  return (
    <PortalShell
      role="Teacher"
      navItems={NAV}
      userName={session.fullName}
      identifierLabel="Teacher ID"
      identifier={session.teacherId}
    >
      {children}
    </PortalShell>
  );
}
