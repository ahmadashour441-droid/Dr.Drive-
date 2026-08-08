"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  onNavigate?: () => void;
};

const links = [
  {
    name: "لوحة التحكم",
    href: "/dashboard",
    icon: "⌂",
  },
  {
    name: "طلباتي",
    href: "/dashboard/orders",
    icon: "▣",
  },
  {
    name: "المستحقات",
    href: "/dashboard/accounting",
    icon: "▤",
  },
  {
    name: "شحن المحفظة",
    href: "/dashboard/recharge",
    icon: "▣",
  },
  {
    name: "كشف الحساب",
    href: "/dashboard/accounting",
    icon: "▤",
  },
  {
    name: "الملف الشخصي",
    href: "/dashboard/profile",
    icon: "♙",
  },
];

export default function CaptainSidebar({
  onNavigate,
}: Props) {
  const pathname = usePathname();

  return (
    <aside
      dir="rtl"
      className="
        flex
        h-full
        w-full
        flex-col
        overflow-hidden
        bg-[#061D38]
        text-white
      "
    >
      {/* Logo */}

      <div className="border-b border-white/10 px-5 py-5">

        <div className="flex items-center gap-3">

          <div
            className="
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-[#FFB51B]
              text-2xl
              font-black
              text-[#061D38]
            "
          >
            D
          </div>

          <div>
            <h1 className="text-xl font-extrabold">
              Dr.Drive
            </h1>

            <p className="text-sm text-[#FFB51B]">
              وصلني الآن
            </p>
          </div>

        </div>

        <p className="mt-4 text-xs text-slate-400">
          لوحة تحكم الكابتن
        </p>

      </div>

      {/* Navigation */}

      <nav className="flex-1 space-y-2 overflow-y-auto p-4">

        {links.map((link) => {

          const active =
            pathname === link.href ||
            pathname.startsWith(link.href + "/");

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={`
                flex
                items-center
                gap-3
                rounded-xl
                px-4
                py-3
                transition-all
                duration-200
                ${
                  active
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }
              `}
            >

              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-lg">
                {link.icon}
              </span>

              <span className="font-semibold">
                {link.name}
              </span>

            </Link>
          );

        })}

      </nav>

      {/* Help */}

      <div className="border-t border-white/10 p-4">

        <div className="mb-3 rounded-xl bg-white/5 p-3">

          <p className="text-sm font-bold">
            تحتاج مساعدة؟
          </p>

          <p className="mt-1 text-xs text-slate-400">
            الدعم الفني
          </p>

          <button
            type="button"
            className="
              mt-3
              w-full
              rounded-lg
              bg-blue-600
              py-2
              text-sm
              font-bold
              text-white
              hover:bg-blue-700
            "
          >
            تواصل الآن
          </button>

        </div>

        {/* Logout */}

        <Link
          href="/api/logout"
          replace
          onClick={onNavigate}
          className="
            flex
            items-center
            justify-center
            gap-3
            rounded-xl
            bg-red-600/10
            px-4
            py-3
            font-bold
            text-red-400
            transition
            hover:bg-red-600
            hover:text-white
          "
        >
          <span>↪</span>
          <span>تسجيل الخروج</span>
        </Link>

      </div>

    </aside>
  );
}