"use client";

import { Bell, Search } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({
  title,
  subtitle,
}: HeaderProps) {
  return (
    <header className="bg-white border border-slate-200 rounded-3xl shadow-sm px-8 py-6 flex items-center justify-between gap-6">

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-500">
          {subtitle ?? "Welcome back"}
        </p>

        <h1 className="text-2xl xl:text-3xl font-bold text-slate-900 truncate mt-1">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3">

        <div className="relative hidden lg:block">

          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search..."
            className="w-80 h-12 pl-11 pr-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500"
          />

        </div>

        <button className="w-12 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 transition flex items-center justify-center">
          <Bell size={20} />
        </button>

      </div>

    </header>
  );
}