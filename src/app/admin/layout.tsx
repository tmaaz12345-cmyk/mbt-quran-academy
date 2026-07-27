import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { PortalShell } from "@/components/PortalShell";

const NAV = [
  { href: "/admin/dashboard", label: "Students" },
  { href: "/admin/teachers", label: "Teachers" },
  { href: "/admin/library", label: "Library" },
  { href: "/admin/profile", label: "My Profile" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login?next=/admin/dashboard");

  return (
    <PortalShell role="Admin" navItems={NAV} userName={session.fullName} identifierLabel="Email" identifier={session.email}>
      {children}
    </PortalShell>
  );
}
