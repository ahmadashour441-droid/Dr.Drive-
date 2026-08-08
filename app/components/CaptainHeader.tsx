"use client";

import {
  Bell,
  Menu,
  Search,
  UserCircle2,
} from "lucide-react";

interface Props {
  fullName?: string;
  onMenuClick?: () => void;
}

export default function CaptainHeader({
  fullName,
  onMenuClick,
}: Props) {
  return (
    <header
      dir="rtl"
      className="
        sticky
        top-0
        z-30
        flex
        h-[76px]
        w-full
        items-center
        justify-between
        border-b
        border-slate-200
        bg-white/95
        px-4
        backdrop-blur
        sm:px-6
        lg:px-8
      "
    >
      {/* RIGHT */}

      <div className="flex items-center gap-3">

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
            bg-slate-100
            text-slate-700
            hover:bg-slate-200
            lg:hidden
          "
        >
          <Menu size={22} />
        </button>

        <div>
          <p className="hidden text-xs text-slate-400 sm:block">
            مرحباً بك
          </p>

          <h1 className="text-lg font-black text-slate-900 sm:text-xl">
            لوحة تحكم الكابتن
          </h1>
        </div>

      </div>

      {/* CENTER */}

      <div className="hidden lg:block">

        <div className="relative">

          <Search
            size={18}
            className="
              absolute
              right-4
              top-1/2
              -translate-y-1/2
              text-slate-400
            "
          />

          <input
            type="text"
            placeholder="بحث..."
            className="
              h-11
              w-72
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              pr-11
              pl-4
              text-sm
              outline-none
              focus:border-blue-500
              focus:bg-white
            "
          />

        </div>

      </div>

      {/* LEFT */}

      <div className="flex items-center gap-3">

        <button
          type="button"
          className="
            relative
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            bg-slate-50
            text-slate-600
            hover:bg-slate-100
          "
        >
          <Bell size={21} />

          <span
            className="
              absolute
              right-2
              top-2
              h-2
              w-2
              rounded-full
              bg-red-500
            "
          />
        </button>

        <div className="flex items-center gap-3">

          <div className="hidden text-left sm:block">

            <p className="text-sm font-black text-slate-800">
              {fullName ?? "الكابتن"}
            </p>

            <p className="mt-0.5 text-xs text-slate-400">
              Dr.Drive
            </p>

          </div>

          <UserCircle2
            size={42}
            strokeWidth={1.6}
            className="text-blue-600"
          />

        </div>

      </div>

    </header>
  );
}