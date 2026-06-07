export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  LogOut,
  LayoutDashboard,
  FolderOpen,
  Users,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

function initialsFromEmail(email: string) {
  return email.slice(0, 2).toUpperCase();
}

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/cases", icon: FolderOpen, label: "Cases" },
  { href: "/professionals", icon: Users, label: "Professionals" },
];

export default async function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 bg-surface border-r border-border flex flex-col shrink-0">
        <div className="p-6 border-b border-border">
          <Link href="/dashboard" className="block">
            <div className="flex items-center gap-3">
              <Image
                src="/logo-light.png"
                alt="Propersafe"
                width={48}
                height={36}
                className="object-contain shrink-0"
                priority
              />
              <div>
                <span className="font-serif text-xl font-semibold text-ink tracking-tight">
                  Propersafe
                </span>
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-ink-muted mt-0.5">
                  Internal Dashboard
                </p>
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-muted hover:text-ink hover:bg-background transition-colors"
            >
              <item.icon size={18} strokeWidth={1.5} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="h-9 w-9 rounded-full bg-gold-bg text-gold flex items-center justify-center text-xs font-semibold border border-gold/10">
              {initialsFromEmail(user.email || "U")}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink truncate">Admin</p>
              <p className="text-xs text-ink-muted truncate">{user.email}</p>
            </div>
          </div>
          <form action="/api/auth/signout" method="post">
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-muted hover:text-red hover:bg-red-bg/40 transition-colors"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-auto">{children}</main>
    </div>
  );
}
