"use client";

import {
  Bell,
  Menu,
  Search,
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
        flex
        h-[82px]
        items-center
        justify-between
        border-b
        border-slate-200
        bg-white
        px-4
        shadow-sm
        md:px-8
      "
    >
      {/* يمين الهيدر */}

      <div className="flex items-center gap-3">

        <div className="hidden text-right sm:block">
          <p className="text-lg font-bold text-slate-800">
            {fullName ?? "الكابتن"}
          </p>

          <p className="text-xs text-slate-500">
            Dr.Drive وصلني الآن
          </p>
        </div>

        <div
          className="
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-full
            border-2
            border-blue-600
            bg-white
          "
        >
          <UserCircle2
            size={34}
            className="text-blue-600"
          />
        </div>

      </div>

      {/* البحث */}

      <div className="hidden md:block">

        <div
          className="
            relative
            flex
            h-11
            w-[300px]
            items-center
            rounded-full
            border
            border-slate-300
            bg-slate-50
          "
        >

          <Search
            size={18}
            className="absolute right-4 text-slate-400"
          />

          <input
            type="text"
            placeholder="بحث..."
            className="
              h-full
              w-full
              rounded-full
              bg-transparent
              px-11
              text-sm
              outline-none
            "
          />

        </div>

      </div>

      {/* اليسار */}

      <div className="flex items-center gap-2">

        <button
          type="button"
          className="
            relative
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-full
            transition
            hover:bg-slate-100
          "
        >

          <Bell
            size={25}
            className="text-slate-700"
          />

          <span
            className="
              absolute
              right-2
              top-2
              h-2.5
              w-2.5
              rounded-full
              bg-yellow-400
            "
          />

        </button>

        <button
          type="button"
          onClick={onMenuClick}
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            transition
            hover:bg-slate-100
            lg:hidden
          "
        >

          <Menu
            size={28}
            className="text-slate-700"
          />

        </button>

      </div>

    </header>
  );
}