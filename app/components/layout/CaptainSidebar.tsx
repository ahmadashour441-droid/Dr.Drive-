"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  ClipboardList,
  Wallet,
  FileText,
  UserCircle,
  LogOut,
  Headphones,
} from "lucide-react";

type Props = {
  onNavigate?: () => void;
};

const links = [
  {
    name: "الرئيسية",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "طلباتي",
    href: "/dashboard/orders",
    icon: ClipboardList,
  },
  {
    name: "شحن المحفظة",
    href: "/dashboard/recharge",
    icon: Wallet,
  },
  {
    name: "كشف الحساب",
    href: "/dashboard/accounting",
    icon: FileText,
  },
  {
    name: "الملف الشخصي",
    href: "/dashboard/profile",
    icon: UserCircle,
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
        bg-[#061B35]
        text-white
      "
    >

      {/* LOGO */}

      <div className="border-b border-white/10 px-5 py-6">

        <div className="flex items-center gap-3">

          <div
            className="
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              overflow-hidden
              rounded-xl
              bg-white
            "
          >
            <Image
              src="/logo.png"
              alt="Dr.Drive"
              width={42}
              height={42}
              className="h-full w-full object-contain"
            />
          </div>

          <div>

            <h1 className="text-xl font-black">
              Dr.Drive
            </h1>

            <p className="mt-0.5 text-xs font-medium text-[#F5B82E]">
              وصلني الآن
            </p>

          </div>

        </div>

        <div
          className="
            mt-5
            rounded-xl
            bg-white/[0.06]
            px-4
            py-3
          "
        >
          <p className="text-xs text-slate-400">
            بوابة الكباتن
          </p>

          <p className="mt-1 text-sm font-bold text-white">
            إدارة حسابك بسهولة
          </p>
        </div>

      </div>

      {/* NAVIGATION */}

      <nav className="flex-1 space-y-1.5 overflow-y-auto p-4">

        {links.map((link) => {
          const active =
            pathname === link.href ||
            pathname.startsWith(
              link.href + "/"
            );

          const Icon = link.icon;

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
                py-3.5
                text-sm
                font-bold
                transition-all
                ${
                  active
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-950/20"
                    : "text-slate-300 hover:bg-white/[0.07] hover:text-white"
                }
              `}
            >

              <span
                className={`
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  ${
                    active
                      ? "bg-white/15"
                      : "bg-white/[0.06]"
                  }
                `}
              >
                <Icon size={19} />
              </span>

              <span>
                {link.name}
              </span>

            </Link>
          );
        })}

      </nav>

      {/* SUPPORT */}

      <div className="px-4 pb-3">

        <div
          className="
            rounded-2xl
            border
            border-white/10
            bg-white/[0.05]
            p-4
          "
        >

          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-[#F5B82E]
              text-[#061B35]
            "
          >
            <Headphones size={20} />
          </div>

          <p className="mt-3 text-sm font-black">
            تحتاج مساعدة؟
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-400">
            تواصل مع الإدارة عند الحاجة.
          </p>

        </div>

      </div>

      {/* LOGOUT */}

      <div className="border-t border-white/10 p-4">

        <Link
          href="/api/logout"
          replace
          onClick={onNavigate}
          className="
            flex
            items-center
            justify-center
            gap-2
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
            hover:bg-red-600
            hover:text-white
          "
        >

          <LogOut size={18} />

          تسجيل الخروج

        </Link>

      </div>

    </aside>
  );
}