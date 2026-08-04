"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  Wallet,
  Users,
  UserCog,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

const items = [
  {
    title: "الرئيسية",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "إضافة طلب",
    href: "/orders",
    icon: PlusCircle,
  },
  {
    title: "جميع الطلبات",
    href: "/orders/list",
    icon: ClipboardList,
  },
  {
    title: "المحاسبة",
    href: "/accounting",
    icon: Wallet,
  },
  {
    title: "المستخدمون",
    href: "/users",
    icon: Users,
  },
  {
    title: "التقارير",
    href: "/reports",
    icon: BarChart3,
  },
  {
    title: "الإعدادات",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    localStorage.removeItem("user");
    router.push("/");
  }

  return (
    <aside className="hidden lg:flex w-72 bg-white border-r flex-col">

      <div className="h-20 border-b flex items-center justify-center">

        <div className="text-center">

          <h1 className="text-2xl font-bold text-blue-600">
            Dr.Driveوصلني الآن 
          </h1>

          <p className="text-sm text-gray-500">
            وصلني الآن
          </p>

        </div>

      </div>

      <nav className="flex-1 p-5 space-y-2">

        {items.map((item) => {
          const Icon = item.icon;

          const active =
            pathname === item.href ||
            pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                active
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon size={20} />

              <span className="font-medium">
                {item.title}
              </span>
            </Link>
          );
        })}

      </nav>

      <div className="border-t p-5 space-y-3">

        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-gray-700 hover:bg-gray-100 transition"
        >
          <UserCog size={20} />
          الملف الشخصي
        </Link>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-white hover:bg-red-700 transition"
        >
          <LogOut size={18} />
          تسجيل الخروج
        </button>

      </div>

    </aside>
  );
}