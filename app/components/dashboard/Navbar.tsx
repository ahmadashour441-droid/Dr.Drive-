"use client";

import { Bell, Menu, UserCircle2 } from "lucide-react";

type Props = {
  fullName?: string;
};

export default function Navbar({ fullName }: Props) {
  return (
    <header className="h-20 bg-white border-b px-6 flex items-center justify-between">

      <div className="flex items-center gap-3">
        <button className="lg:hidden">
          <Menu size={26} />
        </button>

        <div>
          <h2 className="text-xl font-bold">
            لوحة التحكم
          </h2>

          <p className="text-sm text-gray-500">
            أهلاً {fullName || "بك"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">

        <button className="relative">
          <Bell size={22} />

          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
        </button>

        <div className="flex items-center gap-2">

          <UserCircle2
            size={42}
            className="text-blue-600"
          />

          <div className="hidden md:block">
            <p className="font-semibold">
              {fullName || "Captain"}
            </p>

            <p className="text-xs text-gray-500">
              Dr.Driveوصلني الآن
            </p>
          </div>

        </div>
      </div>

    </header>
  );
}