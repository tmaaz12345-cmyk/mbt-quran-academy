"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogoMark } from "./Logo";

export interface NavItem {
  href: string;
  label: string;
}

export function PortalShell({
  role,
  navItems,
  userName,
  identifierLabel,
  identifier,
  children,
}: {
  role: string;
  navItems: NavItem[];
  userName: string;
  identifierLabel: string;
  identifier?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-ivory-dim flex">
      <aside className="w-64 bg-emerald-950 text-ivory flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-ivory/10 flex items-center gap-3">
          <LogoMark size={36} />
          <div>
            <p className="font-display text-sm leading-tight">Maaz Bin Tariq</p>
            <p className="text-[10px] uppercase tracking-widest text-gold-light">{role} Portal</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-gold text-emerald-950"
                    : "text-ivory/80 hover:bg-ivory/10 hover:text-ivory"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-5 py-4 border-t border-ivory/10">
          <p className="text-sm font-medium truncate">{userName}</p>
          {identifier && (
            <p className="text-xs text-ivory/60">
              {identifierLabel}: {identifier}
            </p>
          )}
          <button
            onClick={handleLogout}
            className="mt-3 w-full rounded-lg border border-ivory/20 py-2 text-xs font-semibold hover:bg-ivory/10 transition-colors focus-ring"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-8">{children}</div>
      </main>
    </div>
  );
}
