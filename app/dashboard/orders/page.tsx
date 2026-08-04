import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";
import { supabaseServer } from "@/lib/supabaseServer";

export default async function OrdersPage() {
  const cookieStore = await cookies();

  const session = cookieStore.get("drdrive_session");

  if (!session) return null;

  const user = JSON.parse(session.value);

  const { data, error } = await supabaseServer
    .from("Orders")
    .select("*")
    .eq("captain_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
  }

  const orders = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          طلباتي
        </h1>

        <p className="mt-2 text-gray-500">
          جميع الطلبات الخاصة بك.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-right">#</th>
              <th className="p-4 text-right">العميل</th>
              <th className="p-4 text-right">الهاتف</th>
              <th className="p-4 text-right">النوع</th>
              <th className="p-4 text-right">المبلغ</th>
              <th className="p-4 text-right">المستحق</th>
              <th className="p-4 text-right">الحالة</th>
              <th className="p-4 text-right">التاريخ</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-t hover:bg-slate-50"
              >
                <td className="p-4">{order.id}</td>

                <td className="p-4">
                  {order.customer_name}
                </td>

                <td className="p-4">
                  {order.customer_phone || "-"}
                </td>

                <td className="p-4">
                  {order.order_type}
                </td>

                <td className="p-4">
                  {Number(order.amount).toFixed(2)} JD
                </td>

                <td className="p-4 font-semibold text-green-600">
                  {Number(order.captain_due).toFixed(2)} JD
                </td>

                <td className="p-4">
                  {order.is_settled ? (
                    <span className="rounded bg-green-100 px-3 py-1 text-green-700">
                      تم التسديد
                    </span>
                  ) : (
                    <span className="rounded bg-yellow-100 px-3 py-1 text-yellow-700">
                      غير مسدد
                    </span>
                  )}
                </td>

                <td className="p-4">
                  {new Date(order.created_at).toLocaleDateString("ar-JO")}
                </td>
              </tr>
            ))}

            {orders.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="p-8 text-center text-gray-500"
                >
                  لا توجد طلبات.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}