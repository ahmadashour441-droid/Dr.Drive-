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
        w-72
        flex-col
        bg-[#061B35]
        text-white
        shadow-2xl
      "
    >
      {/* Logo / Brand */}

      <div className="border-b border-white/10 px-6 py-7">
        <div className="flex items-center gap-3">
          
          {/* Logo */}
          <div
            className="
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-[#F5B82E]
              text-2xl
              font-black
              text-[#061B35]
              shadow-lg
            "
          >
            D
          </div>

          <div>
            <h1 className="text-xl font-black tracking-tight">
              Dr.<span className="text-[#F5B82E]">Drive</span>
            </h1>

            <p className="mt-1 text-sm text-white/60">
              وصلني الآن
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-xl bg-white/5 px-4 py-3">
          <p className="text-xs text-white/50">
            بوابة الكباتن
          </p>

          <p className="mt-1 text-sm font-semibold text-white">
            لوحة تحكم الكابتن
          </p>
        </div>
      </div>

      {/* Navigation */}

      <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-5">

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
                group
                flex
                items-center
                gap-4
                rounded-xl
                px-4
                py-3.5
                transition-all
                duration-200
                ${
                  active
                    ? "bg-[#1769E8] text-white shadow-lg shadow-blue-900/30"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }
              `}
            >
              <span
                className={`
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  text-xl
                  font-bold
                  ${
                    active
                      ? "bg-white/15 text-[#F5B82E]"
                      : "bg-white/5 text-white/70 group-hover:text-[#F5B82E]"
                  }
                `}
              >
                {link.icon}
              </span>

              <span className="text-sm font-semibold">
                {link.name}
              </span>
            </Link>
          );
        })}

        {/* Support */}

        <div className="my-4 border-t border-white/10" />

        <div
          className="
            rounded-2xl
            border
            border-white/10
            bg-white/5
            p-4
          "
        >
          <div className="mb-3 flex items-center gap-3">
            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                bg-blue-500/20
                text-lg
              "
            >
              ?
            </div>

            <div>
              <p className="text-sm font-bold">
                تحتاج مساعدة؟
              </p>

              <p className="mt-1 text-xs text-white/50">
                الدعم الفني
              </p>
            </div>
          </div>

          <button
            type="button"
            className="
              w-full
              rounded-lg
              bg-[#1769E8]
              px-3
              py-2.5
              text-sm
              font-bold
              text-white
              transition
              hover:bg-blue-600
            "
          >
            تواصل الآن
          </button>
        </div>
      </nav>

      {/* Captain Level */}

      <div className="px-4 pb-4">
        <div
          className="
            rounded-2xl
            border
            border-white/10
            bg-[#0B2B52]
            p-4
          "
        >
          <div className="flex items-center gap-3">
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                bg-[#F5B82E]
                text-xl
              "
            >
              ★
            </div>

            <div>
              <p className="text-sm font-bold">
                مستوى الكابتن
              </p>

              <p className="text-xs text-white/50">
                Dr.Drive
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Logout */}

      <div className="border-t border-white/10 p-4">
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
            border
            border-red-500/20
            bg-red-500/10
            px-4
            py-3
            text-sm
            font-bold
            text-red-400
            transition
            hover:bg-red-500
            hover:text-white
          "
        >
          <span className="text-lg">
            ↪
          </span>

          <span>
            تسجيل الخروج
          </span>
        </Link>
      </div>
    </aside>
  );
}