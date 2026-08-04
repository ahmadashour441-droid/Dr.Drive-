import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AdminSidebar from "../components/layout/AdminSidebar";

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

      <main className="flex-1 min-h-screen overflow-auto bg-slate-50 p-8">
        {children}
      </main>
    </div>
  );
}