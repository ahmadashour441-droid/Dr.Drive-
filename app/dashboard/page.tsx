import { cookies } from "next/headers";
import Link from "next/link";

import {
  ArrowLeft,
  ArrowUpRight,
  Bell,
  ClipboardList,
  CreditCard,
  FileText,
  Headphones,
  Menu,
  UserCircle2,
  Wallet,
  CircleDollarSign,
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

  // =====================================================
  // ORDERS
  // =====================================================

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

  // =====================================================
  // BALANCE TRANSACTIONS
  // =====================================================

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

  // =====================================================
  // STATISTICS
  // =====================================================

  const totalOrders = allOrders.length;

  const unpaidOrders = allOrders.filter(
    (order) => !order.is_settled
  ).length;

  const walletBalance = allTransactions.reduce(
    (sum, trx) => {
      if (trx.type === "credit") {
        return sum + Number(trx.amount);
      }

      return sum - Number(trx.amount);
    },
    0
  );

  const unpaidBalance = allOrders
    .filter((order) => !order.is_settled)
    .reduce(
      (sum, order) =>
        sum + Number(order.captain_due ?? 0),
      0
    );

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
  const latestTransactions =
    allTransactions.slice(0, 5);

  // =====================================================
  // DATE
  // =====================================================

  const now = new Date();

  const dateText = now.toLocaleDateString(
    "ar-JO",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  const timeText = now.toLocaleTimeString(
    "ar-JO",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#F4F7FB]"
    >
      <div className="mx-auto w-full max-w-[1500px] px-3 py-4 sm:px-5 md:px-7 lg:px-8">

        {/* =================================================
            MOBILE / TOP HEADER
        ================================================= */}

        <header
          className="
            mb-4
            flex
            h-[72px]
            items-center
            justify-between
            rounded-2xl
            bg-white
            px-3
            shadow-sm
            ring-1
            ring-slate-100
            sm:h-[82px]
            sm:px-5
          "
        >
          {/* RIGHT */}

          <div className="flex items-center gap-3">

            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-full
                bg-blue-50
                text-blue-600
                sm:h-14
                sm:w-14
              "
            >
              <UserCircle2
                size={38}
                strokeWidth={1.7}
              />
            </div>

            <div className="hidden sm:block">

              <p className="text-sm font-black text-[#071D38]">
                {user.full_name}
              </p>

              <p className="text-xs text-slate-400">
                كابتن Dr.Drive
              </p>

            </div>

          </div>

          {/* CENTER */}

          <div className="text-center">

            <h1
              className="
                text-lg
                font-black
                text-[#071D38]
                sm:text-2xl
              "
            >
              لوحة تحكم الكابتن
            </h1>

            <p className="hidden text-xs text-slate-400 sm:block">
              Dr.Drive وصلني الآن
            </p>

          </div>

          {/* LEFT */}

          <div className="flex items-center gap-2">

            <button
              type="button"
              className="
                relative
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                bg-slate-50
                text-[#071D38]
                sm:h-14
                sm:w-14
              "
            >
              <Bell size={25} />

              <span
                className="
                  absolute
                  right-3
                  top-3
                  h-2.5
                  w-2.5
                  rounded-full
                  bg-red-500
                  ring-2
                  ring-white
                "
              />
            </button>

            <button
              type="button"
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                bg-slate-50
                text-[#071D38]
                lg:hidden
                sm:h-14
                sm:w-14
              "
            >
              <Menu size={28} />
            </button>

          </div>

        </header>

        {/* =================================================
            HERO
        ================================================= */}

        <section
          className="
            relative
            mb-5
            min-h-[430px]
            overflow-hidden
            rounded-[30px]
            bg-[#071D38]
            shadow-xl
            sm:min-h-[470px]
          "
        >

          {/* HERO IMAGE */}

          <div
            className="
              absolute
              inset-0
              bg-cover
              bg-center
            "
            style={{
              backgroundImage:
                "url('/dashboard-hero.png')",
            }}
          />

          {/* Dark overlay */}

          <div
            className="
              absolute
              inset-0
              bg-[#061B35]/30
            "
          />

          {/* Decorative circles */}

          <div
            className="
              absolute
              -right-32
              -top-32
              h-[420px]
              w-[420px]
              rounded-full
              bg-blue-500/10
            "
          />

          <div
            className="
              absolute
              -bottom-48
              left-20
              h-[450px]
              w-[450px]
              rounded-full
              bg-[#F5B82E]/10
            "
          />

          {/* HERO CONTENT */}

          <div
            className="
              relative
              z-10
              flex
              min-h-[430px]
              flex-col
              justify-between
              gap-8
              p-5
              sm:min-h-[470px]
              sm:p-8
              lg:p-10
            "
          >

            {/* TOP */}

            <div className="max-w-xl">

              <div
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-white/20
                  bg-black/20
                  px-4
                  py-2
                  text-xs
                  font-bold
                  text-white
                  backdrop-blur-sm
                "
              >

                <span className="h-2 w-2 rounded-full bg-green-400" />

                حسابك نشط

              </div>

              <h2
                className="
                  mt-5
                  text-3xl
                  font-black
                  leading-tight
                  text-white
                  sm:text-4xl
                  lg:text-5xl
                "
              >

                مرحباً بك يا كابتن

                <br />

                <span className="text-[#F5B82E]">
                  {user.full_name}
                </span>

              </h2>

              <p
                className="
                  mt-4
                  max-w-lg
                  text-sm
                  leading-7
                  text-white/80
                  sm:text-base
                "
              >
                أهلاً بك في بوابة كباتن Dr.Drive.
                تابع طلباتك، رصيدك ومستحقاتك من مكان واحد.
              </p>

              {/* DATE */}

              <div className="mt-5 flex flex-wrap gap-2">

                <div
                  className="
                    rounded-xl
                    bg-black/30
                    px-4
                    py-2
                    text-xs
                    font-bold
                    text-white
                    backdrop-blur-sm
                  "
                >
                  📅 {dateText}
                </div>

                <div
                  className="
                    rounded-xl
                    bg-black/30
                    px-4
                    py-2
                    text-xs
                    font-bold
                    text-white
                    backdrop-blur-sm
                  "
                >
                  🕐 {timeText}
                </div>

              </div>

            </div>

            {/* BOTTOM */}

            <div
              className="
                flex
                flex-col
                gap-4
                sm:flex-row
                sm:items-end
                sm:justify-between
              "
            >

              {/* BUTTONS */}

              <div className="flex flex-wrap gap-3">

                <Link
                  href="/dashboard/recharge"
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-2xl
                    bg-[#F5B82E]
                    px-5
                    py-3
                    text-sm
                    font-black
                    text-[#071D38]
                    shadow-lg
                    transition
                    hover:bg-yellow-300
                  "
                >
                  <Wallet size={19} />
                  شحن المحفظة
                </Link>

                <Link
                  href="/dashboard/orders"
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-2xl
                    border
                    border-white/30
                    bg-white/10
                    px-5
                    py-3
                    text-sm
                    font-black
                    text-white
                    backdrop-blur-sm
                    transition
                    hover:bg-white/20
                  "
                >
                  طلباتي
                  <ArrowLeft size={19} />
                </Link>

              </div>

              {/* WALLET HERO CARD */}

              <div
                className="
                  w-full
                  max-w-[330px]
                  rounded-[25px]
                  border
                  border-white/20
                  bg-blue-600/80
                  p-5
                  shadow-2xl
                  backdrop-blur-md
                  sm:p-6
                "
              >

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-sm font-bold text-white/80">
                      رصيد المحفظة
                    </p>

                    <p className="mt-1 text-xs text-white/60">
                      الرصيد المتاح حالياً
                    </p>

                  </div>

                  <div
                    className="
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-full
                      bg-white/20
                      text-white
                    "
                  >
                    <Wallet size={25} />
                  </div>

                </div>

                <div className="mt-5">

                  <span
                    className={`text-4xl font-black sm:text-5xl ${
                      walletBalance >= 0
                        ? "text-white"
                        : "text-red-200"
                    }`}
                  >
                    {walletBalance.toFixed(2)}
                  </span>

                  <span className="mr-2 text-lg font-bold text-white/70">
                    JD
                  </span>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            QUICK MAIN CARDS
        ================================================= */}

        <section
          className="
            mb-5
            grid
            grid-cols-1
            gap-4
            md:grid-cols-2
          "
        >

          {/* Recharge */}

          <Link
            href="/dashboard/recharge"
            className="
              group
              flex
              min-h-[150px]
              items-center
              justify-between
              rounded-[25px]
              bg-gradient-to-br
              from-green-400
              to-green-600
              p-6
              text-white
              shadow-lg
              transition
              hover:-translate-y-1
            "
          >

            <div>

              <p className="text-xl font-black">
                شحن المحفظة
              </p>

              <p className="mt-2 text-sm text-white/80">
                قم بشحن رصيدك للبدء باستقبال الطلبات
              </p>

            </div>

            <div
              className="
                flex
                h-16
                w-16
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-white/20
              "
            >
              <CreditCard size={34} />
            </div>

          </Link>

          {/* Withdraw */}

          <Link
            href="/dashboard/accounting"
            className="
              group
              flex
              min-h-[150px]
              items-center
              justify-between
              rounded-[25px]
              bg-gradient-to-br
              from-purple-500
              to-purple-700
              p-6
              text-white
              shadow-lg
              transition
              hover:-translate-y-1
            "
          >

            <div>

              <p className="text-xl font-black">
                طلب سحب المستحقات
              </p>

              <p className="mt-2 text-sm text-white/80">
                حول مستحقاتك إلى حسابك البنكي
              </p>

            </div>

            <div
              className="
                flex
                h-16
                w-16
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-white/20
              "
            >
              <CircleDollarSign size={34} />
            </div>

          </Link>

        </section>

        {/* =================================================
            STATISTICS
        ================================================= */}

        <section
          className="
            mb-5
            grid
            grid-cols-1
            gap-4
            sm:grid-cols-2
            lg:grid-cols-3
          "
        >

          {/* Earnings */}

          <div
            className="
              rounded-[22px]
              bg-white
              p-5
              shadow-sm
              ring-1
              ring-slate-100
            "
          >

            <div className="flex items-center gap-4">

              <div
                className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-full
                  bg-green-100
                  text-green-600
                "
              >
                <TrendingUp size={27} />
              </div>

              <div>

                <p className="text-sm font-bold text-slate-500">
                  إجمالي الأرباح
                </p>

                <p className="mt-1 text-2xl font-black text-green-600">
                  {totalEarnings.toFixed(2)}
                  <span className="mr-1 text-sm">
                    JD
                  </span>
                </p>

                <p className="text-xs text-slate-400">
                  هذا الأسبوع
                </p>

              </div>

            </div>

          </div>

          {/* Due */}

          <div
            className="
              rounded-[22px]
              bg-white
              p-5
              shadow-sm
              ring-1
              ring-slate-100
            "
          >

            <div className="flex items-center gap-4">

              <div
                className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-full
                  bg-orange-100
                  text-orange-500
                "
              >
                <CircleDollarSign size={27} />
              </div>

              <div>

                <p className="text-sm font-bold text-slate-500">
                  المستحقات غير المسددة
                </p>

                <p className="mt-1 text-2xl font-black text-orange-500">
                  {unpaidBalance.toFixed(2)}
                  <span className="mr-1 text-sm">
                    JD
                  </span>
                </p>

                <p className="text-xs text-slate-400">
                  متبقي الدفع
                </p>

              </div>

            </div>

          </div>

          {/* Orders */}

          <div
            className="
              rounded-[22px]
              bg-white
              p-5
              shadow-sm
              ring-1
              ring-slate-100
            "
          >

            <div className="flex items-center gap-4">

              <div
                className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-full
                  bg-blue-100
                  text-blue-600
                "
              >
                <ClipboardList size={27} />
              </div>

              <div>

                <p className="text-sm font-bold text-slate-500">
                  عدد الطلبات
                </p>

                <p className="mt-1 text-3xl font-black text-blue-600">
                  {totalOrders}
                </p>

                <p className="text-xs text-slate-400">
                  الطلبات الحالية
                </p>

              </div>

            </div>

          </div>

          {/* Wallet */}

          <div
            className="
              rounded-[22px]
              bg-white
              p-5
              shadow-sm
              ring-1
              ring-slate-100
            "
          >

            <div className="flex items-center gap-4">

              <div
                className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-full
                  bg-blue-100
                  text-blue-600
                "
              >
                <Wallet size={27} />
              </div>

              <div>

                <p className="text-sm font-bold text-slate-500">
                  رصيد المحفظة
                </p>

                <p
                  className={`mt-1 text-2xl font-black ${
                    walletBalance >= 0
                      ? "text-blue-600"
                      : "text-red-600"
                  }`}
                >
                  {walletBalance.toFixed(2)}
                  <span className="mr-1 text-sm">
                    JD
                  </span>
                </p>

                <p className="text-xs text-slate-400">
                  متاح للسحب
                </p>

              </div>

            </div>

          </div>

          {/* Recharge */}

          <Link
            href="/dashboard/recharge"
            className="
              rounded-[22px]
              bg-white
              p-5
              shadow-sm
              ring-1
              ring-slate-100
              transition
              hover:-translate-y-1
            "
          >

            <div className="flex items-center gap-4">

              <div
                className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-full
                  bg-purple-100
                  text-purple-600
                "
              >
                <CreditCard size={27} />
              </div>

              <div>

                <p className="text-sm font-bold text-slate-500">
                  شحن المحفظة
                </p>

                <p className="mt-1 font-black text-slate-800">
                  قم بشحن محفظتك
                </p>

                <p className="text-xs text-slate-400">
                  للبدء باستقبال الطلبات
                </p>

              </div>

            </div>

          </Link>

          {/* Withdraw */}

          <Link
            href="/dashboard/accounting"
            className="
              rounded-[22px]
              bg-white
              p-5
              shadow-sm
              ring-1
              ring-slate-100
              transition
              hover:-translate-y-1
            "
          >

            <div className="flex items-center gap-4">

              <div
                className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-full
                  bg-green-100
                  text-green-600
                "
              >
                <CircleDollarSign size={27} />
              </div>

              <div>

                <p className="text-sm font-bold text-slate-500">
                  طلب سحب المستحقات
                </p>

                <p className="mt-1 font-black text-slate-800">
                  تحويل مستحقاتك
                </p>

                <p className="text-xs text-slate-400">
                  إلى حسابك البنكي
                </p>

              </div>

            </div>

          </Link>

        </section>

        {/* =================================================
            THREE MAIN NAVIGATION CARDS
        ================================================= */}

        <section
          className="
            mb-5
            rounded-[28px]
            bg-[#071D38]
            p-4
            sm:p-6
          "
        >

          <div
            className="
              grid
              grid-cols-1
              gap-4
              md:grid-cols-3
            "
          >

            {/* Orders */}

            <Link
              href="/dashboard/orders"
              className="
                rounded-[24px]
                border
                border-white/10
                bg-[#12345C]
                p-6
                text-white
                shadow-lg
                transition
                hover:-translate-y-1
                hover:bg-[#17416F]
              "
            >

              <div
                className="
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-2xl
                  bg-blue-500/20
                  text-blue-300
                "
              >
                <ClipboardList size={34} />
              </div>

              <h3 className="mt-6 text-xl font-black">
                طلباتي
              </h3>

              <p className="mt-2 text-sm leading-6 text-white/60">
                عرض جميع طلباتك الحالية والسابقة
              </p>

              <div className="mt-5 text-xl">
                ←
              </div>

            </Link>

            {/* Accounting */}

            <Link
              href="/dashboard/accounting"
              className="
                rounded-[24px]
                border
                border-white/10
                bg-[#12345C]
                p-6
                text-white
                shadow-lg
                transition
                hover:-translate-y-1
                hover:bg-[#17416F]
              "
            >

              <div
                className="
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-2xl
                  bg-blue-500/20
                  text-blue-300
                "
              >
                <FileText size={34} />
              </div>

              <h3 className="mt-6 text-xl font-black">
                كشف الحساب
              </h3>

              <p className="mt-2 text-sm leading-6 text-white/60">
                عرض تفاصيل حسابك وكافة العمليات المالية
              </p>

              <div className="mt-5 text-xl">
                ←
              </div>

            </Link>

            {/* Profile */}

            <Link
              href="/dashboard/profile"
              className="
                rounded-[24px]
                border
                border-white/10
                bg-[#12345C]
                p-6
                text-white
                shadow-lg
                transition
                hover:-translate-y-1
                hover:bg-[#17416F]
              "
            >

              <div
                className="
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-2xl
                  bg-purple-500/20
                  text-purple-300
                "
              >
                <UserCircle2 size={34} />
              </div>

              <h3 className="mt-6 text-xl font-black">
                الملف الشخصي
              </h3>

              <p className="mt-2 text-sm leading-6 text-white/60">
                إدارة بياناتك الشخصية وتحديث معلوماتك
              </p>

              <div className="mt-5 text-xl">
                ←
              </div>

            </Link>

          </div>

        </section>

        {/* =================================================
            LATEST ORDERS
        ================================================= */}

        <section
          className="
            mb-5
            overflow-hidden
            rounded-[28px]
            bg-white
            shadow-sm
            ring-1
            ring-slate-100
          "
        >

          <div
            className="
              flex
              flex-col
              gap-3
              border-b
              border-slate-100
              p-5
              sm:flex-row
              sm:items-center
              sm:justify-between
              sm:p-6
            "
          >

            <div>

              <h2 className="text-xl font-black text-[#071D38]">
                آخر الطلبات
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                أحدث الطلبات المسجلة على حسابك
              </p>

            </div>

            <Link
              href="/dashboard/orders"
              className="
                inline-flex
                items-center
                gap-2
                text-sm
                font-bold
                text-blue-600
              "
            >
              عرض جميع الطلبات
              <ArrowLeft size={17} />
            </Link>

          </div>

          {/* Desktop table */}

          <div className="hidden overflow-x-auto md:block">

            <table className="w-full">

              <thead>

                <tr className="bg-blue-600 text-white">

                  <th className="px-6 py-4 text-right">
                    الطلب
                  </th>

                  <th className="px-6 py-4 text-right">
                    المنتج
                  </th>

                  <th className="px-6 py-4 text-right">
                    القيمة
                  </th>

                  <th className="px-6 py-4 text-right">
                    المستحق
                  </th>

                  <th className="px-6 py-4 text-right">
                    الحالة
                  </th>

                </tr>

              </thead>

              <tbody>

                {latestOrders.length > 0 ? (
                  latestOrders.map((order) => (

                    <tr
                      key={order.id}
                      className="border-b border-slate-100"
                    >

                      <td className="px-6 py-5">

                        <p className="font-bold">
                          #{order.id}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {new Date(
                            order.created_at
                          ).toLocaleString(
                            "ar-JO"
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
                        ).toFixed(2)} JD
                      </td>

                      <td className="px-6 py-5 font-bold text-green-600">
                        {Number(
                          order.captain_due ?? 0
                        ).toFixed(2)} JD
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
                      className="
                        px-6
                        py-12
                        text-center
                        text-slate-400
                      "
                    >
                      لا توجد طلبات حاليًا
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

          {/* Mobile orders */}

          <div className="divide-y divide-slate-100 md:hidden">

            {latestOrders.length > 0 ? (
              latestOrders.map((order) => (

                <div
                  key={order.id}
                  className="p-5"
                >

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="font-black text-[#071D38]">
                        طلب #{order.id}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {new Date(
                          order.created_at
                        ).toLocaleString(
                          "ar-JO"
                        )}
                      </p>

                    </div>

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

                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">

                    <div className="rounded-xl bg-slate-50 p-3">

                      <p className="text-xs text-slate-400">
                        القيمة
                      </p>

                      <p className="mt-1 font-black">
                        {Number(
                          order.amount
                        ).toFixed(2)} JD
                      </p>

                    </div>

                    <div className="rounded-xl bg-green-50 p-3">

                      <p className="text-xs text-slate-400">
                        المستحق
                      </p>

                      <p className="mt-1 font-black text-green-600">
                        {Number(
                          order.captain_due ?? 0
                        ).toFixed(2)} JD
                      </p>

                    </div>

                  </div>

                </div>

              ))
            ) : (

              <div className="p-10 text-center text-slate-400">
                لا توجد طلبات حاليًا
              </div>

            )}

          </div>

        </section>

        {/* =================================================
            TRANSACTIONS + SUPPORT
        ================================================= */}

        <section
          className="
            grid
            grid-cols-1
            gap-5
            lg:grid-cols-[1.5fr_1fr]
          "
        >

          {/* Transactions */}

          <div
            className="
              overflow-hidden
              rounded-[28px]
              bg-white
              shadow-sm
              ring-1
              ring-slate-100
            "
          >

            <div className="border-b border-slate-100 p-6">

              <h2 className="text-xl font-black text-[#071D38]">
                آخر العمليات
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                آخر الحركات على محفظتك
              </p>

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
                      px-5
                      py-5
                      sm:px-6
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
                          rounded-full
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

                        <p className="truncate font-bold text-[#071D38]">
                          {trx.description ??
                            "عملية مالية"}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {new Date(
                            trx.created_at
                          ).toLocaleString(
                            "ar-JO"
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
                      ).toFixed(2)} JD
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

          {/* Support */}

          <div
            className="
              relative
              overflow-hidden
              rounded-[28px]
              bg-[#071D38]
              p-7
              text-white
              shadow-xl
            "
          >

            <div
              className="
                absolute
                -left-20
                -top-20
                h-56
                w-56
                rounded-full
                bg-blue-500/10
              "
            />

            <div className="relative">

              <div
                className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  bg-[#F5B82E]
                  text-[#071D38]
                "
              >
                <Headphones size={27} />
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
                  text-[#071D38]
                "
              >
                الدعم الفني
                <ArrowLeft size={17} />
              </button>

            </div>

          </div>

        </section>

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer
          className="
            mt-6
            rounded-2xl
            bg-[#071D38]
            px-5
            py-5
            text-center
            text-sm
            text-white/60
          "
        >
          Dr.Drive وصلني الآن — بوابة الكباتن
        </footer>

      </div>
    </main>
  );
}
