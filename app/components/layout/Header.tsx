"use client";

import {
  Bell,
  Menu,
  UserCircle,
} from "lucide-react";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onMenuClick?: () => void;
  fullName?: string;
}

export default function Header({
  onMenuClick,
  fullName,
}: HeaderProps) {
  return (
    <header
      dir="rtl"
      className="relative z-50 flex min-h-[104px] items-center justify-between bg-[#061A32] px-5 py-4 text-white shadow-[0_8px_30px_rgba(6,26,50,.16)] sm:px-8 lg:px-12"
    >
      {/* Logo — left side on desktop */}
      <div className="flex items-center gap-4">
        <img
          src="/logo.png"
          alt="Dr.Drive"
          className="h-12 w-auto object-contain sm:h-14"
        />

        <div className="hidden sm:block">
          <p className="text-xl font-black leading-none text-white">
            Dr.Drive
          </p>
          <p className="mt-1 text-sm font-bold text-[#F5B82E]">
            وصلني الآن
          </p>
        </div>
      </div>

      {/* Captain — right side */}
      <div className="flex items-center gap-3 sm:gap-5">
        <button
          type="button"
          aria-label="الإشعارات"
          className="relative flex h-11 w-11 items-center justify-center rounded-full text-white transition hover:bg-white/10"
        >
          <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-[#F5B82E] ring-2 ring-[#061A32]" />
          <Bell size={25} strokeWidth={1.8} />
        </button>

        <div className="hidden text-right sm:block">
          <p className="text-base font-black text-white">
            {fullName ?? "الكابتن"}
          </p>

          <p className="mt-1 flex items-center justify-end gap-1 text-xs text-white/60">
            كابتن
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#F5B82E] text-[9px] font-black text-[#061A32]">
              ✓
            </span>
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white text-[#2563EB] shadow-lg">
          <UserCircle size={40} strokeWidth={1.7} />
        </div>

        <button
          type="button"
          aria-label="القائمة"
          onClick={onMenuClick}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/15 lg:hidden"
        >
          <Menu size={26} />
        </button>
      </div>
    </header>
  );
}
