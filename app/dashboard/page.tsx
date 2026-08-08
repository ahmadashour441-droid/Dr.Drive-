import { cookies } from "next/headers";
import Link from "next/link";
import {
  ArrowLeft,
  ClipboardList,
  FileText,
  Headphones,
  UserCircle,
  Wallet,
  TrendingUp,
  CircleDollarSign,
  Landmark,
  CalendarDays,
  Clock3,
  EyeOff,
} from "lucide-react";

import { supabaseServer } from "@/lib/supabaseServer";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("drdrive_session");

  if (!session) return null;

  const user = JSON.parse(session.value);

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
    .order("created_at", { ascending: false });

  const { data: transactions } = await supabaseServer
    .from("BalanceTransactions")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_settled", false)
    .order("created_at", { ascending: false });

  const allOrders = orders ?? [];
  const allTransactions = transactions ?? [];

  const totalOrders = allOrders.length;

  const walletBalance = allTransactions.reduce((sum, trx) => {
    return trx.type === "credit"
      ? sum + Number(trx.amount)
      : sum - Number(trx.amount);
  }, 0);

  const unpaidBalance = allOrders.reduce(
    (sum, order) => sum + Number(order.captain_due ?? 0),
    0
  );

  // أرباح الكابتن هذا الأسبوع تأتي من مستحقات الطلبات.
  // حركات الكابتن في BalanceTransactions تُسجل كـ debit،
  // لذلك الاعتماد على credit هنا كان يعرض الأرباح 0.000.
  const totalEarnings = allOrders.reduce(
    (sum, order) => sum + Number(order.captain_due ?? 0),
    0
  );

  const now = new Date();

  const dateText = new Intl.DateTimeFormat("ar-JO", {
    timeZone: "Asia/Amman",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);

  const timeText = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Amman",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(now);

  return (
    <main
      dir="rtl"
      className="min-h-screen overflow-x-hidden bg-[#EEF3F9] text-[#13294B]"
    >
      <div className="mx-auto w-full max-w-[1536px]">

        {/* ========================= HERO ========================= */}
        <section className="relative overflow-hidden bg-[#0A2C53]">
          <div
            className="absolute inset-0 bg-center bg-no-repeat bg-[length:100%_auto] lg:bg-cover"
            style={{ backgroundImage: "url('/dashboard-hero.png')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A2C53]/80 via-[#0A2C53]/35 to-[#0A2C53]/25" />
          <div className="absolute inset-0 bg-black/10" />

          <div className="relative grid min-h-[500px] grid-cols-1 gap-6 px-4 py-6 sm:px-8 lg:grid-cols-[1fr_520px] lg:gap-10 lg:px-12 lg:py-10">

            {/* Welcome */}
            <div className="flex flex-col justify-center text-white">
              <p className="mb-4 text-2xl font-bold text-white/95 sm:text-3xl">
                👋 مرحباً بك يا كابتن
              </p>

              <h1 className="text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
                {user.full_name}
              </h1>

              <p className="mt-5 max-w-xl text-base leading-8 text-white/80 sm:text-lg">
                نتمنى لك يوماً موفقاً وآمناً
              </p>

              <div className="mt-7 flex flex-wrap gap-2.5">
                <div className="inline-flex items-center gap-2 rounded-xl bg-black/30 px-4 py-2.5 text-sm font-bold text-white backdrop-blur">
                  <CalendarDays size={18} />
                  {dateText}
                </div>
                <div className="inline-flex items-center gap-2 rounded-xl bg-black/30 px-4 py-2.5 text-sm font-bold text-white backdrop-blur">
                  <Clock3 size={18} />
                  {timeText}
                </div>
              </div>
            </div>

            {/* Wallet / primary actions */}
            <div className="flex flex-col justify-center">
              <div className="rounded-[24px] border border-white/25 bg-gradient-to-br from-[#3B8BEA]/95 to-[#1851A9]/95 p-4 sm:p-5 text-white shadow-[0_25px_55px_rgba(0,0,0,.25)] backdrop-blur sm:p-7">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white sm:h-14 sm:w-14 text-[#2777DF] shadow-lg">
                    <Wallet size={25} />
                  </div>

                  <div>
                    <p className="text-xl font-black">رصيد المحفظة</p>
                    <p className="mt-1 text-sm text-white/70">
                      الرصيد المتاح حالياً
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-end justify-end gap-2" dir="ltr">
                  <span className="text-4xl font-black tracking-tight sm:text-5xl">
                    {walletBalance.toFixed(3)}
                  </span>
                  <span className="mb-1 text-base font-bold">JD</span>
                </div>

                <div className="mt-2 flex justify-end">
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-white/80">
                    <EyeOff size={18} />
                    عرض الرصيد
                  </span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <Link
                  href="/dashboard/recharge"
                  className="flex min-h-[105px] flex-col items-center justify-center rounded-[22px] bg-gradient-to-br from-[#63D65D] to-[#35A946] p-5 text-center text-white shadow-xl transition hover:-translate-y-1"
                >
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20">
                    <Wallet size={25} />
                  </div>
                  <span className="text-base font-black">شحن المحفظة</span>
                </Link>

                <Link
                  href="/dashboard/accounting"
                  className="flex min-h-[105px] flex-col items-center justify-center rounded-[22px] bg-gradient-to-br from-[#8B3BE6] to-[#5B19B8] p-5 text-center text-white shadow-xl transition hover:-translate-y-1"
                >
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20">
                    <Landmark size={25} />
                  </div>
                  <span className="text-base font-black">طلب سحب المستحقات</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========================= STAT CARDS ========================= */}
        <section className="grid grid-cols-1 gap-3 px-4 py-5 sm:grid-cols-2 lg:grid-cols-3 lg:px-12">

          <StatCard
            title="إجمالي الأرباح"
            value={`${totalEarnings.toFixed(3)}`}
            suffix="JD"
            subtitle="هذا الأسبوع"
            icon={<TrendingUp size={32} />}
          />

          <StatCard
            title="المستحقات غير مسددة"
            value={`${unpaidBalance.toFixed(3)}`}
            suffix="JD"
            subtitle="متبقي الدفع"
            icon={<CircleDollarSign size={32} />}
          />

          <StatCard
            title="عدد الطلبات"
            value={String(totalOrders)}
            suffix=""
            subtitle="هذا الأسبوع"
            icon={<ClipboardList size={32} />}
          />

        </section>

        {/* ========================= MAIN ACTIONS ========================= */}
        <section className="mx-5 rounded-[30px] bg-gradient-to-br from-[#102F59] to-[#071E3D] p-4 shadow-[0_12px_28px_rgba(7,30,61,.18)] sm:p-5 lg:mx-12">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

            <DashboardAction
              href="/dashboard/orders"
              title="طلباتي"
              description="عرض جميع طلباتك الحالية والسابقة"
              icon={<ClipboardList size={45} />}
            />

            <DashboardAction
              href="/dashboard/accounting"
              title="كشف الحساب"
              description="عرض تفاصيل حسابك وكافة العمليات المالية"
              icon={<FileText size={45} />}
            />

            <DashboardAction
              href="/dashboard/profile"
              title="الملف الشخصي"
              description="إدارة بياناتك الشخصية وتحديث معلوماتك"
              icon={<UserCircle size={45} />}
            />

          </div>
        </section>

        {/* ========================= SUPPORT ========================= */}
        <section className="mx-5 mt-4 overflow-hidden rounded-[24px] bg-[#071C37] p-4 text-white shadow-lg sm:p-5 lg:mx-12">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#F5B82E] text-[#071C37]">
                <Headphones size={28} />
              </div>
              <div>
                <h2 className="text-xl font-black">تحتاج إلى مساعدة؟</h2>
                <p className="mt-1 text-sm text-white/60">
                  تواصل مع الإدارة لأي مشكلة في الطلبات أو الرصيد.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="rounded-xl bg-white px-6 py-3 font-black text-[#071C37] transition hover:bg-slate-100"
            >
              الدعم الفني
            </button>
          </div>
        </section>

        {/* ========================= FOOTER ========================= */}
        <footer className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-200 px-5 py-7 text-sm text-slate-400 sm:flex-row lg:px-12">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Dr.Drive"
              className="h-10 w-auto object-contain"
            />
            <span>Dr.Drive وصلني الآن</span>
          </div>
          <span>© 2026 Dr.Drive — جميع الحقوق محفوظة</span>
        </footer>
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  suffix,
  subtitle,
  icon,
}: {
  title: string;
  value: string;
  suffix: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="group min-h-[185px] rounded-[22px] border border-white/10 bg-gradient-to-br from-[#173E70] to-[#0D2D56] p-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.06),0_10px_24px_rgba(7,30,61,.14)] transition hover:-translate-y-1 hover:from-[#1A477F] hover:to-[#103766]">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#285694] text-[#8CB8FF] shadow-inner">
        {icon}
      </div>

      <h3 className="mt-4 text-xl font-black">{title}</h3>

      <div className="mt-3 flex items-end gap-2" dir="ltr">
        <span className="text-3xl font-black tracking-tight text-white">
          {value}
        </span>
        {suffix && (
          <span className="mb-1 text-base font-bold text-white/80">
            {suffix}
          </span>
        )}
      </div>

      <p className="mt-2 text-sm font-bold text-white/60">
        {subtitle}
      </p>
    </div>
  );
}

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
      className="group min-h-[185px] rounded-[22px] border border-white/10 bg-gradient-to-br from-[#173E70] to-[#0D2D56] p-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.06)] transition hover:-translate-y-1 hover:from-[#1A477F] hover:to-[#103766]"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#285694] text-[#8CB8FF] shadow-inner">
        {icon}
      </div>

      <h3 className="mt-4 text-xl font-black">{title}</h3>

      <p className="mt-2 max-w-xs text-sm leading-6 text-white/65">
        {description}
      </p>

      <div className="mt-3 flex items-center gap-2 text-sm font-black text-[#F5B82E]">
        فتح
        <ArrowLeft size={18} />
      </div>
    </Link>
  );
}