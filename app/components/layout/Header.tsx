"use client";

import { Bell, Menu, Search, UserCircle2 } from "lucide-react";

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
    <header className="sticky top-0 z-40 flex h-16 md:h-20 items-center justify-between border-b bg-white px-4 md:px-8">

      {/* اليسار */}
      <div className="flex items-center gap-3">

        <button
          onClick={onMenuClick}
          className="rounded-xl p-2 hover:bg-slate-100 lg:hidden"
        >
          <Menu size={24} />
        </button>

        <div>

          <p className="hidden text-sm text-slate-500 md:block">
            {subtitle ?? "مرحباً بك"}
          </p>

          <h1 className="text-lg font-bold md:text-2xl">
            {title}
          </h1>

        </div>

      </div>

      {/* الوسط */}
      <div className="hidden xl:block">

        <div className="relative">

          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="بحث..."
            className="h-11 w-80 rounded-2xl border bg-slate-50 pl-11 pr-4 outline-none transition focus:border-blue-500"
          />

        </div>

      </div>

      {/* اليمين */}

      <div className="flex items-center gap-3">

        <button className="relative rounded-xl p-2 hover:bg-slate-100">

          <Bell size={22} />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />

        </button>

        <div className="flex items-center gap-2">

          <UserCircle2
            size={42}
            className="text-blue-600"
          />

          <div className="hidden md:block">

            <p className="font-semibold">
              {fullName ?? "Administrator"}
            </p>

            <p className="text-xs text-slate-500">
              DR.Drive وصلني الآن
            </p>

          </div>

        </div>

      </div>

    </header>
  );
}