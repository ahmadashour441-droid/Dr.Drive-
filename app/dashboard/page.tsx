import { cookies } from "next/headers";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  CarFront,
  ChevronLeft,
  CircleDollarSign,
  ClipboardList,
  CreditCard,
  FileText,
  Headphones,
  Wallet,
  TrendingUp,
} from "lucide-react";

import { supabaseServer } from "@/lib/supabaseServer";

export default async function DashboardPage() {
  const cookieStore = await cookies();

  const session = cookieStore.get("drdrive_session");

  if (!session) {
    return null;
  }

  const user = JSON.parse(session.value);

  // =========================
  // الطلبات
  // =========================

  const { data: orders } = await supabaseServer
    .from("Orders")
    .select(`
      *,
      producer:Users!Orders_producer_id_fkey(
        id,
        full_name
      )
    `)
    .eq("captain_id", user.id)
    .eq("is_settled", false)
    .order("created_at", {
      ascending: false,
    });

  // =========================
  // الحركات المالية
  // =========================

  const { data: transactions } = await supabaseServer
    .from("BalanceTransactions")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_settled", false)
    .order("created_at", {
      ascending: false,
    });

  const allOrders = orders ?? [];
  const allTransactions = transactions ?? [];

  // =========================
  // الإحصائيات
  // =========================

  const totalOrders = allOrders.length;

  const unpaidOrders = allOrders.filter(
    (order) => !order.is_settled
  ).length;

  // رصيد المحفظة
  const walletBalance = allTransactions.reduce(
    (sum, trx) =>
      trx.type === "credit"
        ? sum + Number(trx.amount)
        : sum - Number(trx.amount),
    0
  );

  // المستحقات غير المسددة
  const unpaidBalance = allOrders
    .filter((order) => !order.is_settled)
    .reduce(
      (sum, order) =>
        sum + Number(order.captain_due ?? 0),
      0
    );

  // الأرباح بدون عمليات شحن الرصيد
  const totalEarnings = allTransactions
    .filter(
      (trx) =>
        trx.type === "credit" &&
        trx.description !== "شحن رصيد"
    )
    .reduce(
      (sum, trx) =>
        sum + Number(trx.amount),
      0
    );

  const latestOrders = allOrders.slice(0, 5);

  const latestTransactions = allTransactions.slice(0, 5);

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#F5F7FB]"
    >
      <div className="mx-auto w-full max-w-[1500px] space-y-6 p-4 md:p-6 lg:p-8">

        {/* =====================================
            HERO
        ===================================== */}

        <section
          className="
            relative
            min-h-[250px]
            overflow-hidden
            rounded-[28px]
            bg-[#061B35]
            shadow-xl
          "
        >
          {/* Decorative circles */}

          <div className="absolute -left-20 -top-24 h-64 w-64 rounded-full bg-blue-500/10" />

          <div className="absolute -bottom-32 right-20 h-72 w-72 rounded-full bg-[#F5B82E]/10" />

          <div className="absolute right-1/2 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-blue-500/5" />

          <div className="relative z-10 flex min-h-[250px] flex-col justify-between gap-8 p-7 md:flex-row md:items-center md:p-10">

            <div className="max-w-2xl">

              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/80">
                <span className="h-2 w-2 rounded-full bg-green-400" />
                حسابك نشط
              </div>

              <h1 className="text-3xl font-black leading-tight text-white md:text-5xl">
                أهلاً،{" "}
                <span className="text-[#F5B82E]">
                  {user.full_name}
                </span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-7 text-white/65 md:text-base">
                أهلاً بك في بوابة كباتن Dr.Drive.
                تابع طلباتك، رصيدك، ومستحقاتك من مكان واحد.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">

                <Link
                  href="/dashboard/recharge"
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    bg-[#F5B82E]
                    px-5
                    py-3
                    text-sm
                    font-black
                    text-[#061B35]
                    transition
                    hover:bg-yellow-300
                  "
                >
                  <Wallet size={18} />
                  شحن المحفظة
                </Link>

                <Link
                  href="/dashboard/orders"
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-white/15
                    bg-white/10
                    px-5
                    py-3
                    text-sm
                    font-bold
                    text-white
                    transition
                    hover:bg-white/15
                  "
                >
                  طلباتي
                  <ArrowLeft size={18} />
                </Link>

              </div>

            </div>

            {/* سيارة / الهوية البصرية */}

            <div
              className="
                hidden
                h-40
                w-52
                shrink-0
                items-center
                justify-center
                rounded-[28px]
                border
                border-white/10
                bg-white/5
                md:flex
              "
            >
              <div className="text-center">

                <CarFront
                  size={105}
                  strokeWidth={1.2}
                  className="mx-auto text-[#F5B82E]"
                />

                <p className="mt-2 text-xs font-bold tracking-[0.25em] text-white/50">
                  DR.DRIVE
                </p>

              </div>
            </div>

          </div>
        </section>

        {/* =====================================
            WALLET + QUICK ACTIONS
        ===================================== */}

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_1fr]">

          {/* Wallet */}

          <div
            className="
              relative
              overflow-hidden
              rounded-[28px]
              bg-white
              p-6
              shadow-sm
              ring-1
              ring-slate-200
              md:p-8
            "
          >

            <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-blue-50" />

            <div className="relative">

              <div className="flex items-start justify-between">

                <div>

                  <div className="flex items-center gap-3">

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                      <Wallet size={24} />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        رصيد المحفظة
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        الرصيد المتاح حاليًا
                      </p>
                    </div>

                  </div>

                </div>

                <div className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-600">
                  نشط
                </div>

              </div>

              <div className="mt-8">

                <p
                  className={`text-4xl font-black md:text-5xl ${
                    walletBalance >= 0
                      ? "text-slate-900"
                      : "text-red-600"
                  }`}
                >
                  {walletBalance.toFixed(2)}
                  <span className="mr-2 text-lg font-bold text-slate-400">
                    JD
                  </span>
                </p>

              </div>

              <div className="mt-7 flex flex-wrap gap-3">

                <Link
                  href="/dashboard/recharge"
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-blue-600
                    px-5
                    py-3
                    text-sm
                    font-bold
                    text-white
                    transition
                    hover:bg-blue-700
                  "
                >
                  <CreditCard size={18} />
                  شحن الرصيد
                </Link>

                <Link
                  href="/dashboard/accounting"
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-5
                    py-3
                    text-sm
                    font-bold
                    text-slate-700
                    transition
                    hover:bg-slate-50
                  "
                >
                  كشف الحساب
                  <ArrowLeft size={17} />
                </Link>

              </div>

            </div>
          </div>

          {/* Quick Actions */}

          <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8">

            <div className="mb-5">

              <h2 className="text-xl font-black text-slate-900">
                إجراءات سريعة
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                الوصول السريع للخدمات المهمة
              </p>

            </div>

            <div className="grid grid-cols-2 gap-3">

              <Link
                href="/dashboard/orders"
                className="
                  group
                  rounded-2xl
                  border
                  border-slate-100
                  bg-slate-50
                  p-4
                  transition
                  hover:border-blue-100
                  hover:bg-blue-50
                "
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <ClipboardList size={21} />
                </div>

                <p className="mt-3 text-sm font-bold text-slate-800">
                  طلباتي
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {totalOrders} طلب
                </p>
              </Link>

              <Link
                href="/dashboard/accounting"
                className="
                  group
                  rounded-2xl
                  border
                  border-slate-100
                  bg-slate-50
                  p-4
                  transition
                  hover:border-orange-100
                  hover:bg-orange-50
                "
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                  <CircleDollarSign size={21} />
                </div>

                <p className="mt-3 text-sm font-bold text-slate-800">
                  المستحقات
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {unpaidBalance.toFixed(2)} JD
                </p>
              </Link>

              <Link
                href="/dashboard/recharge"
                className="
                  group
                  rounded-2xl
                  border
                  border-slate-100
                  bg-slate-50
                  p-4
                  transition
                  hover:border-green-100
                  hover:bg-green-50
                "
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600">
                  <CreditCard size={21} />
                </div>

                <p className="mt-3 text-sm font-bold text-slate-800">
                  شحن المحفظة
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  شحن رصيد جديد
                </p>
              </Link>

              <Link
                href="/dashboard/profile"
                className="
                  group
                  rounded-2xl
                  border
                  border-slate-100
                  bg-slate-50
                  p-4
                  transition
                  hover:border-purple-100
                  hover:bg-purple-50
                "
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                  <FileText size={21} />
                </div>

                <p className="mt-3 text-sm font-bold text-slate-800">
                  الملف الشخصي
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  بيانات الحساب
                </p>
              </Link>

            </div>
          </div>

        </section>

        {/* =====================================
            STATISTICS
        ===================================== */}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* Orders */}

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">

            <div className="flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <ClipboardList size={22} />
              </div>

              <span className="text-xs font-bold text-slate-400">
                الطلبات
              </span>

            </div>

            <p className="mt-5 text-3xl font-black text-slate-900">
              {totalOrders}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              إجمالي الطلبات غير المسددة
            </p>

          </div>

          {/* Due */}

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">

            <div className="flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <CircleDollarSign size={22} />
              </div>

              <span className="text-xs font-bold text-slate-400">
                المستحقات
              </span>

            </div>

            <p className="mt-5 text-3xl font-black text-orange-600">
              {unpaidBalance.toFixed(2)}
              <span className="mr-1 text-sm">
                JD
              </span>
            </p>

            <p className="mt-1 text-xs text-slate-500">
              مستحقات غير مسددة
            </p>

          </div>

          {/* Earnings */}

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">

            <div className="flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <TrendingUp size={22} />
              </div>

              <span className="text-xs font-bold text-slate-400">
                الأرباح
              </span>

            </div>

            <p className="mt-5 text-3xl font-black text-green-600">
              {totalEarnings.toFixed(2)}
              <span className="mr-1 text-sm">
                JD
              </span>
            </p>

            <p className="mt-1 text-xs text-slate-500">
              إجمالي الأرباح
            </p>

          </div>

          {/* Unpaid orders */}

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">

            <div className="flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <FileText size={22} />
              </div>

              <span className="text-xs font-bold text-slate-400">
                غير مسدد
              </span>

            </div>

            <p className="mt-5 text-3xl font-black text-purple-600">
              {unpaidOrders}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              عدد الطلبات غير المسددة
            </p>

          </div>

        </section>

        {/* =====================================
            LATEST ORDERS
        ===================================== */}

        <section className="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-slate-200">

          <div className="flex flex-col gap-3 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="text-xl font-black text-slate-900">
                آخر الطلبات
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                أحدث الطلبات المسجلة على حسابك
              </p>

            </div>

            <Link
              href="/dashboard/orders"
              className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700"
            >
              عرض جميع الطلبات
              <ChevronLeft size={17} />
            </Link>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[800px]">

              <thead className="bg-slate-50">

                <tr>

                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500">
                    الطلب
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500">
                    المنتج
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500">
                    القيمة
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500">
                    المستحق
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500">
                    الحالة
                  </th>

                </tr>

              </thead>

              <tbody>

                {latestOrders.length > 0 ? (
                  latestOrders.map((order) => (

                    <tr
                      key={order.id}
                      className="border-t border-slate-100 transition hover:bg-slate-50"
                    >

                      <td className="px-6 py-5">

                        <p className="font-bold text-slate-800">
                          #{order.id}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {new Date(
                            order.created_at
                          ).toLocaleString("ar-JO", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>

                      </td>

                      <td className="px-6 py-5">

                        <p className="font-semibold text-slate-700">
                          {order.producer?.full_name ?? "غير محدد"}
                        </p>

                      </td>

                      <td className="px-6 py-5 font-bold text-slate-800">
                        {Number(order.amount).toFixed(2)} JD
                      </td>

                      <td className="px-6 py-5 font-bold text-green-600">
                        {Number(
                          order.captain_due ?? 0
                        ).toFixed(2)} JD
                      </td>

                      <td className="px-6 py-5">

                        <span className="inline-flex rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-600">
                          غير مسدد
                        </span>

                      </td>

                    </tr>

                  ))
                ) : (

                  <tr>

                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center"
                    >

                      <ClipboardList
                        size={40}
                        className="mx-auto text-slate-300"
                      />

                      <p className="mt-3 font-bold text-slate-500">
                        لا توجد طلبات حاليًا
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        ستظهر طلباتك هنا عند تسجيلها
                      </p>

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </section>

        {/* =====================================
            LATEST TRANSACTIONS
        ===================================== */}

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">

          <div className="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-slate-200">

            <div className="flex items-center justify-between border-b border-slate-100 p-6">

              <div>

                <h2 className="text-xl font-black text-slate-900">
                  آخر العمليات
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  آخر الحركات على محفظتك
                </p>

              </div>

              <Link
                href="/dashboard/accounting"
                className="text-sm font-bold text-blue-600"
              >
                كشف الحساب
              </Link>

            </div>

            <div className="divide-y divide-slate-100">

              {latestTransactions.length > 0 ? (
                latestTransactions.map((trx) => (

                  <div
                    key={trx.id}
                    className="flex items-center justify-between gap-4 px-6 py-5"
                  >

                    <div className="flex min-w-0 items-center gap-3">

                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                          trx.type === "credit"
                            ? "bg-green-50 text-green-600"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {trx.type === "credit" ? (
                          <ArrowUpRight size={21} />
                        ) : (
                          <ArrowLeft size={21} />
                        )}
                      </div>

                      <div className="min-w-0">

                        <p className="truncate font-bold text-slate-800">
                          {trx.description ?? "عملية مالية"}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {new Date(
                            trx.created_at
                          ).toLocaleString("ar-JO", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>

                      </div>

                    </div>

                    <p
                      className={`shrink-0 font-black ${
                        trx.type === "credit"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {trx.type === "credit" ? "+" : "-"}
                      {Number(trx.amount).toFixed(2)} JD
                    </p>

                  </div>

                ))
              ) : (

                <div className="px-6 py-12 text-center">

                  <Wallet
                    size={38}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-3 font-bold text-slate-500">
                    لا توجد عمليات بعد
                  </p>

                </div>

              )}

            </div>

          </div>

          {/* Support card */}

          <div
            className="
              relative
              overflow-hidden
              rounded-[28px]
              bg-[#061B35]
              p-7
              text-white
              shadow-sm
            "
          >

            <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-blue-500/10" />

            <div className="relative">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F5B82E] text-[#061B35]">
                <Headphones size={25} />
              </div>

              <h2 className="mt-6 text-2xl font-black">
                تحتاج إلى مساعدة؟
              </h2>

              <p className="mt-3 text-sm leading-7 text-white/60">
                إذا واجهت أي مشكلة في الطلبات أو الرصيد،
                تواصل مع الإدارة وسنساعدك.
              </p>

              <button
                type="button"
                className="
                  mt-7
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-white
                  px-5
                  py-3
                  text-sm
                  font-black
                  text-[#061B35]
                  transition
                  hover:bg-slate-100
                "
              >
                الدعم الفني
                <ArrowLeft size={17} />
              </button>

            </div>

          </div>

        </section>

        {/* Footer */}

        <div className="pb-4 text-center text-xs text-slate-400">
          Dr.Drive وصلني الآن — بوابة الكباتن
        </div>

      </div>
    </main>
  );
}