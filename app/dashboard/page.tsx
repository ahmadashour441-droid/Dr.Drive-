import { cookies } from "next/headers";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  ClipboardList,
  CreditCard,
  FileText,
  Headphones,
  UserCircle,
  Wallet,
  TrendingUp,
  CircleDollarSign,
  Landmark,
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
  // الحسابات
  // =========================

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

  return (
    <main
      dir="rtl"
      className="
        min-h-screen
        bg-[#F3F6FA]
        text-[#12233F]
      "
    >

      <div className="mx-auto w-full max-w-[1500px]">

        {/* =====================================================
            HERO
        ===================================================== */}

        <section
          className="
            relative
            min-h-[430px]
            overflow-hidden
            bg-[#061B35]
          "
        >

          {/* صورة الخلفية */}

          <div
            className="
              absolute
              inset-0
              bg-cover
              bg-center
              bg-no-repeat
            "
            style={{
              backgroundImage:
                "url('/dashboard-hero.png')",
            }}
          />

          {/* طبقة داكنة حتى يظل النص واضح */}

          <div
            className="
              absolute
              inset-0
              bg-[#061B35]/45
            "
          />

          {/* المحتوى */}

          <div
            className="
              relative
              z-10
              flex
              min-h-[430px]
              flex-col
              justify-between
              p-6
              md:p-10
              lg:p-12
            "
          >

            {/* الترحيب */}

            <div className="max-w-[680px]">

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
                  text-sm
                  font-bold
                  text-white
                  backdrop-blur
                "
              >
                <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                حسابك نشط
              </div>

              <h1
                className="
                  mt-5
                  text-4xl
                  font-black
                  leading-tight
                  text-white
                  md:text-6xl
                "
              >
                👋 مرحباً بك يا كابتن
              </h1>

              <h2
                className="
                  mt-2
                  text-3xl
                  font-black
                  text-[#F5B82E]
                  md:text-5xl
                "
              >
                {user.full_name}
              </h2>

              <p
                className="
                  mt-5
                  max-w-xl
                  text-sm
                  leading-8
                  text-white/85
                  md:text-lg
                "
              >
                تابع طلباتك، رصيدك ومستحقاتك
                من مكان واحد.
              </p>

              {/* أزرار */}

              <div className="mt-7 flex flex-wrap gap-3">

                <Link
                  href="/dashboard/recharge"
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-2xl
                    bg-[#F5B82E]
                    px-6
                    py-3.5
                    font-black
                    text-[#061B35]
                    shadow-lg
                    transition
                    hover:scale-[1.02]
                  "
                >
                  <Wallet size={20} />
                  شحن المحفظة
                </Link>

                <Link
                  href="/dashboard/orders"
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-2xl
                    border
                    border-white/30
                    bg-white/10
                    px-6
                    py-3.5
                    font-black
                    text-white
                    backdrop-blur
                    transition
                    hover:bg-white/20
                  "
                >
                  طلباتي
                  <ArrowLeft size={20} />
                </Link>

              </div>

            </div>

          </div>
        </section>

        {/* =====================================================
            WALLET + WITHDRAW
        ===================================================== */}

        <section
          className="
            relative
            z-20
            -mt-10
            grid
            grid-cols-1
            gap-5
            px-4
            md:grid-cols-2
            md:px-8
          "
        >

          {/* المحفظة */}

          <div
            className="
              relative
              overflow-hidden
              rounded-[28px]
              bg-gradient-to-br
              from-[#2477E8]
              to-[#1851A9]
              p-6
              text-white
              shadow-2xl
            "
          >

            <div
              className="
                absolute
                -left-12
                -top-12
                h-40
                w-40
                rounded-full
                bg-white/10
              "
            />

            <div className="relative">

              <div className="flex items-center gap-4">

                <div
                  className="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-full
                    bg-white
                    text-blue-600
                    shadow
                  "
                >
                  <Wallet size={28} />
                </div>

                <div>

                  <p className="text-lg font-bold">
                    رصيد المحفظة
                  </p>

                  <p className="text-sm text-white/70">
                    الرصيد المتاح حالياً
                  </p>

                </div>

              </div>

              <div className="mt-7 flex items-end gap-2">

                <span
                  className="
                    text-5xl
                    font-black
                  "
                >
                  {walletBalance.toFixed(2)}
                </span>

                <span className="mb-2 text-lg font-bold">
                  JD
                </span>

              </div>

              <Link
                href="/dashboard/recharge"
                className="
                  mt-6
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-white
                  px-5
                  py-2.5
                  text-sm
                  font-black
                  text-blue-700
                "
              >
                <CreditCard size={18} />
                شحن الرصيد
              </Link>

            </div>
          </div>

          {/* سحب المستحقات */}

          <Link
            href="/dashboard/accounting"
            className="
              group
              relative
              overflow-hidden
              rounded-[28px]
              bg-gradient-to-br
              from-[#6B25D9]
              to-[#4B16A7]
              p-6
              text-white
              shadow-2xl
              transition
              hover:-translate-y-1
            "
          >

            <div
              className="
                absolute
                -right-12
                -top-12
                h-40
                w-40
                rounded-full
                bg-white/10
              "
            />

            <div className="relative flex h-full items-center justify-between">

              <div>

                <p className="text-2xl font-black">
                  طلب سحب المستحقات
                </p>

                <p className="mt-2 text-sm text-white/70">
                  حول مستحقاتك إلى حسابك البنكي
                </p>

                <div
                  className="
                    mt-6
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    bg-white/15
                    px-5
                    py-3
                    font-bold
                  "
                >
                  طلب سحب
                  <ArrowLeft size={18} />
                </div>

              </div>

              <div
                className="
                  flex
                  h-20
                  w-20
                  shrink-0
                  items-center
                  justify-center
                  rounded-3xl
                  bg-white/15
                "
              >
                <Landmark size={42} />
              </div>

            </div>

          </Link>

        </section>

        {/* =====================================================
            6 STAT CARDS
        ===================================================== */}

        <section
          className="
            grid
            grid-cols-1
            gap-4
            px-4
            pt-6
            sm:grid-cols-2
            lg:grid-cols-3
            md:px-8
          "
        >

          {/* الأرباح */}

          <StatCard
            title="إجمالي الأرباح"
            value={`${totalEarnings.toFixed(3)} JD`}
            subtitle="هذا الأسبوع"
            icon={<TrendingUp size={28} />}
            iconClass="bg-green-100 text-green-600"
          />

          {/* المستحقات */}

          <StatCard
            title="المستحقات غير مسددة"
            value={`${unpaidBalance.toFixed(3)} JD`}
            subtitle="متبقي الدفع"
            icon={<CircleDollarSign size={28} />}
            iconClass="bg-orange-100 text-orange-600"
          />

          {/* الطلبات */}

          <StatCard
            title="عدد الطلبات"
            value={String(totalOrders)}
            subtitle="هذا الأسبوع"
            icon={<ClipboardList size={28} />}
            iconClass="bg-blue-100 text-blue-600"
          />

          {/* الرصيد */}

          <StatCard
            title="رصيد المحفظة"
            value={`${walletBalance.toFixed(3)} JD`}
            subtitle="متاح للسحب"
            icon={<Wallet size={28} />}
            iconClass="bg-blue-100 text-blue-600"
          />

          {/* شحن */}

          <Link
            href="/dashboard/recharge"
            className="
              group
              rounded-[22px]
              bg-white
              p-5
              shadow-sm
              ring-1
              ring-slate-200
              transition
              hover:-translate-y-1
              hover:shadow-lg
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
                  rounded-2xl
                  bg-purple-100
                  text-purple-600
                "
              >
                <CreditCard size={28} />
              </div>

              <div>

                <p className="text-lg font-black text-[#12233F]">
                  شحن المحفظة
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  قم بشحن محفظتك للبدء باستقبال الطلبات
                </p>

              </div>

            </div>

          </Link>

          {/* السحب */}

          <Link
            href="/dashboard/accounting"
            className="
              group
              rounded-[22px]
              bg-white
              p-5
              shadow-sm
              ring-1
              ring-slate-200
              transition
              hover:-translate-y-1
              hover:shadow-lg
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
                  rounded-2xl
                  bg-green-100
                  text-green-600
                "
              >
                <Building2 size={28} />
              </div>

              <div>

                <p className="text-lg font-black text-[#12233F]">
                  طلب سحب المستحقات
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  حول مستحقاتك إلى حسابك البنكي
                </p>

              </div>

            </div>

          </Link>

        </section>

        {/* =====================================================
            MAIN THREE CARDS
        ===================================================== */}

        <section
          className="
            mx-4
            mt-6
            grid
            grid-cols-1
            gap-5
            rounded-[28px]
            bg-[#08264B]
            p-5
            md:mx-8
            md:grid-cols-3
            md:p-7
          "
        >

          {/* طلباتي */}

          <DashboardAction
            href="/dashboard/orders"
            title="طلباتي"
            description="عرض جميع طلباتك الحالية والسابقة"
            icon={<ClipboardList size={38} />}
          />

          {/* كشف الحساب */}

          <DashboardAction
            href="/dashboard/accounting"
            title="كشف الحساب"
            description="عرض تفاصيل حسابك وكافة العمليات المالية"
            icon={<FileText size={38} />}
          />

          {/* الملف الشخصي */}

          <DashboardAction
            href="/dashboard/profile"
            title="الملف الشخصي"
            description="إدارة بياناتك الشخصية وتحديث معلوماتك"
            icon={<UserCircle size={38} />}
          />

        </section>

        {/* =====================================================
            SUPPORT
        ===================================================== */}

        <section
          className="
            mx-4
            mt-6
            overflow-hidden
            rounded-[28px]
            bg-[#061B35]
            p-7
            text-white
            md:mx-8
          "
        >

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div className="flex items-center gap-4">

              <div
                className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-2xl
                  bg-[#F5B82E]
                  text-[#061B35]
                "
              >
                <Headphones size={28} />
              </div>

              <div>

                <h2 className="text-xl font-black">
                  تحتاج إلى مساعدة؟
                </h2>

                <p className="mt-1 text-sm text-white/60">
                  تواصل مع الإدارة لأي مشكلة في الطلبات أو الرصيد.
                </p>

              </div>

            </div>

            <button
              type="button"
              className="
                rounded-xl
                bg-white
                px-6
                py-3
                font-black
                text-[#061B35]
              "
            >
              الدعم الفني
            </button>

          </div>

        </section>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <footer
          className="
            mt-8
            flex
            flex-col
            items-center
            justify-between
            gap-3
            border-t
            border-slate-200
            px-6
            py-6
            text-sm
            text-slate-400
            md:flex-row
            md:px-8
          "
        >

          <div className="flex items-center gap-3">

            <img
              src="/logo.png"
              alt="Dr.Drive"
              className="h-10 w-auto object-contain"
            />

            <span>
              Dr.Drive وصلني الآن
            </span>

          </div>

          <span>
            © 2026 Dr.Drive — جميع الحقوق محفوظة
          </span>

        </footer>

      </div>
    </main>
  );
}


/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconClass,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  iconClass: string;
}) {
  return (
    <div
      className="
        rounded-[22px]
        bg-white
        p-5
        shadow-sm
        ring-1
        ring-slate-200
        transition
        hover:-translate-y-1
        hover:shadow-lg
      "
    >

      <div className="flex items-center justify-between">

        <div
          className={`
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            ${iconClass}
          `}
        >
          {icon}
        </div>

        <span className="text-xs font-bold text-slate-400">
          {title}
        </span>

      </div>

      <p className="mt-5 text-3xl font-black text-[#12233F]">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {subtitle}
      </p>

    </div>
  );
}


/* ============================================================
   DASHBOARD ACTION
============================================================ */

function DashboardAction({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="
        group
        rounded-[22px]
        border
        border-white/10
        bg-[#123664]
        p-6
        text-white
        transition
        hover:-translate-y-1
        hover:bg-[#174273]
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
        {icon}
      </div>

      <h3 className="mt-5 text-xl font-black">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-7 text-white/60">
        {description}
      </p>

      <div className="mt-5 flex items-center gap-2 text-sm font-bold text-[#F5B82E]">
        فتح
        <ArrowLeft size={17} />
      </div>

    </Link>
  );
}