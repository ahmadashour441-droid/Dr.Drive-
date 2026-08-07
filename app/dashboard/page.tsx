import { cookies } from "next/headers";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabaseServer";

export default async function DashboardPage() {

  const cookieStore = await cookies();

  const session =
    cookieStore.get("drdrive_session");

  if (!session) {
    return null;
  }

  const user =
    JSON.parse(session.value);
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

const { data: transactions } =
  await supabaseServer
    .from("BalanceTransactions")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_settled", false)
    .order("created_at", {
      ascending: false,
    });

const allOrders =
  orders ?? [];

const allTransactions =
  transactions ?? [];
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
  allTransactions.reduce(
    (sum, trx) =>
      trx.type === "credit"
        ? sum + Number(trx.amount)
        : sum - Number(trx.amount),
    0
  );

const totalEarnings =
  allTransactions
    .filter(
      (trx) => trx.type === "credit"
    )
    .reduce(
      (sum, trx) =>
        sum + Number(trx.amount),
      0
    );

return (

<main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">

<div>

<h1 className="text-3xl font-bold">
أهلاً {user.full_name}
</h1>

<p className="mt-2 text-gray-500">
مرحباً بك في لوحة تحكم الكابتن.
</p>

</div>

<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6">

<div className="rounded-2xl border bg-white p-6 shadow">

<p className="text-sm text-gray-500">
عدد الطلبات
</p>

<h2 className="mt-4 text-4xl font-bold">
{totalOrders}
</h2>

</div>

<div className="rounded-2xl border-2 border-green-500 bg-white p-6 shadow">

<p className="text-sm text-gray-500">
رصيد المحفظة
</p>

<h2
className={`mt-4 text-4xl font-bold ${
walletBalance >= 0
? "text-green-600"
: "text-red-600"
}`}
>
{walletBalance.toFixed(2)} JD
</h2>

<Link
href="/dashboard/recharge"
className="mt-6 block rounded-xl bg-green-600 py-3 text-center font-bold text-white hover:bg-green-700"
>
شحن الرصيد
</Link>

</div>

<div className="rounded-2xl border bg-white p-6 shadow">

<p className="text-sm text-gray-500">
المستحقات غير المسددة
</p>

<h2 className="mt-4 text-4xl font-bold text-orange-600">
{unpaidBalance.toFixed(2)} JD
</h2>

</div>

<div className="rounded-2xl border bg-white p-6 shadow">

<p className="text-sm text-gray-500">
الطلبات غير المسددة
</p>

<h2 className="mt-4 text-4xl font-bold text-blue-600">
{unpaidOrders}
</h2>

</div>

<div className="rounded-2xl border bg-white p-6 shadow">

<p className="text-sm text-gray-500">
إجمالي الأرباح
</p>

<h2 className="mt-4 text-4xl font-bold text-emerald-600">
{totalEarnings.toFixed(2)} JD
</h2>

</div>

</div>

<h2 className="text-2xl font-bold">
آخر العمليات
</h2>

<div className="overflow-x-auto rounded-2xl border bg-white shadow">

<table className="min-w-[900px] w-full">
  <tbody>
    <tr>
      <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
        لا توجد عمليات بعد
      </td>
    </tr>
  </tbody>
</table>

</div>

</main>

);
}
