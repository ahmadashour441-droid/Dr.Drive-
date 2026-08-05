import Link from "next/link";
import { supabaseServer } from "@/lib/supabaseServer";

export default async function AdminPage() {

  const [
    ordersResult,
    usersResult,
    rechargeResult,
  ] = await Promise.all([

    supabaseServer
      .from("Orders")
      .select("*", {
        count: "exact",
        head: true,
      }),

    supabaseServer
      .from("Users")
      .select("*", {
        count: "exact",
        head: true,
      }),

    supabaseServer
      .from("RechargeRequests")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("status", "pending"),

  ]);

  const ordersCount =
    ordersResult.count ?? 0;

  const usersCount =
    usersResult.count ?? 0;

  const rechargeCount =
    rechargeResult.count ?? 0;

  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">لوحة التحكم</h1>
        <p className="mt-2 text-gray-500">
          مرحباً بك في لوحة تحكم DR.Drive-وصلني الآن
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <Link
          href="/admin/orders"
          className="rounded-2xl bg-white p-6 shadow hover:shadow-lg transition"
        >
          <p className="text-gray-500">إجمالي الطلبات</p>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold text-blue-600">
            {ordersCount}
          </h2>
        </Link>

        <Link
          href="/admin/users"
          className="rounded-2xl bg-white p-6 shadow hover:shadow-lg transition"
        >
          <p className="text-gray-500">المستخدمون</p>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold text-green-600">
            {usersCount}
          </h2>
        </Link>

        <Link
          href="/admin/recharge"
          className="rounded-2xl bg-white p-6 shadow hover:shadow-lg transition border-2 border-yellow-400"
        >
          <p className="text-gray-500">طلبات شحن الرصيد</p>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold text-yellow-600">
            {rechargeCount}
          </h2>

          {rechargeCount > 0 && (
            <p className="mt-3 text-red-600 font-bold">
              يوجد طلبات بانتظار المراجعة
            </p>
          )}
        </Link>

        <Link
          href="/admin/accounting"
          className="rounded-2xl bg-white p-6 shadow hover:shadow-lg transition"
        >
          <p className="text-gray-500">المحاسبة</p>
          <h2 className="mt-4 text-2xl font-bold">فتح الصفحة</h2>
        </Link>

        <Link
          href="/admin/settings"
          className="rounded-2xl bg-white p-6 shadow hover:shadow-lg transition"
        >
          <p className="text-gray-500">الإعدادات</p>
          <h2 className="mt-4 text-2xl font-bold">فتح الصفحة</h2>
        </Link>
      </div>
    </main>
  );
}