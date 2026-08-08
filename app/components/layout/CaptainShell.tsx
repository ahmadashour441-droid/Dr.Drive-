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
    <div
      dir="rtl"
      className="flex min-h-screen w-full bg-[#F5F7FB]"
    >

      {/* =====================
          DESKTOP SIDEBAR
      ====================== */}

      <aside className="hidden h-screen w-72 shrink-0 lg:block">

        <div className="h-full w-full">
          <CaptainSidebar />
        </div>

      </aside>

      {/* =====================
          MOBILE SIDEBAR
      ====================== */}

      {sidebarOpen && (
        <>

          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />

          <aside
            className="
              fixed
              right-0
              top-0
              z-50
              h-screen
              w-72
              max-w-[85vw]
              lg:hidden
            "
          >
            <CaptainSidebar
              onNavigate={() =>
                setSidebarOpen(false)
              }
            />
          </aside>

        </>
      )}

      {/* =====================
          MAIN
      ====================== */}

      <div className="flex min-w-0 flex-1 flex-col">

        <Header
          title="لوحة التحكم"
          subtitle="مرحباً بك"
          fullName={fullName}
          onMenuClick={() =>
            setSidebarOpen((prev) => !prev)
          }
        />

        <main
          className="
            min-w-0
            flex-1
            overflow-x-hidden
            p-3
            sm:p-4
            md:p-6
            lg:p-8
          "
        >
          {children}
        </main>

      </div>

    </div>
  );
}