"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  CreditCard,
  FileText,
  LogOut,
  UserCircle,
  Wallet,
  Home,
} from "lucide-react";

type Props = {
  onNavigate?: () => void;
};

const links = [
  {
    name: "الرئيسية",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "طلباتي",
    href: "/dashboard/orders",
    icon: ClipboardList,
  },
  {
    name: "المستحقات",
    href: "/dashboard/accounting",
    icon: CreditCard,
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
    <div
      dir="rtl"
      className="
        flex
        h-full
        flex-col
        bg-[#061B35]
        p-5
        text-white
      "
    >

      {/* Logo */}

      <div className="mb-7 flex items-center gap-3">

        <img
          src="/logo.png"
          alt="Dr.Drive"
          className="h-12 w-auto object-contain"
        />

        <div>

          <p className="font-black">
            Dr.Drive
          </p>

          <p className="text-xs text-[#F5B82E]">
            وصلني الآن
          </p>

        </div>

      </div>

      {/* Links */}

      <nav className="flex-1 space-y-2">

        {links.map((link) => {
          const Icon = link.icon;

          const active =
            pathname === link.href ||
            pathname.startsWith(
              link.href + "/"
            );

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={`
                flex
                items-center
                gap-3
                rounded-2xl
                px-4
                py-3.5
                font-bold
                transition
                ${
                  active
                    ? "bg-blue-600 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }
              `}
            >
              <Icon size={21} />
              {link.name}
            </Link>
          );
        })}

      </nav>

      {/* Logout */}

      <Link
        href="/api/logout"
        onClick={onNavigate}
        className="
          flex
          items-center
          justify-center
          gap-2
          rounded-2xl
          bg-red-500/15
          px-4
          py-3
          font-bold
          text-red-300
          hover:bg-red-500/25
        "
      >
        <LogOut size={20} />
        تسجيل الخروج
      </Link>

    </div>
  );
}