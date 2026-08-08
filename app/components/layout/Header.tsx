"use client";

import {
  Bell,
  Menu,
  UserCircle2,
} from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
  fullName?: string;
}

export default function Header({
  title,
  subtitle,
  onMenuClick,
  fullName,
}: HeaderProps) {
  return (
    <header
      dir="rtl"
      className="
        sticky
        top-0
        z-30
        h-[82px]
        border-b
        border-slate-100
        bg-white
      "
    >

      <div
        className="
          mx-auto
          flex
          h-full
          w-full
          max-w-[1500px]
          items-center
          justify-between
          px-4
          md:px-8
        "
      >

        {/* Logo */}

        <div className="flex items-center gap-3">

          <img
            src="/logo.png"
            alt="Dr.Drive"
            className="
              h-12
              w-auto
              object-contain
            "
          />

          <div className="hidden md:block">

            <p className="text-sm font-black text-[#061B35]">
              Dr.Drive
            </p>

            <p className="text-xs text-[#F5B82E]">
              وصلني الآن
            </p>

          </div>

        </div>

        {/* Title */}

        <div className="hidden text-center md:block">

          <h1 className="text-xl font-black text-[#061B35]">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-1 text-xs text-slate-400">
              {subtitle}
            </p>
          )}

        </div>

        {/* User */}

        <div className="flex items-center gap-2 md:gap-4">

          {/* Bell */}

          <button
            type="button"
            className="
              relative
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-2xl
              bg-slate-50
              text-[#061B35]
            "
          >

            <Bell size={23} />

            <span
              className="
                absolute
                right-2
                top-2
                h-2.5
                w-2.5
                rounded-full
                bg-[#F5B82E]
                ring-2
                ring-white
              "
            />

          </button>

          {/* Name */}

          <div className="hidden text-right sm:block">

            <p className="text-sm font-black text-[#061B35]">
              {fullName}
            </p>

            <p className="text-xs text-slate-400">
              كابتن
            </p>

          </div>

          {/* Avatar */}

          <div
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              overflow-hidden
              rounded-full
              bg-slate-100
              text-blue-600
            "
          >
            <UserCircle2
              size={40}
              strokeWidth={1.6}
            />
          </div>

          {/* Mobile Menu */}

          <button
            type="button"
            onClick={onMenuClick}
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-2xl
              bg-slate-50
              text-[#061B35]
              lg:hidden
            "
          >
            <Menu size={28} />
          </button>

        </div>

      </div>

    </header>
  );
}