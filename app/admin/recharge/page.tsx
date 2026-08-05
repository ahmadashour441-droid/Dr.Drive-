import RechargeActions from "@/app/components/RechargeActions";
import { supabaseServer } from "@/lib/supabaseServer";

export default async function RechargeRequestsPage() {

 const { data, error } =
  await supabaseServer
    .from("RechargeRequests")
    .select("*");

console.log("DATA:", data);
console.log("ERROR:", error);

const requests =
  data ?? [];

  return (
    <main className="p-8">

  <h1 className="mb-8 text-3xl font-bold">
    طلبات شحن الرصيد
  </h1>

  <div className="overflow-hidden rounded-2xl bg-white shadow">

    <table className="min-w-[1300px] w-full">

      <thead className="bg-gray-100">

        <tr>

          <th className="px-5 py-4 text-right">
            #
          </th>

          <th className="px-5 py-4 text-right">
            الكابتن
          </th>

          <th className="px-5 py-4 text-right">
            الهاتف
          </th>

          <th className="px-5 py-4 text-right">
            المبلغ
          </th>

          <th className="px-5 py-4 text-right">
            الوصل
          </th>

          <th className="px-5 py-4 text-right">
            الحالة
          </th>

          <th className="px-5 py-4 text-right">
            التاريخ
          </th>

          <th className="px-5 py-4 text-center">
            الإجراءات
          </th>

        </tr>

      </thead>

      <tbody>

     {requests.length > 0 ? (

  requests.map((request) => (

    <tr
      key={request.id}
      className="border-t hover:bg-gray-50"
    >

      <td className="px-5 py-4">
        {request.id}
      </td>

      <td className="px-5 py-4 font-medium">
        {request.user?.full_name}
      </td>

      <td className="px-5 py-4">
        {request.user?.phone}
      </td>

      <td className="px-5 py-4 font-bold text-green-600">
        {Number(request.amount).toFixed(2)} JD
      </td>

      <td className="px-5 py-4">

        <a
          href={request.receipt_image}
          target="_blank"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          عرض الوصل
        </a>

      </td>

      <td className="px-5 py-4">

        {request.status === "pending" && (
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-yellow-700">
            قيد المراجعة
          </span>
        )}

        {request.status === "approved" && (
          <span className="rounded-full bg-green-100 px-3 py-1 text-green-700">
            مقبول
          </span>
        )}

        {request.status === "rejected" && (
          <span className="rounded-full bg-red-100 px-3 py-1 text-red-700">
            مرفوض
          </span>
        )}

      </td>

      <td className="px-5 py-4">

        {new Date(
          request.created_at
        ).toLocaleString("ar-JO", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })}

      </td>

      <td className="px-5 py-4 text-center">

  {request.status === "pending" ? (

    <RechargeActions
      requestId={request.id}
    />

  ) : (

    <span className="text-gray-500">
      لا توجد إجراءات
    </span>

  )}

</td>

    </tr>

  ))

) : (

  <tr>

    <td
      colSpan={8}
      className="py-10 text-center text-gray-500"
    >

      لا توجد طلبات شحن.

    </td>

  </tr>

)}
      </tbody>

    </table>

  </div>

</main>
  );
}