"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  onNavigate?: () => void;
};

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

export default function CaptainSidebar({
  onNavigate,
}: Props) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 md:w-72 flex-shrink-0 flex-col bg-slate-900 text-white">

      <div className="border-b border-slate-700 p-6">

        <h1 className="text-xl md:text-2xl font-bold">
          DR.Drive وصلني الآن
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          لوحة تحكم الكابتن
        </p>

      </div>

      <nav className="flex-1 space-y-2 p-3 md:p-4">

        {links.map((link) => {

          const active =
            pathname === link.href ||
            pathname.startsWith(link.href + "/");

          return (

            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >

              <span className="text-lg">
                {link.icon}
              </span>

              <span className="font-medium">
                {link.name}
              </span>

            </Link>

          );

        })}

      </nav>

      <div className="border-t border-slate-700 p-4">

        <Link
          href="/api/logout"
          replace
          onClick={onNavigate}
          className="flex items-center justify-center gap-3 rounded-xl bg-red-600 px-4 py-3 text-white transition hover:bg-red-700"
        >

          <span>🚪</span>

          <span>تسجيل الخروج</span>

        </Link>

      </div>

    </aside>
  );
}