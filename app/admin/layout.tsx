import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AdminSidebar from "../components/layout/AdminSidebar";
import Navbar from "../components/dashboard/Navbar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();

  const session = cookieStore.get("drdrive_session");

  if (!session) {
    redirect("/");
  }

  let user: any = null;

  try {
    user = JSON.parse(session.value);
  } catch {
    redirect("/");
  }

  if (!user.is_admin) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-slate-100">

      <AdminSidebar />

      <div className="flex flex-1 flex-col">

        <Navbar fullName={user.full_name} />

        <main className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </main>

      </div>

    </div>
  );
}