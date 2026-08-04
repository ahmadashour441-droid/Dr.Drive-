import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import CaptainSidebar from "@/app/components/layout/CaptainSidebar";

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
    <div className="flex min-h-screen bg-gray-100">
      <CaptainSidebar />

      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}