"use client";

import { ReactNode, useState } from "react";
import Header from "./Header";
import CaptainSidebar from "./CaptainSidebar";

interface Props {
  children: ReactNode;
  fullName: string;
}

export default function CaptainShell({
  children,
  fullName,
}: Props) {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-100">

      {/* Desktop Sidebar */}

      <div className="hidden lg:block">
        <CaptainSidebar />
      </div>

      {/* Mobile Drawer */}

      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />

          <div className="fixed left-0 top-0 z-50 h-full w-64 max-w-[85vw] shadow-2xl lg:hidden">

            <CaptainSidebar
              onNavigate={() => setSidebarOpen(false)}
            />

          </div>
        </>
      )}

      <div className="flex flex-1 flex-col">

        <Header
          title="لوحة التحكم"
          subtitle="مرحباً بك"
          fullName={fullName}
          onMenuClick={() => setSidebarOpen((prev) => !prev)}
        />

        <main className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </main>

      </div>

    </div>
  );
}