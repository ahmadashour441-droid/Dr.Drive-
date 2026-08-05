"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  UserCog,
  Wallet,
  CreditCard,
  Settings,
} from "lucide-react";

const items = [
  {
    name: "الرئيسية",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "إدارة الطلبات",
    href: "/admin/orders",
    icon: ClipboardList,
  },
  {
    name: "إدارة المستخدمين",
    href: "/admin/users",
    icon: UserCog,
  },
  {
    name: "طلبات شحن الرصيد",
    href: "/admin/recharge",
    icon: CreditCard,
  },
  {
    name: "المحاسبة",
    href: "/admin/accounting",
    icon: Wallet,
  },
  {
    name: "الإعدادات",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 md:w-72 flex-shrink-0 flex-col bg-slate-900 text-white">

      <div className="flex h-20 items-center justify-center border-b border-slate-700">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold">
            D
          </div>

          <div>
            <h1 className="text-base md:text-lg font-bold">
              DR.Drive وصلني الآن
            </h1>

            <p className="text-xs text-slate-400">
              لوحة التحكم
            </p>
          </div>

        </div>

      </div>

      <nav className="flex-1 space-y-2 px-3 md:px-4 py-4 md:py-6">

        {items.map((item) => {

          const Icon = item.icon;

          const active =
            pathname === item.href ||
            (item.href !== "/admin" &&
              pathname.startsWith(item.href));

          return (

            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                active
                  ? "bg-blue-600"
                  : "hover:bg-slate-800"
              }`}
            >

              <Icon size={20} />

              <span className="text-sm md:text-base">
                {item.name}
              </span>

            </Link>

          );

        })}

      </nav>

    </aside>
  );
}