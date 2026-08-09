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

  /* =========================
     ORDERS
  ========================= */

  const { data: orders } = await supabase
    .from("Orders")
    .select("*")
    .eq("captain_id", user.id)
    .order("created_at", { ascending: false });

  /* =========================
     WITHDRAWAL REQUESTS
  ========================= */

  const { data: withdrawalRequests } = await supabase
    .from("WithdrawalRequests")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  /* =========================
     FINANCIAL TRANSACTIONS
     ========================= */

  const { data: balanceTransactions } = await supabase
    .from("BalanceTransactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const allOrders = orders ?? [];
  const allWithdrawals = withdrawalRequests ?? [];
  const allTransactions = balanceTransactions ?? [];

  /* =========================
     STATISTICS
  ========================= */

  const totalOrders = allOrders.length;

  /*
   * إجمالي الأرباح = قيمة الطلبات نفسها.
   * الشحن والأرضية والخصومات لا تدخل في الأرباح.
   */
  const totalEarnings = allOrders.reduce(
    (sum: number, order: any) =>
      sum + Number(order.amount ?? 0),
    0
  );

  /*
   * المستحقات غير المسددة = مستحق الكابتن للطلبات
   * التي لم تتم تسويتها بعد.
   */
  const unpaidCaptainDue = allOrders
    .filter((order: any) => !order.is_settled)
    .reduce(
      (sum: number, order: any) =>
        sum + Number(order.captain_due ?? 0),
      0
    );

  const unpaidOrders = allOrders.filter(
    (order: any) => !order.is_settled
  ).length;

  /*
   * الرصيد الحالي للمحفظة.
   * يبقى كما هو حتى بعد إغلاق الأسبوع.
   */
  const { data: currentUser } = await supabase
    .from("Users")
    .select("wallet_balance")
    .eq("id", user.id)
    .single();

  const walletBalance =
    Number(currentUser?.wallet_balance ?? 0);

  const pendingWithdrawals = allWithdrawals
    .filter((request: any) => request.status === "pending")
    .reduce(
      (sum: number, request: any) =>
        sum + Number(request.amount ?? 0),
      0
    );

  const availableForWithdrawal = Math.max(
    0,
    unpaidCaptainDue - pendingWithdrawals
  );

  /* =========================
     WITHDRAWAL ACTION
  ========================= */

  async function requestWithdrawal(formData: FormData) {
    "use server";

    const cookieStore = await cookies();
    const session = cookieStore.get("drdrive_session");

    if (!session) {
      redirect("/");
    }

    const currentUser = JSON.parse(session.value);

    const amount = Number(formData.get("amount"));

    if (!amount || amount <= 0) {
      redirect("/dashboard/accounting?withdrawal=invalid");
    }

    /* Get unpaid orders */

    const { data: currentOrders } = await supabase
      .from("Orders")
      .select("captain_due, is_settled")
      .eq("captain_id", currentUser.id)
      .eq("is_settled", false);

    const availableDue =
      currentOrders?.reduce(
        (sum: number, order: any) =>
          sum + Number(order.captain_due ?? 0),
        0
      ) ?? 0;

    /* Get pending withdrawals */

    const { data: currentWithdrawals } = await supabase
      .from("WithdrawalRequests")
      .select("amount, status")
      .eq("user_id", currentUser.id)
      .eq("status", "pending");

    const pendingAmount =
      currentWithdrawals?.reduce(
        (sum: number, request: any) =>
          sum + Number(request.amount ?? 0),
        0
      ) ?? 0;

    const available =
      Math.max(0, availableDue - pendingAmount);

    /* Prevent withdrawing more than available */

    if (amount > available) {
      redirect("/dashboard/accounting?withdrawal=insufficient");
    }

    /* Create withdrawal request */

    const { error } = await supabase
      .from("WithdrawalRequests")
      .insert({
        user_id: currentUser.id,
        amount: Number(amount.toFixed(3)),
        status: "pending",
      });

    if (error) {
      console.error("Withdrawal request error:", error);

      redirect("/dashboard/accounting?withdrawal=error");
    }

    redirect("/dashboard/accounting?withdrawal=success");
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#EEF3F9] px-4 py-8 text-[#13294B] sm:px-6 lg:px-10"
    >
      <div className="mx-auto max-w-[1400px]">

        {/* =========================
            HEADER
        ========================= */}

        <div className="mb-8">
          <h1 className="text-3xl font-black">
            كشف الحساب
          </h1>

          <p className="mt-2 text-gray-500">
            جميع مستحقاتك وطلباتك.
          </p>
        </div>

        {/* =========================
            STATISTICS
        ========================= */}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-gray-500">
              عدد الطلبات
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              {totalOrders}
            </h2>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-gray-500">
              إجمالي الأرباح
            </p>

            <h2 className="mt-3 text-3xl font-bold text-blue-600">
              {totalEarnings.toFixed(2)} JD
            </h2>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-gray-500">
              المستحقات غير المسددة
            </p>

            <h2 className="mt-3 text-3xl font-bold text-red-600">
              {unpaidCaptainDue.toFixed(2)} JD
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              {unpaidOrders} طلب غير مسدد
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow">
            <p className="text-gray-500">
              رصيد المحفظة
            </p>

            <h2
              className={`mt-3 text-3xl font-bold ${
                walletBalance >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
              dir="ltr"
            >
              {walletBalance.toFixed(3)} JD
            </h2>
          </div>

        </div>

        {/* =========================
            WITHDRAWAL
        ========================= */}

        <div className="mt-8 rounded-2xl bg-gradient-to-br from-[#102F59] to-[#071E3D] p-6 text-white shadow-xl">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <h2 className="text-2xl font-black">
                طلب سحب المستحقات
              </h2>

              <p className="mt-2 text-sm text-white/70">
                يمكنك طلب سحب المستحقات غير المسددة.
              </p>

              <div className="mt-5">
                <p className="text-sm text-white/60">
                  المتاح للسحب
                </p>

                <div
                  className="mt-1 text-4xl font-black"
                  dir="ltr"
                >
                  {availableForWithdrawal.toFixed(3)}
                  <span className="mr-2 text-lg">
                    JD
                  </span>
                </div>
              </div>
            </div>

            <form
              action={requestWithdrawal}
              className="w-full max-w-md rounded-2xl bg-white/10 p-5 backdrop-blur"
            >

              <label className="mb-2 block text-sm font-bold">
                المبلغ المطلوب سحبه
              </label>

              <div className="flex gap-3">

                <input
                  type="number"
                  name="amount"
                  min="0.001"
                  max={availableForWithdrawal}
                  step="0.001"
                  placeholder="مثال: 10.000"
                  required
                  disabled={availableForWithdrawal <= 0}
                  className="min-w-0 flex-1 rounded-xl border border-white/20 bg-white px-4 py-3 text-left font-bold text-[#13294B] outline-none focus:border-[#F5B82E]"
                />

                <button
                  type="submit"
                  disabled={availableForWithdrawal <= 0}
                  className="rounded-xl bg-[#F5B82E] px-5 py-3 font-black text-[#071E3D] transition hover:bg-[#ffc94d] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  طلب السحب
                </button>

              </div>

              {availableForWithdrawal <= 0 && (
                <p className="mt-3 text-sm font-bold text-red-300">
                  لا يوجد رصيد متاح للسحب حالياً.
                </p>
              )}

            </form>

          </div>
        </div>

        {/* =========================
            PREVIOUS WITHDRAWAL REQUESTS
        ========================= */}

        {allWithdrawals.length > 0 && (
          <div className="mt-8 overflow-hidden rounded-xl bg-white shadow">

            <div className="border-b p-5">
              <h2 className="text-xl font-black">
                طلبات السحب السابقة
              </h2>
            </div>

            <div className="overflow-x-auto">

              <table className="min-w-[800px] w-full">

                <thead className="bg-slate-100">

                  <tr>

                    <th className="p-4 text-right">
                      المبلغ
                    </th>

                    <th className="p-4 text-right">
                      الحالة
                    </th>

                    <th className="p-4 text-right">
                      التاريخ
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {allWithdrawals.map(
                    (request: any) => (

                      <tr
                        key={request.id}
                        className="border-t"
                      >

                        <td className="p-4 font-bold">
                          {Number(
                            request.amount ?? 0
                          ).toFixed(3)}{" "}
                          JD
                        </td>

                        <td className="p-4">

                          {request.status === "pending" && (
                            <span className="font-bold text-yellow-600">
                              قيد المراجعة
                            </span>
                          )}

                          {request.status === "approved" && (
                            <span className="font-bold text-green-600">
                              تمت الموافقة
                            </span>
                          )}

                          {request.status === "rejected" && (
                            <span className="font-bold text-red-600">
                              مرفوض
                            </span>
                          )}

                        </td>

                        <td className="p-4 text-gray-500">
                          {new Intl.DateTimeFormat(
                            "ar-JO",
                            {
                              timeZone: "Asia/Amman",
                              dateStyle: "medium",
                              timeStyle: "short",
                            }
                          ).format(
                            new Date(
                              request.created_at
                            )
                          )}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>
          </div>
        )}

        {/* =========================
            ORDERS
        ========================= */}

        <div className="mt-8 overflow-hidden rounded-xl bg-white shadow">

          <div className="border-b p-5">
            <h2 className="text-xl font-black">
              الطلبات
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              جميع الطلبات الحالية والسابقة. إغلاق الأسبوع لا يحذف الطلبات.
            </p>
          </div>

          <div className="overflow-x-auto">

            <table className="min-w-[1300px] w-full">

              <thead className="bg-slate-100">

                <tr>

                  <th className="p-4 text-right">
                    #
                  </th>

                  <th className="p-4 text-right">
                    النوع
                  </th>

                  <th className="p-4 text-right">
                    قيمة الطلب
                  </th>

                  <th className="p-4 text-right">
                    مستحق الكابتن
                  </th>

                  <th className="p-4 text-right">
                    الحالة
                  </th>

                  <th className="p-4 text-right">
                    الأسبوع
                  </th>

                </tr>

              </thead>

              <tbody>

                {allOrders.map(
                  (order: any) => (

                    <tr
                      key={order.id}
                      className="border-t"
                    >

                      <td className="p-4">
                        {order.id}
                      </td>

                      <td className="p-4">
                        {order.order_type}
                      </td>

                      <td className="p-4 font-bold">
                        {Number(order.amount ?? 0).toFixed(2)} JD
                      </td>

                      <td className="p-4 font-semibold text-green-600">
                        {Number(order.captain_due ?? 0).toFixed(2)} JD
                      </td>

                      <td className="p-4">

                        {order.is_settled ? (
                          <span className="font-bold text-green-600">
                            تم التسديد
                          </span>
                        ) : (
                          <span className="font-bold text-red-600">
                            غير مسدد
                          </span>
                        )}

                      </td>

                      <td className="p-4">
                        {order.week_start}
                      </td>

                    </tr>

                  )
                )}

                {allOrders.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-10 text-center text-gray-500"
                    >
                      لا توجد طلبات.
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>

        </div>

        {/* =========================
            FINANCIAL TRANSACTIONS
        ========================= */}

        <div className="mt-8 overflow-hidden rounded-xl bg-white shadow">

          <div className="border-b p-5">
            <h2 className="text-xl font-black">
              الحركات المالية
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              هنا تظهر الأرضية الأسبوعية والخصومات والحركات المالية التي تمت على محفظتك.
            </p>
          </div>

          <div className="overflow-x-auto">

            <table className="min-w-[1100px] w-full">

              <thead className="bg-slate-100">

                <tr>

                  <th className="p-4 text-right">
                    التاريخ
                  </th>

                  <th className="p-4 text-right">
                    الوصف
                  </th>

                  <th className="p-4 text-right">
                    النوع
                  </th>

                  <th className="p-4 text-right">
                    القيمة
                  </th>

                  <th className="p-4 text-right">
                    الأسبوع
                  </th>

                  <th className="p-4 text-right">
                    الحالة
                  </th>

                </tr>

              </thead>

              <tbody>

                {allTransactions.map(
                  (trx: any) => (

                    <tr
                      key={trx.id}
                      className="border-t"
                    >

                      <td className="p-4 text-gray-500">
                        {trx.created_at
                          ? new Intl.DateTimeFormat(
                              "ar-JO",
                              {
                                timeZone: "Asia/Amman",
                                dateStyle: "medium",
                                timeStyle: "short",
                              }
                            ).format(
                              new Date(trx.created_at)
                            )
                          : "-"}
                      </td>

                      <td className="p-4 font-semibold">
                        {trx.description ?? "-"}
                      </td>

                      <td className="p-4">
                        {trx.type === "debit" ? (
                          <span className="font-bold text-red-600">
                            خصم
                          </span>
                        ) : (
                          <span className="font-bold text-green-600">
                            إضافة
                          </span>
                        )}
                      </td>

                      <td className="p-4 font-black">
                        {trx.type === "debit" ? "-" : "+"}
                        {Number(trx.amount ?? 0).toFixed(3)} JD
                      </td>

                      <td className="p-4">
                        {trx.week_start ?? "-"}
                      </td>

                      <td className="p-4">
                        {trx.is_settled ? (
                          <span className="font-bold text-green-600">
                            مغلق
                          </span>
                        ) : (
                          <span className="font-bold text-yellow-600">
                            حالي
                          </span>
                        )}
                      </td>

                    </tr>

                  )
                )}

                {allTransactions.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-10 text-center text-gray-500"
                    >
                      لا توجد حركات مالية.
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>
    </main>
  );
}