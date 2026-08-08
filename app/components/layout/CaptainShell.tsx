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
      className="min-h-screen bg-[#F3F6FA]"
    >

      {/* Mobile menu */}

      {sidebarOpen && (
        <>

          <div
            className="
              fixed
              inset-0
              z-40
              bg-black/50
              backdrop-blur-sm
              lg:hidden
            "
            onClick={() => setSidebarOpen(false)}
          />

          <aside
            className="
              fixed
              right-0
              top-0
              z-50
              h-screen
              w-[290px]
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

      {/* Header */}

      <Header
        title="لوحة تحكم الكابتن"
        subtitle="مرحباً بك"
        fullName={fullName}
        onMenuClick={() =>
          setSidebarOpen((prev) => !prev)
        }
      />

      {/* Page */}

      <main className="w-full">
        {children}
      </main>

    </div>
  );
}