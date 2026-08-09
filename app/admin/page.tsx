import Link from "next/link";
import { supabaseServer } from "@/lib/supabaseServer";

export default async function AdminPage() {
  const [
    ordersResult,
    usersResult,
    rechargeResult,
    withdrawalResult,
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

    supabaseServer
      .from("WithdrawalRequests")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("status", "pending"),
  ]);

  const ordersCount = ordersResult.count ?? 0;
  const usersCount = usersResult.count ?? 0;
  const rechargeCount = rechargeResult.count ?? 0;
  const withdrawalCount = withdrawalResult.count ?? 0;

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#EEF3F9] px-5 py-8 text-[#13294B] sm:px-8 lg:px-12"
    >
      <div className="mx-auto max-w-[1400px]">

        {/* ========================= HEADER ========================= */}

        <div className="mb-8">
          <h1 className="text-3xl font-black">
            لوحة التحكم
          </h1>

          <p className="mt-2 text-gray-500">
            مرحباً بك في لوحة تحكم DR.Drive-وصلني الآن
          </p>
        </div>

        {/* ========================= CARDS ========================= */}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          {/* الطلبات */}

          <Link
            href="/admin/orders"
            className="rounded-2xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
          >
            <p className="text-gray-500">
              إجمالي الطلبات
            </p>

            <h2 className="mt-4 text-3xl font-bold text-blue-600 md:text-4xl">
              {ordersCount}
            </h2>
          </Link>

          {/* المستخدمون */}

          <Link
            href="/admin/users"
            className="rounded-2xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
          >
            <p className="text-gray-500">
              المستخدمون
            </p>

            <h2 className="mt-4 text-3xl font-bold text-green-600 md:text-4xl">
              {usersCount}
            </h2>
          </Link>

          {/* شحن الرصيد */}

          <Link
            href="/admin/recharge"
            className="rounded-2xl border-2 border-yellow-400 bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
          >
            <p className="text-gray-500">
              طلبات شحن الرصيد
            </p>

            <h2 className="mt-4 text-3xl font-bold text-yellow-600 md:text-4xl">
              {rechargeCount}
            </h2>

            {rechargeCount > 0 && (
              <p className="mt-3 font-bold text-red-600">
                يوجد طلبات بانتظار المراجعة
              </p>
            )}
          </Link>

          {/* =========================
              طلبات سحب المستحقات
          ========================= */}

          <Link
            href="/admin/withdrawals"
            className={`rounded-2xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg ${
              withdrawalCount > 0
                ? "border-2 border-red-400"
                : "border border-slate-100"
            }`}
          >
            <p className="text-gray-500">
              طلبات سحب المستحقات
            </p>

            <h2 className="mt-4 text-3xl font-bold text-purple-600 md:text-4xl">
              {withdrawalCount}
            </h2>

            {withdrawalCount > 0 && (
              <p className="mt-3 font-bold text-red-600">
                يوجد طلبات سحب بانتظار المراجعة
              </p>
            )}

            {withdrawalCount === 0 && (
              <p className="mt-3 text-sm text-gray-400">
                لا توجد طلبات بانتظار المراجعة
              </p>
            )}
          </Link>

          {/* المحاسبة */}

          <Link
            href="/admin/accounting"
            className="rounded-2xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
          >
            <p className="text-gray-500">
              المحاسبة
            </p>

            <h2 className="mt-4 text-2xl font-bold">
              فتح الصفحة
            </h2>
          </Link>

          {/* الإعدادات */}

          <Link
            href="/admin/settings"
            className="rounded-2xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
          >
            <p className="text-gray-500">
              الإعدادات
            </p>

            <h2 className="mt-4 text-2xl font-bold">
              فتح الصفحة
            </h2>
          </Link>

        </div>
      </div>
    </main>
  );
}