"use client";

import { Bell, Menu, UserCircle2 } from "lucide-react";

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
        h-[86px]
        w-full
        items-center
        justify-between
        border-b
        border-slate-100
        bg-white
        px-4
        md:px-6
        lg:px-8
      "
    >
      {/* اليمين — العنوان + القائمة */}

      <div className="flex items-center gap-3">

        <button
          type="button"
          onClick={onMenuClick}
          className="
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            bg-slate-50
            text-[#061B35]
            transition
            hover:bg-slate-100
            lg:hidden
          "
          aria-label="فتح القائمة"
        >
          <Menu size={28} strokeWidth={2} />
        </button>

        <div className="hidden sm:block">
          <h1 className="text-xl font-black text-[#061B35] md:text-2xl">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-1 text-xs text-slate-400">
              {subtitle}
            </p>
          )}
        </div>

      </div>

      {/* الوسط — فارغ على الموبايل */}

      <div className="hidden flex-1 md:block" />

      {/* اليسار — المستخدم + الإشعارات */}

      <div className="flex items-center gap-3">

        {/* الإشعارات */}

        <button
          type="button"
          className="
            relative
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            bg-slate-50
            text-[#061B35]
            transition
            hover:bg-slate-100
          "
          aria-label="الإشعارات"
        >
          <Bell size={26} strokeWidth={1.8} />

          <span
            className="
              absolute
              right-3
              top-3
              h-2.5
              w-2.5
              rounded-full
              bg-red-500
              ring-2
              ring-white
            "
          />
        </button>

        {/* المستخدم */}

        <div className="flex items-center gap-3">

          <div className="hidden text-right sm:block">

            <p className="text-sm font-black text-[#061B35]">
              {fullName ?? "الكابتن"}
            </p>

            <p className="mt-0.5 text-xs text-slate-400">
              كابتن Dr.Drive
            </p>

          </div>

          <div
            className="
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-full
              bg-blue-50
              text-blue-600
            "
          >
            <UserCircle2
              size={42}
              strokeWidth={1.6}
            />
          </div>

        </div>

      </div>

    </header>
  );
}