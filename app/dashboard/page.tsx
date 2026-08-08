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
  UserCircle,
} from "lucide-react";

import { supabaseServer } from "@/lib/supabaseServer";

export default async function DashboardPage() {
  const cookieStore = await cookies();

  const session =
    cookieStore.get("drdrive_session");

  if (!session) {
    return null;
  }

  const user = JSON.parse(session.value);

  // =========================
  // ORDERS
  // =========================

  const { data: orders } =
    await supabaseServer
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
  // TRANSACTIONS
  // =========================

  const { data: transactions } =
    await supabaseServer
      .from("BalanceTransactions")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_settled", false)
      .order("created_at", {
        ascending: false,
      });

  const allOrders = orders ?? [];
  const allTransactions =
    transactions ?? [];

  // =========================
  // STATISTICS
  // =========================

  const totalOrders =
    allOrders.length;

  const unpaidOrders =
    allOrders.filter(
      (order) => !order.is_settled
    ).length;

  const walletBalance =
    allTransactions.reduce(
      (sum, trx) =>
        trx.type === "credit"
          ? sum + Number(trx.amount)
          : sum - Number(trx.amount),
      0
    );

  const unpaidBalance =
    allOrders
      .filter(
        (order) => !order.is_settled
      )
      .reduce(
        (sum, order) =>
          sum +
          Number(
            order.captain_due ?? 0
          ),
        0
      );

  const totalEarnings =
    allTransactions
      .filter(
        (trx) =>
          trx.type === "credit" &&
          trx.description !==
            "شحن رصيد"
      )
      .reduce(
        (sum, trx) =>
          sum + Number(trx.amount),
        0
      );

  const latestOrders =
    allOrders.slice(0, 5);

  const latestTransactions =
    allTransactions.slice(0, 5);

  return (
    <main
      dir="rtl"
      className="
        min-h-full
        bg-[#F4F7FB]
      "
    >

      <div
        className="
          mx-auto
          w-full
          max-w-[1450px]
          space-y-6
        "
      >

        {/* =====================================================
            HERO
        ===================================================== */}

        <section
          className="
            relative
            overflow-hidden
            rounded-[30px]
            bg-[#061B35]
            shadow-[0_15px_45px_rgba(6,27,53,0.16)]
          "
        >

          <div
            className="
              absolute
              -right-24
              -top-28
              h-80
              w-80
              rounded-full
              bg-blue-500/10
            "
          />

          <div
            className="
              absolute
              -bottom-40
              right-1/3
              h-80
              w-80
              rounded-full
              bg-[#F5B82E]/10
            "
          />

          <div
            className="
              relative
              flex
              min-h-[300px]
              flex-col
              justify-center
              gap-8
              px-6
              py-8
              md:flex-row
              md:items-center
              md:justify-between
              md:px-10
              lg:px-12
            "
          >

            {/* TEXT */}

            <div className="flex-1">

              <div
                className="
                  mb-4
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-white/10
                  bg-white/10
                  px-4
                  py-2
                  text-xs
                  font-bold
                  text-white/80
                "
              >

                <span className="h-2 w-2 rounded-full bg-green-400" />

                حسابك نشط

              </div>

              <h1
                className="
                  text-3xl
                  font-black
                  leading-tight
                  text-white
                  sm:text-4xl
                  md:text-5xl
                "
              >
                أهلاً،{" "}
                <span className="text-[#F5B82E]">
                  {user.full_name}
                </span>
              </h1>

              <p
                className="
                  mt-4
                  max-w-xl
                  text-sm
                  leading-7
                  text-white/60
                  md:text-base
                "
              >
                أهلاً بك في بوابة كباتن
                Dr.Drive. تابع طلباتك،
                رصيدك ومستحقاتك من مكان واحد.
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
                    hover:bg-white/15
                  "
                >
                  طلباتي
                  <ArrowLeft size={18} />
                </Link>

              </div>

            </div>

            {/* CAR */}

            <div
              className="
                hidden
                h-48
                w-60
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

                <div
                  className="
                    mx-auto
                    flex
                    h-28
                    w-28
                    items-center
                    justify-center
                    rounded-full
                    bg-[#F5B82E]/10
                  "
                >
                  <CarFront
                    size={78}
                    strokeWidth={1.2}
                    className="text-[#F5B82E]"
                  />
                </div>

                <p
                  className="
                    mt-3
                    text-xs
                    font-black
                    tracking-[0.3em]
                    text-white/40
                  "
                >
                  DR.DRIVE
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            WALLET + QUICK ACTIONS
        ===================================================== */}

        <section
          className="
            grid
            grid-cols-1
            gap-5
            xl:grid-cols-[1.3fr_0.7fr]
          "
        >

          {/* WALLET */}

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

            <div
              className="
                absolute
                -left-12
                -top-12
                h-36
                w-36
                rounded-full
                bg-blue-50
              "
            />

            <div className="relative">

              <div
                className="
                  flex
                  items-start
                  justify-between
                "
              >

                <div className="flex items-center gap-3">

                  <div
                    className="
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-2xl
                      bg-blue-50
                      text-blue-600
                    "
                  >
                    <Wallet size={25} />
                  </div>

                  <div>

                    <p className="text-sm font-bold text-slate-500">
                      رصيد المحفظة
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      الرصيد المتاح حاليًا
                    </p>

                  </div>

                </div>

                <span
                  className="
                    rounded-full
                    bg-green-50
                    px-3
                    py-1.5
                    text-xs
                    font-bold
                    text-green-600
                  "
                >
                  نشط
                </span>

              </div>

              <p
                className={`
                  mt-8
                  text-4xl
                  font-black
                  md:text-5xl
                  ${
                    walletBalance >= 0
                      ? "text-slate-900"
                      : "text-red-600"
                  }
                `}
              >

                {walletBalance.toFixed(2)}

                <span className="mr-2 text-lg text-slate-400">
                  JD
                </span>

              </p>

              <div className="mt-7 flex flex-wrap gap-3">

                <Link
                  href="/dashboard/recharge"
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    bg-blue-600
                    px-5
                    py-3
                    text-sm
                    font-bold
                    text-white
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
                    gap-2
                    rounded-xl
                    border
                    border-slate-200
                    px-5
                    py-3
                    text-sm
                    font-bold
                    text-slate-700
                    hover:bg-slate-50
                  "
                >
                  كشف الحساب
                  <ArrowLeft size={17} />
                </Link>

              </div>

            </div>

          </div>


          {/* QUICK ACTIONS */}

          <div
            className="
              rounded-[28px]
              bg-white
              p-6
              shadow-sm
              ring-1
              ring-slate-200
              md:p-7
            "
          >

            <h2 className="text-xl font-black text-slate-900">
              إجراءات سريعة
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              الوصول السريع للخدمات المهمة
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">

              {[
                {
                  href: "/dashboard/orders",
                  title: "طلباتي",
                  text: `${totalOrders} طلب`,
                  icon: ClipboardList,
                  color: "blue",
                },
                {
                  href: "/dashboard/accounting",
                  title: "المستحقات",
                  text: `${unpaidBalance.toFixed(2)} JD`,
                  icon: CircleDollarSign,
                  color: "orange",
                },
                {
                  href: "/dashboard/recharge",
                  title: "شحن المحفظة",
                  text: "شحن رصيد جديد",
                  icon: CreditCard,
                  color: "green",
                },
                {
                  href: "/dashboard/profile",
                  title: "الملف الشخصي",
                  text: "بيانات الحساب",
                  icon: UserCircle,
                  color: "purple",
                },
              ].map((item) => {

                const Icon = item.icon;

                const colors: Record<
                  string,
                  string
                > = {
                  blue:
                    "bg-blue-50 text-blue-600",
                  orange:
                    "bg-orange-50 text-orange-600",
                  green:
                    "bg-green-50 text-green-600",
                  purple:
                    "bg-purple-50 text-purple-600",
                };

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="
                      rounded-2xl
                      border
                      border-slate-100
                      bg-slate-50
                      p-4
                      hover:bg-slate-100
                    "
                  >

                    <div
                      className={`
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-xl
                        ${colors[item.color]}
                      `}
                    >
                      <Icon size={20} />
                    </div>

                    <p className="mt-3 text-sm font-black text-slate-800">
                      {item.title}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {item.text}
                    </p>

                  </Link>
                );
              })}

            </div>

          </div>

        </section>


        {/* =====================================================
            STATISTICS
        ===================================================== */}

        <section
          className="
            grid
            grid-cols-2
            gap-3
            lg:grid-cols-4
          "
        >

          {[
            {
              title: "الطلبات",
              value: totalOrders,
              subtitle: "طلب غير مسدد",
              icon: ClipboardList,
              color:
                "bg-blue-50 text-blue-600",
              valueColor:
                "text-slate-900",
            },
            {
              title: "المستحقات",
              value:
                `${unpaidBalance.toFixed(2)} JD`,
              subtitle: "غير مسددة",
              icon: CircleDollarSign,
              color:
                "bg-orange-50 text-orange-600",
              valueColor:
                "text-orange-600",
            },
            {
              title: "الأرباح",
              value:
                `${totalEarnings.toFixed(2)} JD`,
              subtitle: "إجمالي الأرباح",
              icon: TrendingUp,
              color:
                "bg-green-50 text-green-600",
              valueColor:
                "text-green-600",
            },
            {
              title: "غير مسدد",
              value: unpaidOrders,
              subtitle: "عدد الطلبات",
              icon: FileText,
              color:
                "bg-purple-50 text-purple-600",
              valueColor:
                "text-purple-600",
            },
          ].map((item) => {

            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="
                  rounded-2xl
                  bg-white
                  p-4
                  shadow-sm
                  ring-1
                  ring-slate-200
                  sm:p-5
                "
              >

                <div className="flex items-center justify-between">

                  <div
                    className={`
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-xl
                      ${item.color}
                    `}
                  >
                    <Icon size={20} />
                  </div>

                  <span className="text-xs font-bold text-slate-400">
                    {item.title}
                  </span>

                </div>

                <p
                  className={`
                    mt-4
                    text-2xl
                    font-black
                    sm:text-3xl
                    ${item.valueColor}
                  `}
                >
                  {item.value}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {item.subtitle}
                </p>

              </div>
            );
          })}

        </section>


        {/* =====================================================
            LATEST ORDERS
        ===================================================== */}

        <section
          className="
            hidden
            overflow-hidden
            rounded-[28px]
            bg-white
            shadow-sm
            ring-1
            ring-slate-200
            md:block
          "
        >

          <div
            className="
              flex
              items-center
              justify-between
              border-b
              border-slate-100
              p-6
            "
          >

            <div>

              <h2 className="text-xl font-black">
                آخر الطلبات
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                أحدث الطلبات المسجلة على حسابك
              </p>

            </div>

            <Link
              href="/dashboard/orders"
              className="
                inline-flex
                items-center
                gap-1
                text-sm
                font-bold
                text-blue-600
              "
            >
              عرض الكل
              <ChevronLeft size={17} />
            </Link>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full">

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
                      className="border-t border-slate-100"
                    >

                      <td className="px-6 py-5">

                        <p className="font-bold text-slate-800">
                          #{order.id}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {new Date(
                            order.created_at
                          ).toLocaleString(
                            "ar-JO",
                            {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>

                      </td>

                      <td className="px-6 py-5 font-semibold">
                        {order.producer?.full_name ??
                          "غير محدد"}
                      </td>

                      <td className="px-6 py-5 font-bold">
                        {Number(
                          order.amount
                        ).toFixed(2)}{" "}
                        JD
                      </td>

                      <td className="px-6 py-5 font-bold text-green-600">
                        {Number(
                          order.captain_due ?? 0
                        ).toFixed(2)}{" "}
                        JD
                      </td>

                      <td className="px-6 py-5">

                        <span
                          className="
                            rounded-full
                            bg-orange-50
                            px-3
                            py-1.5
                            text-xs
                            font-bold
                            text-orange-600
                          "
                        >
                          غير مسدد
                        </span>

                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-slate-400"
                    >
                      لا توجد طلبات حاليًا
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>

        </section>


        {/* =====================================================
            TRANSACTIONS + SUPPORT
        ===================================================== */}

        <section
          className="
            grid
            grid-cols-1
            gap-5
            xl:grid-cols-[1.4fr_0.6fr]
          "
        >

          {/* TRANSACTIONS */}

          <div
            className="
              overflow-hidden
              rounded-[28px]
              bg-white
              shadow-sm
              ring-1
              ring-slate-200
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
                border-b
                border-slate-100
                p-6
              "
            >

              <div>

                <h2 className="text-xl font-black">
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
                    className="
                      flex
                      items-center
                      justify-between
                      gap-4
                      px-6
                      py-5
                    "
                  >

                    <div className="flex min-w-0 items-center gap-3">

                      <div
                        className={`
                          flex
                          h-11
                          w-11
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          ${
                            trx.type === "credit"
                              ? "bg-green-50 text-green-600"
                              : "bg-red-50 text-red-600"
                          }
                        `}
                      >

                        {trx.type === "credit" ? (
                          <ArrowUpRight size={21} />
                        ) : (
                          <ArrowLeft size={21} />
                        )}

                      </div>

                      <div className="min-w-0">

                        <p className="truncate font-bold text-slate-800">
                          {trx.description ??
                            "عملية مالية"}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {new Date(
                            trx.created_at
                          ).toLocaleString(
                            "ar-JO",
                            {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>

                      </div>

                    </div>

                    <p
                      className={`
                        shrink-0
                        font-black
                        ${
                          trx.type === "credit"
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      `}
                    >
                      {trx.type === "credit"
                        ? "+"
                        : "-"}
                      {Number(
                        trx.amount
                      ).toFixed(2)}{" "}
                      JD
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


          {/* SUPPORT */}

          <div
            className="
              relative
              overflow-hidden
              rounded-[28px]
              bg-[#061B35]
              p-7
              text-white
            "
          >

            <div
              className="
                absolute
                -left-16
                -top-16
                h-48
                w-48
                rounded-full
                bg-blue-500/10
              "
            />

            <div className="relative">

              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-2xl
                  bg-[#F5B82E]
                  text-[#061B35]
                "
              >
                <Headphones size={24} />
              </div>

              <h2 className="mt-6 text-2xl font-black">
                تحتاج إلى مساعدة؟
              </h2>

              <p className="mt-3 text-sm leading-7 text-white/60">
                إذا واجهت أي مشكلة في الطلبات
                أو الرصيد، تواصل مع الإدارة
                وسنساعدك.
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
                "
              >
                الدعم الفني
                <ArrowLeft size={17} />
              </button>

            </div>

          </div>

        </section>


        <div className="py-3 text-center text-xs text-slate-400">
          Dr.Drive وصلني الآن — بوابة الكباتن
        </div>

      </div>

    </main>
  );
}