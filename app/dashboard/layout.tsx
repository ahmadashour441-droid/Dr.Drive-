import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import CaptainShell from "@/app/components/layout/CaptainShell";

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
    <CaptainShell fullName={user.full_name}>{children}</CaptainShell>
  );
}