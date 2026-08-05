"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  {
    name: "الرئيسية",
    href: "/dashboard",
    icon: "🏠",
  },
  {
    name: "طلباتي",
    href: "/dashboard/orders",
    icon: "🚖",
  },
  {
    name: "كشف الحساب",
    href: "/dashboard/accounting",
    icon: "💰",
  },
  {
    name: "الملف الشخصي",
    href: "/dashboard/profile",
    icon: "👤",
  },
];

export default function CaptainSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 md:w-72 bg-slate-900 text-white flex flex-col">
      <div className="border-b border-slate-700 p-6">
        <h1 className="text-xl md:text-2xl font-bold">Dr.Drive</h1>
        <p className="mt-2 text-sm text-slate-400">
          لوحة تحكم الكابتن
        </p>
      </div>

      <nav className="flex-1 p-3 md:p-4 space-y-2">
        {links.map((link) => {
          const active =
            pathname === link.href ||
            pathname.startsWith(link.href + "/");

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 transition ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span>{link.icon}</span>
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-700 p-4">
        <Link
          href="/api/logout"
          replace
          className="flex items-center gap-3 rounded-lg bg-red-600 px-4 py-3 text-white transition hover:bg-red-700"
        >
          <span>🚪</span>
          <span>تسجيل الخروج</span>
        </Link>
      </div>
    </aside>
  );
}