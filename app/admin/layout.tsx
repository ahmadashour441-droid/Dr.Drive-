import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import AdminShell from "../components/layout/AdminShell";

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
    <AdminShell fullName={user.full_name}>
      {children}
    </AdminShell>
  );
}
