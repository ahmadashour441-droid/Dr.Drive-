import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default async function CaptainAccountingPage() {
  const cookieStore = await cookies();

  const session = cookieStore.get("drdrive_session");

  if (!session) {
    redirect("/");
  }

  const user = JSON.parse(session.value);

  const { data: orders } = await supabase
    .from("Orders")
    .select("*")
    .eq("captain_id", user.id)
    .order("created_at", { ascending: false });

  const totalOrders = orders?.length ?? 0;

  const totalAmount =
    orders?.reduce(
      (sum: number, order: any) => sum + Number(order.amount ?? 0),
      0
    ) ?? 0;

  const totalCaptainDue =
    orders?.reduce(
      (sum: number, order: any) => sum + Number(order.captain_due ?? 0),
      0
    ) ?? 0;

  const unpaidOrders =
    orders?.filter((o: any) => !o.is_settled).length ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          كشف الحساب
        </h1>

        <p className="mt-2 text-gray-500">
          جميع مستحقاتك وطلباتك.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-gray-500">عدد الطلبات</p>
          <h2 className="mt-3 text-3xl font-bold">
            {totalOrders}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-gray-500">إجمالي قيمة الطلبات</p>
          <h2 className="mt-3 text-3xl font-bold">
            {totalAmount.toFixed(2)} JD
          </h2>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-gray-500">مستحقاتك</p>
          <h2 className="mt-3 text-3xl font-bold text-green-600">
            {totalCaptainDue.toFixed(2)} JD
          </h2>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-gray-500">غير مسدد</p>
          <h2 className="mt-3 text-3xl font-bold text-red-600">
            {unpaidOrders}
          </h2>
        </div>

      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow">

        <table className="min-w-full">

          <thead className="bg-slate-100">

            <tr>

              <th className="p-4 text-right">#</th>
              <th className="p-4 text-right">النوع</th>
              <th className="p-4 text-right">القيمة</th>
              <th className="p-4 text-right">المستحق</th>
              <th className="p-4 text-right">الحالة</th>
              <th className="p-4 text-right">الأسبوع</th>

            </tr>

          </thead>

          <tbody>

            {orders?.map((order: any) => (

              <tr
                key={order.id}
                className="border-t"
              >

                <td className="p-4">{order.id}</td>

                <td className="p-4">
                  {order.order_type}
                </td>

                <td className="p-4">
                  {order.amount} JD
                </td>

                <td className="p-4 font-semibold text-green-600">
                  {order.captain_due} JD
                </td>

                <td className="p-4">
                  {order.is_settled ? (
                    <span className="text-green-600">
                      تم التسديد
                    </span>
                  ) : (
                    <span className="text-red-600">
                      غير مسدد
                    </span>
                  )}
                </td>

                <td className="p-4">
                  {order.week_start}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}