import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import CaptainSidebar from "@/app/components/layout/CaptainSidebar";
import Navbar from "@/app/components/dashboard/Navbar";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();

  const session = cookieStore.get("drdrive_session");

  if (!session) {
    redirect("/");
  }

  let user: any;

  try {
    user = JSON.parse(session.value);
  } catch {
    redirect("/");
  }

  if (!user.is_captain) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-slate-100">

      <CaptainSidebar />

      <div className="flex flex-1 flex-col">

        <Navbar fullName={user.full_name} />

        <main className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </main>

      </div>

    </div>
  );
}