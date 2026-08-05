"use client";

import { ReactNode, useState } from "react";
import Header from "./Header";
import AdminSidebar from "./AdminSidebar";

interface Props {
  children: ReactNode;
  fullName: string;
}

export default function AdminShell({
  children,
  fullName,
}: Props) {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-100">

      {/* Desktop Sidebar */}

      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {/* Mobile Drawer */}

      {sidebarOpen && (
        <>

          {/* Overlay */}

          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Sidebar */}

          <div className="fixed left-0 top-0 z-50 h-full w-72 bg-slate-900 shadow-2xl lg:hidden">

            <AdminSidebar
  onNavigate={() => setSidebarOpen(false)}
/>

          </div>

        </>
      )}

      {/* Content */}

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