import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseServer } from "../../../lib/supabaseServer";

export default async function ProfilePage() {
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

  const { data: captain, error } = await supabaseServer
    .from("Users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !captain) {
    console.error(error);
    redirect("/");
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          الملف الشخصي
        </h1>

        <p className="mt-2 text-gray-500">
          بيانات حساب الكابتن.
        </p>
      </div>

      <div className="rounded-xl bg-white shadow">
        <div className="grid gap-6 p-8 md:grid-cols-2">
          <div>
            <label className="text-sm text-gray-500">
              الاسم
            </label>

            <div className="mt-2 rounded-lg border bg-gray-50 p-3">
              {captain.full_name}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-500">
              رقم الهاتف
            </label>

            <div className="mt-2 rounded-lg border bg-gray-50 p-3">
              {captain.phone}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-500">
              نوع المركبة
            </label>

            <div className="mt-2 rounded-lg border bg-gray-50 p-3">
              {captain.vehicle_type}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-500">
              رقم المركبة
            </label>

            <div className="mt-2 rounded-lg border bg-gray-50 p-3">
              {captain.vehicle_number}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-500">
              كود الدخول
            </label>

            <div className="mt-2 rounded-lg border bg-gray-50 p-3">
              {captain.login_code}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-500">
              الحالة
            </label>

            <div className="mt-2 rounded-lg border bg-gray-50 p-3">
              {captain.status}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}