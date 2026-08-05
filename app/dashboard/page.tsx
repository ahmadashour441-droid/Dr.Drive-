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
  <div className="space-y-8">

  <div>

    <h1 className="text-3xl font-bold">
      أهلاً {user.full_name}
    </h1>

    <p className="mt-2 text-gray-500">
      مرحباً بك في لوحة تحكم الكابتن.
    </p>

  </div>

  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">

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
  <div className="overflow-hidden rounded-2xl bg-white shadow">

  <div className="border-b px-6 py-5">

    <h2 className="text-xl font-bold">
      آخر العمليات
    </h2>

  </div>

  <div className="overflow-x-auto">

    <table className="min-w-[1100px]">

      <thead className="bg-gray-100">

        <tr>

          <th className="px-5 py-4 text-right">
            #
          </th>

          <th className="px-5 py-4 text-right">
            الوصف
          </th>

          <th className="px-5 py-4 text-right">
            التاريخ
          </th>

          <th className="px-5 py-4 text-right">
            النوع
          </th>

          <th className="px-5 py-4 text-right">
            القيمة
          </th>

        </tr>

      </thead>

      <tbody>

        {allTransactions.length > 0 ? (

          allTransactions.map((trx) => (

            <tr
              key={trx.id}
              className="border-t hover:bg-gray-50"
            >

              <td className="px-5 py-4">
                {trx.id}
              </td>

              <td className="px-5 py-4 font-medium">
                {trx.description}
              </td>

              <td className="px-5 py-4 text-sm text-gray-500">

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

              </td>

              <td className="px-5 py-4">

                {trx.type === "credit" ? (

                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                    دائن
                  </span>

                ) : (

                  <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                    مدين
                  </span>

                )}

              </td>

              <td
                className={`px-5 py-4 font-bold ${
                  trx.type === "credit"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >

                {trx.type === "credit"
                  ? "+"
                  : "-"}

                {Number(trx.amount).toFixed(2)} JD

              </td>

            </tr>

          ))

        ) : (

          <tr>

            <td
              colSpan={5}
              className="py-10 text-center text-gray-500"
            >

              لا توجد عمليات حتى الآن.

            </td>

          </tr>

        )}

      </tbody>

    </table>

  </div>

</div>
</div>
  );
}